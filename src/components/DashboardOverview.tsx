import React from 'react';
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  UploadCloud,
  MapPin,
  Cpu,
  Layers,
  CheckCircle2,
  Droplets,
  Thermometer,
  Wind,
  FlaskConical,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations/i18n';
import { CROP_PROFILES } from '../data/cropProfiles';
import { CropName } from '../types/crop';

// Image paths from batch generation
import heroImg from '../assets/images/hero_crop_field_1790677993977.jpg';
import soilLabImg from '../assets/images/soil_testing_lab_1790678012873.jpg';
import iotFarmImg from '../assets/images/smart_farming_iot_1790678028106.jpg';

interface DashboardOverviewProps {
  language: Language;
  onNavigate: (tab: string) => void;
  onSelectCropProfile: (crop: CropName) => void;
  testAccuracy: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  language,
  onNavigate,
  onSelectCropProfile,
  testAccuracy,
}) => {
  const t = TRANSLATIONS[language];
  const cropList = Object.keys(CROP_PROFILES) as CropName[];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white border border-emerald-800/40 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-35 mix-blend-overlay">
          <img
            src={heroImg}
            alt="Lush agricultural farmland"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/85 to-transparent z-0" />

        <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-xs font-semibold tracking-wide text-emerald-200 uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.heroTag}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
            {t.heroTitle}
          </h1>

          <p className="mt-4 text-emerald-100/90 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t.heroDesc}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('predictor')}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition-all cursor-pointer hover:translate-y-[-1px] active:scale-95"
            >
              <span>{t.btnStartPrediction}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('evaluation')}
              className="flex items-center gap-2 px-5 py-3.5 bg-emerald-900/70 hover:bg-emerald-900 text-emerald-100 font-semibold text-sm rounded-xl border border-emerald-700/60 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>{t.btnViewModel}</span>
            </button>
          </div>

          {/* Social Proof / Quantitative proof metrics adjacent to claim */}
          <div className="mt-10 pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-4 sm:gap-8 text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {testAccuracy}%
              </div>
              <div className="text-xs text-emerald-300/80 mt-0.5">
                80/20 Test Accuracy
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                10 Crops
              </div>
              <div className="text-xs text-emerald-300/80 mt-0.5">
                Modeled Agronomic Classes
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                7 Factors
              </div>
              <div className="text-xs text-emerald-300/80 mt-0.5">
                Soil Chemistry & Weather
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Core Dimensions Architecture Overview */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
        <div className="max-w-2xl mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'ta' ? 'கணிப்பிற்கு பயன்படும் 7 அடிப்படை காரணிகள்' : 'The 7 Soil & Weather Parameters'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'ta'
              ? 'மண் ஆய்வுக்கூடம் அல்லது IoT சென்சார் மூலம் பெறப்படும் இந்த 7 காரணிகள் மூலம் காசியன் நைவ் பேயஸ் கணக்கிடுகிறது.'
              : 'Our Gaussian Naive Bayes classifier computes exact joint probabilities across all 7 environmental variables.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-2.5 text-emerald-800 font-semibold text-sm mb-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>{t.paramNitrogen}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramNitrogenDesc}</p>
            <div className="mt-2 text-xs font-mono text-emerald-700">Range: 0 - 140 kg/ha</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-2.5 text-emerald-800 font-semibold text-sm mb-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>{t.paramPhosphorus}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramPhosphorusDesc}</p>
            <div className="mt-2 text-xs font-mono text-emerald-700">Range: 5 - 145 kg/ha</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-2.5 text-emerald-800 font-semibold text-sm mb-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>{t.paramPotassium}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramPotassiumDesc}</p>
            <div className="mt-2 text-xs font-mono text-emerald-700">Range: 5 - 205 kg/ha</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-2.5 text-amber-900 font-semibold text-sm mb-1.5">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>{t.paramTemp}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramTempDesc}</p>
            <div className="mt-2 text-xs font-mono text-amber-700">Range: 10 - 45 °C</div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100 hover:border-sky-200 transition-colors">
            <div className="flex items-center gap-2.5 text-sky-900 font-semibold text-sm mb-1.5">
              <Wind className="w-4 h-4 text-sky-600" />
              <span>{t.paramHumidity}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramHumidityDesc}</p>
            <div className="mt-2 text-xs font-mono text-sky-700">Range: 15 - 100 %</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-2.5 text-purple-900 font-semibold text-sm mb-1.5">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>{t.paramPh}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramPhDesc}</p>
            <div className="mt-2 text-xs font-mono text-purple-700">Range: 3.5 - 9.5 pH</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 hover:border-blue-200 transition-colors sm:col-span-2">
            <div className="flex items-center gap-2.5 text-blue-900 font-semibold text-sm mb-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>{t.paramRainfall}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t.paramRainfallDesc}</p>
            <div className="mt-2 text-xs font-mono text-blue-700">Range: 20 - 300 mm precipitation</div>
          </div>
        </div>
      </section>

      {/* Visual Feature Spotlight Grid: Lab Testing & IoT Smart Agriculture */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="h-48 overflow-hidden relative">
            <img
              src={soilLabImg}
              alt="Scientific soil testing"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-4 text-xs font-bold uppercase tracking-wider text-emerald-300">
              {language === 'ta' ? 'மண் பரிசோதனை ஆய்வுக்கூடம்' : 'Soil Nutrient Profiling'}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'உண்மையான மண் மாதிரிகள் மற்றும் ஆய்வுகள்' : 'Precision Soil Chemistry Mapping'}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {language === 'ta'
                ? 'நைட்ரஜன், பாஸ்பரஸ் மற்றும் பொட்டாசியம் சத்துக்களின் விகிதத்தை துல்லியமாக கணக்கிட்டு மண் வளத்தை மேம்படுத்துகிறது.'
                : 'Calibrated using agronomic benchmarks from ICAR and FAO. The model maps physiological tolerance curves for each crop with rigorous probabilistic priors.'}
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <span>{language === 'ta' ? 'தனிப்பயன் CSV பதிவேற்ற' : 'Upload Research CSV'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="h-48 overflow-hidden relative">
            <img
              src={iotFarmImg}
              alt="Smart farm IoT weather station"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-4 text-xs font-bold uppercase tracking-wider text-emerald-300">
              {language === 'ta' ? 'IoT மண் சென்சார் இணைப்பு' : 'IoT Live Field Telemetry'}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'நிகழ்நேர சென்சார் தரவு பரிமாற்றம்' : 'Real-Time Sensor Ingestion'}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {language === 'ta'
                ? 'வயலில் பொருத்தப்பட்ட சென்சார் ஆய்வுக் கருவிகள் மூலம் தட்பவெப்பநிலை மற்றும் ஈரப்பதத்தை உடனுக்குடன் அளவிடலாம்.'
                : 'Future-ready IoT sensor bus simulation allows real-time optical NPK probes and capacitive moisture data to directly feed the recommendation engine.'}
            </p>
            <button
              onClick={() => onNavigate('districts')}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <span>{language === 'ta' ? 'தமிழக மாவட்டங்களை ஆராய' : 'Explore TN District Presets'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 10 Supported Crops Showcase Gallery */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {language === 'ta' ? 'மாதிரியில் சேர்க்கப்பட்டுள்ள 10 முதன்மை பயிர்கள்' : '10 Modeled Crop Varieties'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'ta'
                ? 'ஒவ்வொரு பயிரின் தாவரவியல் பெயர், மகசூல் மற்றும் சந்தை விலையை காண அட்டையை கிளிக் செய்யவும்.'
                : 'Click any crop to inspect optimal climate envelopes, MSP rates, and fertilizer strategies.'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">10 / 10 Active Profiles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {cropList.map((crop) => {
            const profile = CROP_PROFILES[crop];
            return (
              <button
                key={crop}
                onClick={() => onSelectCropProfile(crop)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-emerald-500/80 hover:bg-emerald-50/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {profile.category}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {profile.name}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {profile.tamilName}
                </div>
                <div className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                  {profile.botanicalName}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Rain: {profile.idealConditions.rainfallRange}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mechanism-to-Outcome Callout */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            {language === 'ta' ? 'உங்கள் நிலத்திற்கான பயிர் தேர்வை தொடங்க தயாரா?' : 'Ready to Run an Agricultural Soil Inference?'}
          </h3>
          <p className="text-emerald-200/90 text-sm mt-1 max-w-xl">
            {language === 'ta'
              ? 'மண் சத்துக்கள் மற்றும் வானிலை அளவுகளை உள்ளிட்டவுடன் காசியன் நைவ் பேயஸ் கணக்கீடுகள் சில மில்லி விநாடிகளில் முடிவுகளைத் தரும்.'
              : 'Our in-browser Gaussian Naive Bayes engine runs 100% locally with zero latency, paired with server-side AI agronomist intelligence.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('predictor')}
          className="px-6 py-3 bg-white text-emerald-950 font-bold text-sm rounded-xl shadow-md hover:bg-emerald-50 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          {t.btnStartPrediction}
        </button>
      </section>
    </div>
  );
};
