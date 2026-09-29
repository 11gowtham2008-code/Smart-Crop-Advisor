import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Dice5,
  Activity,
  Layers,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { SoilWeatherInput } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';
import { TAMIL_NADU_DISTRICTS } from '../data/tamilNaduDistricts';

interface CropPredictorProps {
  input: SoilWeatherInput;
  setInput: React.Dispatch<React.SetStateAction<SoilWeatherInput>>;
  onPredict: () => void;
  isPredicting: boolean;
  language: Language;
  onOpenIoT: () => void;
}

const DEFAULT_INPUT: SoilWeatherInput = {
  nitrogen: 80,
  phosphorus: 48,
  potassium: 40,
  temperature: 24.5,
  humidity: 82,
  ph: 6.4,
  rainfall: 220,
};

const ARCHETYPES: {
  name: string;
  tamilName: string;
  conditions: SoilWeatherInput;
}[] = [
  {
    name: 'Wetland Paddy Field',
    tamilName: 'டெல்டா நெல் வயல்',
    conditions: {
      nitrogen: 82,
      phosphorus: 50,
      potassium: 40,
      temperature: 24.0,
      humidity: 82,
      ph: 6.5,
      rainfall: 235,
    },
  },
  {
    name: 'Kongu Cotton Soil',
    tamilName: 'கொங்கு கரிசல் பருத்தி',
    conditions: {
      nitrogen: 120,
      phosphorus: 45,
      potassium: 20,
      temperature: 24.5,
      humidity: 80,
      ph: 6.8,
      rainfall: 80,
    },
  },
  {
    name: 'Coastal Coconut Grove',
    tamilName: 'கடலோர தென்னந்தோப்பு',
    conditions: {
      nitrogen: 22,
      phosphorus: 18,
      potassium: 30,
      temperature: 27.2,
      humidity: 95,
      ph: 6.0,
      rainfall: 175,
    },
  },
  {
    name: 'Riverbed Watermelon Sand',
    tamilName: 'ஆற்றுப்படுகை தர்பூசணி',
    conditions: {
      nitrogen: 98,
      phosphorus: 18,
      potassium: 50,
      temperature: 25.5,
      humidity: 85,
      ph: 6.5,
      rainfall: 52,
    },
  },
  {
    name: 'Dryland Red Gram (Pulses)',
    tamilName: 'மானாவாரி துவரை நிலம்',
    conditions: {
      nitrogen: 20,
      phosphorus: 68,
      potassium: 20,
      temperature: 28.5,
      humidity: 48,
      ph: 5.8,
      rainfall: 145,
    },
  },
  {
    name: 'High-K Banana Orchard',
    tamilName: 'செம்மண் வாழை தோட்டம்',
    conditions: {
      nitrogen: 100,
      phosphorus: 82,
      potassium: 50,
      temperature: 27.0,
      humidity: 80,
      ph: 6.0,
      rainfall: 105,
    },
  },
];

