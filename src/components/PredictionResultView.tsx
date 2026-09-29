import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  BarChart,
  GitCompare,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  Sprout,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RotateCw,
  IndianRupee,
  Clock,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PredictionResult, CropName } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';
import { CROP_PROFILES } from '../data/cropProfiles';

interface PredictionResultViewProps {
  result: PredictionResult;
  language: Language;
  onSelectCropProfile: (crop: CropName) => void;
}

export const PredictionResultView: React.FC<PredictionResultViewProps> = ({
  result,
  language,
  onSelectCropProfile,
}) => {
  const t = TRANSLATIONS[language];
  const bestCropName = result.bestCrop as CropName;
  const profile = CROP_PROFILES[bestCropName] || ({} as any);

  const [aiExplanationText, setAiExplanationText] = useState<string>('');
  const [aiSource, setAiSource] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'factors' | 'runnerUp' | 'agronomy'>('explanation');

  // Trigger celebratory confetti once on new prediction
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#059669', '#34d399', '#6ee7b7'],
      });
    } catch {
      // Ignore if in test env
    }
  }, [result.timestamp]);

  // Fetch AI Agronomist Deep-Dive explanation
  useEffect(() => {
    let isMounted = true;
    const fetchExplanation = async () => {
      setIsLoadingAI(true);
      try {
        const runnerUpName = result.top3[1]?.crop || '';
        const res = await fetch('/api/crop/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop: result.bestCrop,
            confidence: result.confidence,
            input: result.inputSnapshot,
            runnerUp: runnerUpName,
            language,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAiExplanationText(data.explanation || '');
            setAiSource(data.source || '');
          }
        }
      } catch (err) {
        console.warn('Could not fetch server AI explanation:', err);
      } finally {
        if (isMounted) setIsLoadingAI(false);
      }
    };

    fetchExplanation();
    return () => {
      isMounted = false;
    };
  }, [result.bestCrop, result.timestamp, language]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Recommended Crop Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.bestCropBadge}</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-baseline gap-3">
                <span>{bestCropName}</span>
                {profile.tamilName && (
                  <span className="text-lg sm:text-2xl font-medium text-emerald-200">
                    {profile.tamilName}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-300 italic mt-1 font-mono">
                {profile.botanicalName} · {profile.category}
              </p>
            </div>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
              {language === 'ta' ? profile.tamilDescription : profile.description}
            </p>
          </div>

          {/* Model Confidence Metric Pill */}
          <div className="bg-emerald-950/70 border border-emerald-600/40 rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center shrink-0 min-w-[200px] shadow-lg backdrop-blur-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
              {t.confidenceScore}
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              {result.confidence}%
            </div>
            <div className="w-full bg-emerald-900/90 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-2 font-mono">
              Joint Gaussian Posterior
            </div>
          </div>
        </div>

        {/* Key Agricultural Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-700/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.idealSeason}</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              {language === 'ta' ? profile.tamilSeason : profile.season}
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-700/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.duration}</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              {profile.durationMonths}
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-700/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.estYield}</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              {profile.averageYield}
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-700/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.marketPrice}</span>
            </div>
            <div className="text-sm font-semibold text-emerald-300 mt-1">
              {profile.marketPriceINR}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Crop Rankings Bar Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>{t.top3Title}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Ranked by Gaussian Likelihood</span>
        </div>

        <div className="space-y-4">
          {result.top3.map((item, index) => {
            const isWinner = index === 0;
            const rankLabel = index === 0 ? '1st (Optimal)' : index === 1 ? '2nd (Runner-Up)' : '3rd Choice';
            const cropProf = CROP_PROFILES[item.crop as CropName];

            return (
              <div
                key={item.crop}
                className={`p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-emerald-50/50 border-emerald-300/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isWinner
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-base">
                        {item.crop}
                      </span>
                      {cropProf?.tamilName && (
                        <span className="text-xs text-slate-500 ml-2 font-medium">
                          {cropProf.tamilName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      {rankLabel}
                    </span>
                    <span className="text-base font-extrabold font-mono text-emerald-800 tabular-nums">
                      {item.confidence}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isWinner ? 'bg-emerald-600' : index === 1 ? 'bg-emerald-400' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(4, item.confidence)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-depth AI Explanation & Factor Analysis Tabs */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs">
        {/* Interactive Segmented Control */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'explanation'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.aiExplanationTitle}
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'factors'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.factorAnalysisTitle}
          </button>
          <button
            onClick={() => setActiveTab('runnerUp')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'runnerUp'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.runnerUpTitle}
          </button>
          <button
            onClick={() => setActiveTab('agronomy')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'agronomy'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.aiAgronomistTitle}
          </button>
        </div>

        {/* Tab 1: AI Explanation Overview */}
        {activeTab === 'explanation' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
              <h3 className="text-base font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'ta'
                    ? `${bestCropName} பயிர் எவ்வாறு தேர்ந்தெடுக்கப்பட்டது?`
                    : `Why was ${bestCropName} chosen for your soil?`}
                </span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {language === 'ta'
                  ? `உங்கள் நிலத்தில் அளவிடப்பட்ட 7 காரணிகளில் பெரும்பாலானவை ${bestCropName} பயிருக்கு உகந்த சராசரியுடன் மிக நெருக்கமாக ஒத்துப்போகின்றன. காசியன் நிகழ்தகவு அடர்த்தி கணிப்பில் இது ${result.confidence}% அதிகபட்ச நம்பிக்கையைப் பெற்றுள்ளது.`
                  : `Across your 7 measured soil and climate dimensions, the multivariate normal probability density for ${bestCropName} strongly outperformed competing crops, yielding a posterior probability of ${result.confidence}%.`}
              </p>
            </div>

            {/* Key Decisive Factors Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Enabler
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Optimal Rainfall Match
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Your rainfall ({result.inputSnapshot.rainfall}mm) directly aligns with {bestCropName}'s root hydration threshold.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Soil Chemistry
                </div>
                <div className="text-sm font-bold text-slate-900">
                  pH Compatibility ({result.inputSnapshot.ph})
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  The soil pH allows maximum root bioavailability of essential macronutrients without aluminium/iron fixation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nutrient Sufficiency
                </div>
                <div className="text-sm font-bold text-slate-900">
                  NPK Ratio Balance
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Nitrogen ({result.inputSnapshot.nitrogen}), Phosphorus ({result.inputSnapshot.phosphorus}), and Potassium ({result.inputSnapshot.potassium}) suit vegetative vigor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feature-by-Feature Likelihood & Suitability Breakdown */}
        {activeTab === 'factors' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'உங்கள் உள்ளீட்டு மதிப்புக்கும் இப்பயிரின் உகந்த சராசரிக்கும் இடையேயான விலகல் (Z-Score) மற்றும் பொருத்தம் கீழே காட்டப்பட்டுள்ளது:'
                : 'Standard deviation (Z-score) and exponential suitability distance for each of the 7 parameters against the crop benchmark:'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Your Value</th>
                    <th className="p-3">Optimal Mean (±Std)</th>
                    <th className="p-3">Z-Score</th>
                    <th className="p-3">Suitability Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.featureBreakdown.map((item) => {
                    const isOptimal = item.status === 'optimal';
                    const isAcceptable = item.status === 'acceptable';

                    return (
                      <tr key={item.featureName} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 capitalize">
                          {item.featureName}
                        </td>
                        <td className="p-3 font-mono font-bold tabular-nums text-slate-900">
                          {item.inputValue}
                        </td>
                        <td className="p-3 font-mono tabular-nums text-slate-600">
                          {item.cropMean} ± {item.cropStd}
                        </td>
                        <td className="p-3 font-mono tabular-nums text-slate-600">
                          {item.zScore}σ
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.suitabilityScore >= 80
                                    ? 'bg-emerald-600'
                                    : item.suitabilityScore >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${item.suitabilityScore}%` }}
                              />
                            </div>
                            <span className="font-mono tabular-nums font-semibold">
                              {item.suitabilityScore}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                              isOptimal
                                ? 'text-emerald-700'
                                : isAcceptable
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {isOptimal ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Champion vs Runner-Up Head-to-Head Comparison */}
        {activeTab === 'runnerUp' && (
          <div className="space-y-6">
            {result.runnerUpComparison ? (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      #1
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase">Selected Champion</div>
                      <div className="text-lg font-extrabold text-slate-900">{bestCropName} ({result.confidence}%)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-bold">
                    <span>VS</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase text-right">Runner-Up</div>
                      <div className="text-lg font-bold text-slate-700 text-right">
                        {result.runnerUpComparison.runnerUpCrop} ({result.runnerUpComparison.runnerUpConfidence}%)
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-300 text-slate-800 flex items-center justify-center font-bold">
                      #2
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Feature-by-Feature Decisive Differences:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.runnerUpComparison.comparisonFactors.map((factor) => (
                      <div
                        key={factor.feature}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs text-slate-900 capitalize">
                            {factor.feature}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Input: <strong className="text-slate-800">{factor.inputValue}</strong>
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex justify-between font-mono pt-1">
                          <span>{bestCropName} Target: {factor.bestCropMean}</span>
                          <span>{result.runnerUpComparison?.runnerUpCrop} Target: {factor.runnerUpMean}</span>
                        </div>
                        <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md">
                          {factor.bestAdvantage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No close runner-up crop identified.</p>
            )}
          </div>
        )}

        {/* Tab 4: AI Agronomist Deep-Dive (Gemini-powered or expert heuristics) */}
        {activeTab === 'agronomy' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>
                  {aiSource === 'gemini-3.8-flash'
                    ? 'AI Model: Gemini 3.8 Flash Agronomist'
                    : 'Agricultural Science Heuristics Engine'}
                </span>
              </div>
              {isLoadingAI && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 animate-pulse">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing farm report...</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-slate-800 bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 leading-relaxed space-y-3 font-sans">
              {aiExplanationText ? (
                <div
                  className="whitespace-pre-line text-sm text-slate-800"
                  dangerouslySetInnerHTML={{
                    __html: aiExplanationText
                      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-base text-emerald-950 mt-4 mb-2">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
                      .replace(/- (.*?)\n/g, '<li class="ml-4 list-disc text-slate-700">$1</li>'),
                  }}
                />
              ) : (
                <p className="text-sm text-slate-600 italic">
                  Loading agronomic advisory report...
                </p>
              )}
            </div>

            {/* Practical Fertilizer & Irrigation Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 uppercase tracking-wide mb-1">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>{t.fertilizerAdvice}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {language === 'ta' ? profile.tamilFertilizerTips : profile.fertilizerTips}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900 uppercase tracking-wide mb-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>{t.waterReq}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {language === 'ta' ? profile.tamilIrrigationTips : profile.irrigationTips}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
