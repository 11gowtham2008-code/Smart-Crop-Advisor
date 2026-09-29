import {
  CropDataSample,
  CropModelStats,
  CropPredictionScore,
  EvaluationMetrics,
  FeatureContribution,
  FeatureStats,
  PerCropMetrics,
  PredictionResult,
  SoilWeatherInput,
} from '../types/crop';

const FEATURE_KEYS: (keyof SoilWeatherInput)[] = [
  'nitrogen',
  'phosphorus',
  'potassium',
  'temperature',
  'humidity',
  'ph',
  'rainfall',
];

const CSV_TO_INPUT_KEY: Record<string, keyof SoilWeatherInput> = {
  N: 'nitrogen',
  P: 'phosphorus',
  K: 'potassium',
  temperature: 'temperature',
  humidity: 'humidity',
  ph: 'ph',
  rainfall: 'rainfall',
};

export class GaussianNaiveBayesClassifier {
  private classes: string[] = [];
  private classStats: Map<string, CropModelStats> = new Map();
  private trainSet: CropDataSample[] = [];
  private testSet: CropDataSample[] = [];
  private evaluation: EvaluationMetrics | null = null;
  private isTrained: boolean = false;

  constructor() {}

  /**
   * Train Gaussian Naive Bayes with an 80/20 train-test split
   */
  public train(dataset: CropDataSample[], trainRatio: number = 0.8): EvaluationMetrics {
    if (!dataset || dataset.length === 0) {
      throw new Error('Dataset cannot be empty.');
    }

    // Stratified 80/20 train/test split to ensure balanced representation of all crops
    const samplesByClass = new Map<string, CropDataSample[]>();
    for (const sample of dataset) {
      const cls = sample.label.trim();
      if (!samplesByClass.has(cls)) {
        samplesByClass.set(cls, []);
      }
      samplesByClass.get(cls)!.push(sample);
    }

    const train: CropDataSample[] = [];
    const test: CropDataSample[] = [];

    for (const [, samples] of samplesByClass.entries()) {
      const splitIdx = Math.floor(samples.length * trainRatio);
      // First 80% to train, remaining 20% to test
      train.push(...samples.slice(0, splitIdx));
      test.push(...samples.slice(splitIdx));
    }

    this.trainSet = train;
    this.testSet = test;
    this.classes = Array.from(samplesByClass.keys()).sort();
    this.classStats.clear();

    const totalTrainCount = train.length;

    // Calculate mean and variance for each class and each feature
    for (const cls of this.classes) {
      const classSamples = train.filter((s) => s.label.trim() === cls);
      const sampleCount = classSamples.length;
      const prior = sampleCount / totalTrainCount;

      const features: Record<keyof SoilWeatherInput, FeatureStats> = {} as any;

      for (const feat of FEATURE_KEYS) {
        // Map feature name to sample property
        const values = classSamples.map((s) => {
          switch (feat) {
            case 'nitrogen':
              return s.N;
            case 'phosphorus':
              return s.P;
            case 'potassium':
              return s.K;
            case 'temperature':
              return s.temperature;
            case 'humidity':
              return s.humidity;
            case 'ph':
              return s.ph;
            case 'rainfall':
              return s.rainfall;
          }
        });

        const mean = values.reduce((sum, v) => sum + v, 0) / sampleCount;
        // Variance with Bessel's correction or sample variance + numerical epsilon 1e-9
        const rawVar =
          values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
          Math.max(1, sampleCount - 1);
        const variance = Math.max(rawVar, 1e-9);
        const std = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);

        features[feat] = { mean, variance, std, min, max };
      }

      this.classStats.set(cls, {
        crop: cls,
        sampleCount,
        prior,
        features,
      });
    }

