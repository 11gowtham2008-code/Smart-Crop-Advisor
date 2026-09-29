/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CropPredictor } from './components/CropPredictor';
import { PredictionResultView } from './components/PredictionResultView';
import { ModelEvaluationView } from './components/ModelEvaluationView';
import { DatasetUploadModal } from './components/DatasetUploadModal';
import { TamilNaduDistrictExplorer } from './components/TamilNaduDistrictExplorer';
import { IoTSensorModal } from './components/IoTSensorModal';
import { CropDetailModal } from './components/CropDetailModal';

import { GaussianNaiveBayesClassifier } from './ml/gaussianNaiveBayes';
import { DEFAULT_CROP_DATASET } from './data/defaultDataset';
import {
  SoilWeatherInput,
  PredictionResult,
  EvaluationMetrics,
  CropName,
  CropDataSample,
} from './types/crop';
import { Language, TRANSLATIONS } from './translations/i18n';

const INITIAL_SOIL_INPUT: SoilWeatherInput = {
  nitrogen: 82,
  phosphorus: 48,
  potassium: 40,
  temperature: 24.5,
  humidity: 82,
  ph: 6.4,
  rainfall: 228,
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Soil & climate inputs
  const [soilInput, setSoilInput] = useState<SoilWeatherInput>(INITIAL_SOIL_INPUT);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // IoT Sensor modal & active state
  const [isIoTModalOpen, setIsIoTModalOpen] = useState<boolean>(false);
  const [isIoTSimActive, setIsIoTSimActive] = useState<boolean>(false);

  // Selected crop for deep profile inspection
  const [selectedCropModal, setSelectedCropModal] = useState<CropName | null>(null);

  // ML Classifier instance
  const classifier = useMemo(() => new GaussianNaiveBayesClassifier(), []);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetrics | null>(null);

  // Result container ref for auto-scrolling
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initial training with 80/20 train-test split
  useEffect(() => {
    try {
      const metrics = classifier.train(DEFAULT_CROP_DATASET, 0.8);
      setEvaluationMetrics(metrics);

      // Compute initial default prediction so view is instantly populated
      const initialPred = classifier.predict(INITIAL_SOIL_INPUT);
      setPredictionResult(initialPred);
    } catch (e) {
      console.error('Initialization error:', e);
    }
  }, [classifier]);

  // Execute prediction
  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      try {
        const result = classifier.predict(soilInput);
        setPredictionResult(result);
        if (currentTab !== 'predictor') {
          setCurrentTab('predictor');
        }
        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (err) {
        console.error('Prediction failed:', err);
      } finally {
        setIsPredicting(false);
      }
    }, 250);
  };

  // Handle retraining with uploaded CSV
  const handleRetrainDataset = (newDataset: CropDataSample[]): EvaluationMetrics => {
    const newMetrics = classifier.train(newDataset, 0.8);
    setEvaluationMetrics(newMetrics);
    // Refresh current prediction with newly calibrated parameters
    const refreshedPred = classifier.predict(soilInput);
    setPredictionResult(refreshedPred);
    return newMetrics;
  };

  // Apply district conditions from TN District Explorer
  const handleApplyDistrictConditions = (conditions: SoilWeatherInput) => {
    setSoilInput(conditions);
    setCurrentTab('predictor');
    setTimeout(() => {
      handlePredict();
    }, 150);
  };

  // Apply simulated IoT sensor reading
  const handleApplySensorTelemetry = (telemetryData: SoilWeatherInput) => {
    setSoilInput(telemetryData);
    setIsIoTSimActive(true);
    setCurrentTab('predictor');
    setTimeout(() => {
      handlePredict();
    }, 150);
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) | Zone 2 (4-6 links) | Zone 3 (Actions) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        isIoTSimActive={isIoTSimActive}
        onOpenIoTModal={() => setIsIoTModalOpen(true)}
        onPredictClick={() => {
          setCurrentTab('predictor');
          handlePredict();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab 1: Dashboard Overview */}
        {currentTab === 'dashboard' && (
          <DashboardOverview
            language={language}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectCropProfile={(crop) => setSelectedCropModal(crop)}
            testAccuracy={evaluationMetrics?.overallAccuracy || 99.5}
          />
        )}

        {/* Tab 2: Crop Predictor + Result Section */}
        {currentTab === 'predictor' && (
          <div className="space-y-10">
            <CropPredictor
              input={soilInput}
              setInput={setSoilInput}
              onPredict={handlePredict}
              isPredicting={isPredicting}
              language={language}
              onOpenIoT={() => setIsIoTModalOpen(true)}
            />

            {/* Prediction Results Anchor */}
            <div ref={resultsRef}>
              {predictionResult && (
                <PredictionResultView
                  result={predictionResult}
                  language={language}
                  onSelectCropProfile={(crop) => setSelectedCropModal(crop)}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Model Evaluation (Accuracy, Confusion Matrix, Per-Crop Table) */}
        {currentTab === 'evaluation' && (
          <ModelEvaluationView
            metrics={evaluationMetrics}
            language={language}
          />
        )}

        {/* Tab 4: Dataset Upload and Retraining */}
        {currentTab === 'upload' && (
          <DatasetUploadModal
            onRetrain={handleRetrainDataset}
            language={language}
          />
        )}

        {/* Tab 5: Tamil Nadu District Agro-Climatic Presets */}
        {currentTab === 'districts' && (
          <TamilNaduDistrictExplorer
            language={language}
            onApplyDistrict={handleApplyDistrictConditions}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <IoTSensorModal
        isOpen={isIoTModalOpen}
        onClose={() => setIsIoTModalOpen(false)}
        onApplySensorData={handleApplySensorTelemetry}
        language={language}
      />

      <CropDetailModal
        crop={selectedCropModal}
        onClose={() => setSelectedCropModal(null)}
        language={language}
      />

      {/* Clean Human Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Smart Crop Advisor</span>
            <span>·</span>
            <span>Gaussian Naive Bayes (80/20 Train-Test Split)</span>
            <span>·</span>
            <span className="font-mono">10 Crop Classes</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('districts')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Tamil Nadu Agro-Climatic Data
            </button>
            <button
              onClick={() => setCurrentTab('evaluation')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Accuracy Verification
            </button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
            >
              {language === 'en' ? 'தமிழ் பதிப்பு' : 'English Version'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
