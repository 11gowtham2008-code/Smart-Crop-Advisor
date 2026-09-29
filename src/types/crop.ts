export interface SoilWeatherInput {
  nitrogen: number; // N (kg/ha): 0 - 140
  phosphorus: number; // P (kg/ha): 5 - 145
  potassium: number; // K (kg/ha): 5 - 205
  temperature: number; // °C: 8 - 45
  humidity: number; // %: 10 - 100
  ph: number; // pH: 3.5 - 9.5
  rainfall: number; // mm: 20 - 300
}

export type CropName =
  | 'Rice'
  | 'Maize'
  | 'Cotton'
  | 'Banana'
  | 'Coconut'
  | 'Coffee'
  | 'Mango'
  | 'Papaya'
  | 'Pigeonpeas'
  | 'Watermelon';

export interface CropDataSample {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  label: string;
}

export interface FeatureStats {
  mean: number;
  variance: number;
  std: number;
  min: number;
  max: number;
}

export interface CropModelStats {
  crop: string;
  sampleCount: number;
  prior: number;
  features: {
    nitrogen: FeatureStats;
    phosphorus: FeatureStats;
    potassium: FeatureStats;
    temperature: FeatureStats;
    humidity: FeatureStats;
    ph: FeatureStats;
    rainfall: FeatureStats;
  };
}

export interface FeatureContribution {
  featureName: keyof SoilWeatherInput;
  inputValue: number;
  cropMean: number;
  cropStd: number;
  zScore: number;
  logLikelihood: number;
  suitabilityScore: number; // 0 - 100%
  status: 'optimal' | 'acceptable' | 'stress';
}

export interface CropPredictionScore {
  crop: CropName | string;
  confidence: number; // 0 - 100%
  logPosterior: number;
  featureContributions: FeatureContribution[];
}

export interface PredictionResult {
  bestCrop: CropName | string;
  confidence: number;
  top3: CropPredictionScore[];
  allScores: CropPredictionScore[];
  featureBreakdown: FeatureContribution[];
  runnerUpComparison?: {
    runnerUpCrop: CropName | string;
    runnerUpConfidence: number;
    comparisonFactors: {
      feature: string;
      inputValue: number;
      bestCropMean: number;
      runnerUpMean: number;
      bestAdvantage: string;
    }[];
  };
  inputSnapshot: SoilWeatherInput;
  timestamp: string;
}

export interface PerCropMetrics {
  crop: string;
  support: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface ConfusionMatrixData {
  classes: string[];
  matrix: number[][]; // [actual][predicted]
  totalTestSamples: number;
}

export interface EvaluationMetrics {
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
  overallAccuracy: number;
  perCropMetrics: PerCropMetrics[];
  confusionMatrix: ConfusionMatrixData;
  trainedAt: string;
}

export interface CropProfile {
  name: CropName;
  tamilName: string;
  botanicalName: string;
  category: 'Cereal' | 'Commercial' | 'Fruit' | 'Pulse' | 'Plantation';
  season: string;
  tamilSeason: string;
  durationMonths: string;
  soilType: string;
  tamilSoilType: string;
  averageYield: string; // e.g. "4.5 - 6.0 tonnes / hectare"
  marketPriceINR: string; // e.g. "₹2,300 - ₹2,850 / quintal"
  description: string;
  tamilDescription: string;
  idealConditions: {
    nRange: string;
    pRange: string;
    kRange: string;
    tempRange: string;
    humidityRange: string;
    phRange: string;
    rainfallRange: string;
  };
  fertilizerTips: string;
  tamilFertilizerTips: string;
  irrigationTips: string;
  tamilIrrigationTips: string;
}

export interface DistrictPreset {
  id: string;
  name: string;
  tamilName: string;
  zone: string;
  soilDescription: string;
  tamilSoilDescription: string;
  conditions: SoilWeatherInput;
  typicalCrops: string[];
  tamilTypicalCrops: string[];
}

export interface SensorTelemetry {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  batteryLevel: number;
  signalStrength: number;
  lastSync: string;
  sensorId: string;
}
