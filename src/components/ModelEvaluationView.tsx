import React, { useState } from 'react';
import {
  CheckCircle,
  BarChart2,
  Table,
  Cpu,
  Layers,
  Info,
  HelpCircle,
} from 'lucide-react';
import { EvaluationMetrics } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';
import { CROP_PROFILES } from '../data/cropProfiles';

interface ModelEvaluationViewProps {
  metrics: EvaluationMetrics | null;
  language: Language;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  metrics,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [hoveredCell, setHoveredCell] = useState<{
    actual: string;
    predicted: string;
    count: number;
    row: number;
    col: number;
  } | null>(null);

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        No evaluation data available. Train or load the model first.
      </div>
    );
  }

  const {
    totalSamples,
    trainSamples,
    testSamples,
    overallAccuracy,
    perCropMetrics,
    confusionMatrix,
  } = metrics;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.evalTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-1">{t.evalSubtitle}</p>
        </div>

        {/* High Level KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
              {t.testAccuracy}
            </div>
            <div className="text-3xl font-extrabold text-emerald-950 font-mono tabular-nums mt-1">
              {overallAccuracy}%
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Evaluated on {testSamples} unseen samples
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {t.trainSamples}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {trainSamples}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              80% Stratified Training Split
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {t.testSamples}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {testSamples}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              20% Holdout Test Split
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {t.totalSamples}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {totalSamples}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              100 samples per crop variety
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Confusion Matrix Heatmap */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-emerald-600" />
              <span>{t.confusionMatrixTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Y-axis represents Actual True Crop Class, X-axis represents Predicted Crop. The green diagonal indicates true positive hits.
            </p>
          </div>

          {hoveredCell && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950 text-white text-xs font-mono">
              Actual: <strong>{hoveredCell.actual}</strong> → Predicted: <strong>{hoveredCell.predicted}</strong> ({hoveredCell.count} samples)
            </div>
          )}
        </div>

        {/* Matrix Visualization */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            {/* Predicted Label Header */}
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Predicted Crop (X-Axis) →
            </div>

            <table className="border-collapse text-center text-xs mx-auto">
              <thead>
                <tr>
                  <th className="p-2 text-right font-bold text-slate-600 border-b border-r border-slate-200 min-w-[90px]">
                    Actual (Y) ↓
                  </th>
                  {confusionMatrix.classes.map((c) => (
                    <th
                      key={c}
                      className="p-2 font-bold text-slate-700 border-b border-slate-200 min-w-[50px] max-w-[70px] truncate"
                      title={c}
                    >
                      {c.slice(0, 4)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.matrix.map((row, rowIdx) => {
                  const actualCrop = confusionMatrix.classes[rowIdx];
                  return (
                    <tr key={actualCrop}>
                      <td className="p-2 text-right font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap bg-slate-50/60">
                        {actualCrop}
                      </td>
                      {row.map((cellCount, colIdx) => {
                        const predCrop = confusionMatrix.classes[colIdx];
                        const isDiagonal = rowIdx === colIdx;
                        const isHit = cellCount > 0;

                        // Calculate cell color intensity
                        let cellBg = 'bg-white text-slate-300';
                        if (isDiagonal && isHit) {
                          cellBg =
                            cellCount > 15
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-emerald-400 text-white font-semibold';
                        } else if (!isDiagonal && isHit) {
                          cellBg = 'bg-rose-500 text-white font-bold';
                        }

                        return (
                          <td
                            key={`${rowIdx}-${colIdx}`}
                            onMouseEnter={() =>
                              setHoveredCell({
                                actual: actualCrop,
                                predicted: predCrop,
                                count: cellCount,
                                row: rowIdx,
                                col: colIdx,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`p-2 border border-slate-100 transition-colors cursor-pointer font-mono tabular-nums ${cellBg}`}
                          >
                            {cellCount}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-end gap-4 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 inline-block" />
            <span>Diagonal (Correctly Classified)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 inline-block" />
            <span>Off-Diagonal (Misclassified)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-white border border-slate-200 inline-block" />
            <span>Zero Confusions</span>
          </div>
        </div>
      </div>

      {/* Per-Crop Accuracy, Precision, Recall, F1 Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
          <span>{t.perCropMetricsTitle}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">{t.colCrop}</th>
                <th className="p-3.5 text-right">{t.colAccuracy}</th>
                <th className="p-3.5 text-right">{t.colPrecision}</th>
                <th className="p-3.5 text-right">{t.colRecall}</th>
                <th className="p-3.5 text-right">{t.colF1}</th>
                <th className="p-3.5 text-right">{t.colSupport}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {perCropMetrics.map((cropMetric) => {
                const profile = CROP_PROFILES[cropMetric.crop as keyof typeof CROP_PROFILES];

                return (
                  <tr
                    key={cropMetric.crop}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span>{cropMetric.crop}</span>
                      {profile?.tamilName && (
                        <span className="text-slate-400 font-normal">
                          · {profile.tamilName}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold tabular-nums text-emerald-700">
                      {cropMetric.accuracy}%
                    </td>
                    <td className="p-3.5 text-right font-mono tabular-nums text-slate-700">
                      {cropMetric.precision}%
                    </td>
                    <td className="p-3.5 text-right font-mono tabular-nums text-slate-700">
                      {cropMetric.recall}%
                    </td>
                    <td className="p-3.5 text-right font-mono tabular-nums text-slate-700">
                      {cropMetric.f1Score}%
                    </td>
                    <td className="p-3.5 text-right font-mono tabular-nums text-slate-500">
                      {cropMetric.support}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Math & Theory Explainer */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-6 sm:p-8 border border-emerald-900">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>Mathematical Formulation of Gaussian Naive Bayes</span>
        </h3>
        <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed max-w-3xl">
          Given a crop class <code className="bg-emerald-900/80 px-1 py-0.5 rounded text-emerald-300">c</code> and 7 continuous features <code className="bg-emerald-900/80 px-1 py-0.5 rounded text-emerald-300">x = [N, P, K, T, H, pH, R]</code>, the classifier computes the conditional likelihood using the 1D Gaussian probability density function:
        </p>

        <div className="my-3 p-3 bg-emerald-900/50 rounded-xl font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto border border-emerald-800">
          P(x_i | c) = (1 / √(2πσ²_c,i)) · exp( - (x_i - μ_c,i)² / (2σ²_c,i) )
        </div>

        <p className="text-xs text-emerald-200/80 leading-relaxed max-w-3xl">
          Log posterior probabilities are summed <code className="text-emerald-300">ln P(c|x) = ln P(c) + ∑ ln P(x_i|c)</code> and mapped via softmax into normalized confidence percentages, ensuring robust numerical stability across all extreme conditions.
        </p>
      </div>
    </div>
  );
};
