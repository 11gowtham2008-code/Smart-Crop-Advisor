import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCw,
  Layers,
  Database,
} from 'lucide-react';
import { CropDataSample, EvaluationMetrics } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';
import { exportDatasetToCSV, DEFAULT_CROP_DATASET } from '../data/defaultDataset';

interface DatasetUploadProps {
  onRetrain: (newDataset: CropDataSample[]) => EvaluationMetrics;
  language: Language;
}

export const DatasetUploadModal: React.FC<DatasetUploadProps> = ({
  onRetrain,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CropDataSample[] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainResult, setRetrainResult] = useState<EvaluationMetrics | null>(null);

  // Download Sample Dataset CSV
  const handleDownloadSample = () => {
    const csvContent = exportDatasetToCSV(DEFAULT_CROP_DATASET);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'crop_recommendation_benchmark.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse and validate CSV
  const processCSVText = (text: string, fileName: string) => {
    setValidationError(null);
    setValidationSuccess(null);
    setRetrainResult(null);

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 10) {
      setValidationError('CSV must have a header row and at least 10 sample data rows.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredCols = ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall', 'label'];

    // Also support alias 'crop' for 'label'
    const colMap: Record<string, number> = {};
    for (const req of requiredCols) {
      const idx = headers.findIndex(
        (h) => h === req || (req === 'label' && (h === 'crop' || h === 'crop_name'))
      );
      if (idx === -1) {
        setValidationError(
          `Missing required column: "${req}". CSV must contain: N, P, K, temperature, humidity, ph, rainfall, label.`
        );
        return;
      }
      colMap[req] = idx;
    }

    const samples: CropDataSample[] = [];
    const detectedCrops = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < headers.length) continue;

      const N = parseFloat(parts[colMap['n']]);
      const P = parseFloat(parts[colMap['p']]);
      const K = parseFloat(parts[colMap['k']]);
      const temperature = parseFloat(parts[colMap['temperature']]);
      const humidity = parseFloat(parts[colMap['humidity']]);
      const ph = parseFloat(parts[colMap['ph']]);
      const rainfall = parseFloat(parts[colMap['rainfall']]);
      const label = parts[colMap['label']];

      if (
        isNaN(N) ||
        isNaN(P) ||
        isNaN(K) ||
        isNaN(temperature) ||
        isNaN(humidity) ||
        isNaN(ph) ||
        isNaN(rainfall) ||
        !label
      ) {
        continue;
      }

      samples.push({ N, P, K, temperature, humidity, ph, rainfall, label });
      detectedCrops.add(label);
    }

    if (samples.length < 10) {
      setValidationError('Could not parse at least 10 valid numeric rows.');
      return;
    }

    setParsedData(samples);
    setValidationSuccess(
      `Successfully validated ${samples.length} sample rows across ${detectedCrops.size} crop classes (${Array.from(
        detectedCrops
      ).join(', ')}).`
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCSVText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        setValidationError('Only CSV files are supported (.csv).');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCSVText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteRetrain = () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsRetraining(true);
    setTimeout(() => {
      try {
        const result = onRetrain(parsedData);
        setRetrainResult(result);
      } catch (err: any) {
        setValidationError(err?.message || 'Retraining failed.');
      } finally {
        setIsRetraining(false);
      }
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            <span>{t.uploadTitle}</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">{t.uploadSubtitle}</p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.btnDownloadSample}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-emerald-600 bg-emerald-50/50'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="text-sm font-semibold text-slate-800">{t.uploadDrop}</p>
        <p className="text-xs text-slate-500 mt-1">{t.uploadFormat}</p>

        {selectedFile && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {/* Status Banners */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>Validation Error:</strong> {validationError}
          </div>
        </div>
      )}

      {validationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>{validationSuccess}</div>
        </div>
      )}

      {/* Retrain Trigger Button */}
      {parsedData && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            Clicking retrain will partition the uploaded data into an 80% train and 20% test split, recomputing all class priors and Gaussian likelihood parameters.
          </div>

          <button
            onClick={handleExecuteRetrain}
            disabled={isRetraining}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRetraining ? (
              <RotateCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
            <span>{isRetraining ? 'Retraining Gaussian Bayes...' : t.btnUploadTrain}</span>
          </button>
        </div>
      )}

      {/* Retraining Outcome Showcase */}
      {retrainResult && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-950 text-white space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Retraining Complete & Synchronized</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-400">Total Samples:</div>
              <div className="text-xl font-bold text-white tabular-nums">
                {retrainResult.totalSamples}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Train Set (80%):</div>
              <div className="text-xl font-bold text-white tabular-nums">
                {retrainResult.trainSamples}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Test Set (20%):</div>
              <div className="text-xl font-bold text-white tabular-nums">
                {retrainResult.testSamples}
              </div>
            </div>
            <div>
              <div className="text-slate-400">New Test Accuracy:</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">
                {retrainResult.overallAccuracy}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