export const CropPredictor: React.FC<CropPredictorProps> = ({
  input,
  setInput,
  onPredict,
  isPredicting,
  language,
  onOpenIoT,
}) => {
  const t = TRANSLATIONS[language];

  const handleParamChange = (key: keyof SoilWeatherInput, val: number) => {
    setInput((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
  };

  const handleRandomize = () => {
    const randomArchetype =
      ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    // Add small realistic noise
    const noise = (scale: number) => (Math.random() - 0.5) * scale;

    setInput({
      nitrogen: Math.max(5, Math.round(randomArchetype.conditions.nitrogen + noise(10))),
      phosphorus: Math.max(5, Math.round(randomArchetype.conditions.phosphorus + noise(8))),
      potassium: Math.max(5, Math.round(randomArchetype.conditions.potassium + noise(6))),
      temperature: parseFloat(
        Math.max(10, randomArchetype.conditions.temperature + noise(2)).toFixed(1)
      ),
      humidity: Math.min(
        100,
        Math.max(20, Math.round(randomArchetype.conditions.humidity + noise(4)))
      ),
      ph: parseFloat(
        Math.min(9.0, Math.max(4.0, randomArchetype.conditions.ph + noise(0.4))).toFixed(1)
      ),
      rainfall: parseFloat(
        Math.max(20, randomArchetype.conditions.rainfall + noise(15)).toFixed(1)
      ),
    });
  };

  const handleSelectDistrict = (districtId: string) => {
    const dist = TAMIL_NADU_DISTRICTS.find((d) => d.id === districtId);
    if (dist) {
      setInput(dist.conditions);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-8">
      {/* Header & Preset Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t.formTitle}
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {t.formSubtitle}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District Preset Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <select
              onChange={(e) => handleSelectDistrict(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                {language === 'ta' ? 'தமிழக மாவட்டம் தேர்வு...' : 'Select TN District Preset...'}
              </option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'ta' ? d.tamilName : d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Load random soil archetype"
          >
            <Dice5 className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.btnRandomSample}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Reset to default baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.btnResetValues}</span>
          </button>

          <button
            type="button"
            onClick={onOpenIoT}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            title="Live IoT soil probe"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.iotSimBadge}</span>
          </button>
        </div>
      </div>

      {/* Quick Archetype Preset Chips */}
      <div>
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          {language === 'ta' ? 'விவசாய மாதிரி விரைவுத் தேர்வுகள்:' : 'Quick Soil Archetypes:'}
        </div>
        <div className="flex flex-wrap gap-2">
          {ARCHETYPES.map((arch) => (
            <button
              key={arch.name}
              type="button"
              onClick={() => setInput(arch.conditions)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100/80 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 border border-slate-200/80 transition-all cursor-pointer text-left"
            >
              {language === 'ta' ? arch.tamilName : arch.name}
            </button>
          ))}
        </div>
      </div>

      {/* 7 Parameter Sliders and Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {/* Nitrogen */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramNitrogen}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="140"
                step="1"
                value={input.nitrogen}
                onChange={(e) =>
                  handleParamChange('nitrogen', Math.max(0, Math.min(140, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">kg/ha</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="140"
            step="1"
            value={input.nitrogen}
            onChange={(e) => handleParamChange('nitrogen', Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>0 Low</span>
            <span className="text-emerald-700">70 Moderate</span>
            <span>140 High</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramNitrogenDesc}</p>
        </div>

        {/* Phosphorus */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramPhosphorus}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="5"
                max="145"
                step="1"
                value={input.phosphorus}
                onChange={(e) =>
                  handleParamChange('phosphorus', Math.max(5, Math.min(145, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">kg/ha</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="145"
            step="1"
            value={input.phosphorus}
            onChange={(e) => handleParamChange('phosphorus', Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>5 Low</span>
            <span className="text-emerald-700">60 Medium</span>
            <span>145 Rich</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramPhosphorusDesc}</p>
        </div>

        {/* Potassium */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramPotassium}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="5"
                max="205"
                step="1"
                value={input.potassium}
                onChange={(e) =>
                  handleParamChange('potassium', Math.max(5, Math.min(205, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">kg/ha</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="205"
            step="1"
            value={input.potassium}
            onChange={(e) => handleParamChange('potassium', Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>5 Low</span>
            <span className="text-emerald-700">50 Moderate</span>
            <span>205 High</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramPotassiumDesc}</p>
        </div>

        {/* Temperature */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramTemp}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="10"
                max="45"
                step="0.5"
                value={input.temperature}
                onChange={(e) =>
                  handleParamChange('temperature', Math.max(10, Math.min(45, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">°C</span>
            </div>
          </div>
          <input
            type="range"
            min="10"
            max="45"
            step="0.5"
            value={input.temperature}
            onChange={(e) => handleParamChange('temperature', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>10°C Cool</span>
            <span className="text-amber-700">26°C Optimal</span>
            <span>45°C Hot</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramTempDesc}</p>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramHumidity}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="15"
                max="100"
                step="1"
                value={input.humidity}
                onChange={(e) =>
                  handleParamChange('humidity', Math.max(15, Math.min(100, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">%</span>
            </div>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            step="1"
            value={input.humidity}
            onChange={(e) => handleParamChange('humidity', Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>15% Arid</span>
            <span className="text-sky-700">65% Moderate</span>
            <span>100% Saturated</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramHumidityDesc}</p>
        </div>

        {/* Soil pH */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramPh}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="3.5"
                max="9.5"
                step="0.1"
                value={input.ph}
                onChange={(e) =>
                  handleParamChange('ph', Math.max(3.5, Math.min(9.5, Number(e.target.value))))
                }
                className="w-16 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">pH</span>
            </div>
          </div>
          <input
            type="range"
            min="3.5"
            max="9.5"
            step="0.1"
            value={input.ph}
            onChange={(e) => handleParamChange('ph', Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>3.5 Acidic</span>
            <span className="text-purple-700">6.5 Neutral</span>
            <span>9.5 Alkaline</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">{t.paramPhDesc}</p>
        </div>

        {/* Rainfall */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-blue-300 transition-colors md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.paramRainfall}</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="20"
                max="300"
                step="1"
                value={input.rainfall}
                onChange={(e) =>
                  handleParamChange('rainfall', Math.max(20, Math.min(300, Number(e.target.value))))
                }
                className="w-20 px-2 py-0.5 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">mm</span>
            </div>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="1"
            value={input.rainfall}
            onChange={(e) => handleParamChange('rainfall', Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
            <span>20mm Semi-arid</span>
            <span className="text-blue-700">120mm Moderate</span>
            <span>220mm Wetland</span>
            <span>300mm Monsoon</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">{t.paramRainfallDesc}</p>
        </div>
      </div>

      {/* Main Predict Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          {language === 'ta'
            ? 'அனைத்து 7 காரணிகளும் காசியன் நிகழ்தகவு அடர்த்தி சார்பு (Gaussian PDF) வழியாக கணக்கிடப்படும்.'
            : 'Evaluating joint likelihoods across 7 continuous Gaussian distributions simultaneously.'}
        </div>

        <button
          type="button"
          onClick={onPredict}
          disabled={isPredicting}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{isPredicting ? t.btnPredicting : t.btnPredict}</span>
        </button>
      </div>
    </div>
  );
};