    this.isTrained = true;
    this.evaluation = this.evaluate(this.testSet, dataset.length);
    return this.evaluation;
  }

  /**
   * Predict crop suitability given 7 parameters
   */
  public predict(input: SoilWeatherInput): PredictionResult {
    if (!this.isTrained || this.classStats.size === 0) {
      throw new Error('Model has not been trained yet.');
    }

    const scores: CropPredictionScore[] = [];

    for (const cls of this.classes) {
      const stats = this.classStats.get(cls)!;
      let logLikelihoodSum = 0;
      const contributions: FeatureContribution[] = [];

      for (const feat of FEATURE_KEYS) {
        const val = input[feat];
        const featStat = stats.features[feat];
        const { mean, variance, std } = featStat;

        // Gaussian log likelihood formula:
        // -0.5 * ln(2 * pi * var) - ((x - mean)^2) / (2 * var)
        const logLikelihood =
          -0.5 * Math.log(2 * Math.PI * variance) -
          Math.pow(val - mean, 2) / (2 * variance);

        logLikelihoodSum += logLikelihood;

        const zScore = Math.abs(val - mean) / std;
        const suitabilityScore = Math.min(
          100,
          Math.max(0, Math.round(Math.exp(-0.5 * Math.pow(zScore, 2)) * 100))
        );

        let status: 'optimal' | 'acceptable' | 'stress' = 'optimal';
        if (zScore > 2.5) {
          status = 'stress';
        } else if (zScore > 1.25) {
          status = 'acceptable';
        }

        contributions.push({
          featureName: feat,
          inputValue: val,
          cropMean: parseFloat(mean.toFixed(2)),
          cropStd: parseFloat(std.toFixed(2)),
          zScore: parseFloat(zScore.toFixed(2)),
          logLikelihood: parseFloat(logLikelihood.toFixed(2)),
          suitabilityScore,
          status,
        });
      }

      const logPosterior = Math.log(stats.prior) + logLikelihoodSum;

      scores.push({
        crop: cls,
        confidence: 0, // Will be computed after softmax
        logPosterior,
        featureContributions: contributions,
      });
    }

    // Softmax normalization using log-sum-exp trick
    const maxLogPosterior = Math.max(...scores.map((s) => s.logPosterior));
    const expPosteriors = scores.map((s) =>
      Math.exp(s.logPosterior - maxLogPosterior)
    );
    const sumExp = expPosteriors.reduce((sum, val) => sum + val, 0);

    for (let i = 0; i < scores.length; i++) {
      const prob = (expPosteriors[i] / sumExp) * 100;
      scores[i].confidence = parseFloat(prob.toFixed(1));
    }

    // Sort descending by confidence
    scores.sort((a, b) => b.confidence - a.confidence);

    const winner = scores[0];
    const runnerUp = scores[1];

    // Build head-to-head comparison
    let runnerUpComparison: PredictionResult['runnerUpComparison'] = undefined;
    if (runnerUp) {
      const winnerStats = this.classStats.get(winner.crop)!;
      const runnerStats = this.classStats.get(runnerUp.crop)!;

      const factors = FEATURE_KEYS.map((feat) => {
        const val = input[feat];
        const wMean = winnerStats.features[feat].mean;
        const wStd = winnerStats.features[feat].std;
        const rMean = runnerStats.features[feat].mean;
        const rStd = runnerStats.features[feat].std;

        const wZ = Math.abs(val - wMean) / wStd;
        const rZ = Math.abs(val - rMean) / rStd;

        let bestAdvantage = '';
        if (wZ < rZ - 0.5) {
          bestAdvantage = `${winner.crop} matches ${feat} much closer (Z-score: ${wZ.toFixed(1)} vs ${rZ.toFixed(1)})`;
        } else if (rZ < wZ - 0.5) {
          bestAdvantage = `${runnerUp.crop} has closer ${feat}, but overall parameters strongly favored ${winner.crop}`;
        } else {
          bestAdvantage = `Both crops tolerate similar ${feat} ranges`;
        }

        return {
          feature: feat,
          inputValue: val,
          bestCropMean: parseFloat(wMean.toFixed(1)),
          runnerUpMean: parseFloat(rMean.toFixed(1)),
          bestAdvantage,
        };
      });

      runnerUpComparison = {
        runnerUpCrop: runnerUp.crop,
        runnerUpConfidence: runnerUp.confidence,
        comparisonFactors: factors,
      };
    }

    return {
      bestCrop: winner.crop,
      confidence: winner.confidence,
      top3: scores.slice(0, 3),
      allScores: scores,
      featureBreakdown: winner.featureContributions,
      runnerUpComparison,
      inputSnapshot: { ...input },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluate the model on test set: Overall accuracy, per-crop metrics, confusion matrix
   */
  public evaluate(testSet: CropDataSample[], totalOriginalSamples?: number): EvaluationMetrics {
    const classCount = this.classes.length;
    const classToIndex = new Map<string, number>();
    this.classes.forEach((c, idx) => classToIndex.set(c, idx));

    // Initialize confusion matrix: [actual][predicted]
    const matrix: number[][] = Array.from({ length: classCount }, () =>
      Array(classCount).fill(0)
    );

    let totalCorrect = 0;
    const supportMap = new Map<string, number>();
    const tpMap = new Map<string, number>();
    const fpMap = new Map<string, number>();
    const fnMap = new Map<string, number>();

    for (const c of this.classes) {
      supportMap.set(c, 0);
      tpMap.set(c, 0);
      fpMap.set(c, 0);
      fnMap.set(c, 0);
    }

    for (const sample of testSet) {
      const actualCls = sample.label.trim();
      const actualIdx = classToIndex.get(actualCls);
      if (actualIdx === undefined) continue;

      supportMap.set(actualCls, (supportMap.get(actualCls) || 0) + 1);

      const input: SoilWeatherInput = {
        nitrogen: sample.N,
        phosphorus: sample.P,
        potassium: sample.K,
        temperature: sample.temperature,
        humidity: sample.humidity,
        ph: sample.ph,
        rainfall: sample.rainfall,
      };

      const pred = this.predict(input);
      const predCls = pred.bestCrop;
      const predIdx = classToIndex.get(predCls);

      if (predIdx !== undefined) {
        matrix[actualIdx][predIdx] += 1;
        if (actualCls === predCls) {
          totalCorrect++;
          tpMap.set(actualCls, (tpMap.get(actualCls) || 0) + 1);
        } else {
          fnMap.set(actualCls, (fnMap.get(actualCls) || 0) + 1);
          fpMap.set(predCls, (fpMap.get(predCls) || 0) + 1);
        }
      }
    }

    const overallAccuracy =
      testSet.length > 0 ? (totalCorrect / testSet.length) * 100 : 0;

    const perCropMetrics: PerCropMetrics[] = this.classes.map((cls) => {
      const tp = tpMap.get(cls) || 0;
      const fp = fpMap.get(cls) || 0;
      const fn = fnMap.get(cls) || 0;
      const support = supportMap.get(cls) || 0;

      const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 100;
      const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 100;
      const f1Score =
        precision + recall > 0
          ? (2 * (precision * recall)) / (precision + recall)
          : 0;
      const accuracy = support > 0 ? (tp / support) * 100 : 100;

      return {
        crop: cls,
        support,
        truePositives: tp,
        falsePositives: fp,
        falseNegatives: fn,
        precision: parseFloat(precision.toFixed(1)),
        recall: parseFloat(recall.toFixed(1)),
        f1Score: parseFloat(f1Score.toFixed(1)),
        accuracy: parseFloat(accuracy.toFixed(1)),
      };
    });

    return {
      totalSamples: totalOriginalSamples || this.trainSet.length + testSet.length,
      trainSamples: this.trainSet.length,
      testSamples: testSet.length,
      overallAccuracy: parseFloat(overallAccuracy.toFixed(2)),
      perCropMetrics,
      confusionMatrix: {
        classes: this.classes,
        matrix,
        totalTestSamples: testSet.length,
      },
      trainedAt: new Date().toISOString(),
    };
  }

  public getClasses(): string[] {
    return [...this.classes];
  }

  public getClassStats(crop: string): CropModelStats | undefined {
    return this.classStats.get(crop);
  }

  public getEvaluation(): EvaluationMetrics | null {
    return this.evaluation;
  }

  public getTrainCount(): number {
    return this.trainSet.length;
  }

  public getTestCount(): number {
    return this.testSet.length;
  }
}

// Singleton classifier instance with pre-trained default benchmark dataset
export const defaultClassifier = new GaussianNaiveBayesClassifier();
