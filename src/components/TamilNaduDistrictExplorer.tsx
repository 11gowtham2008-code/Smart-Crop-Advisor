import React from 'react';
import { MapPin, ArrowRight, Droplets, Thermometer, FlaskConical, Wind } from 'lucide-react';
import { TAMIL_NADU_DISTRICTS } from '../data/tamilNaduDistricts';
import { DistrictPreset, SoilWeatherInput } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';

interface TamilNaduDistrictExplorerProps {
  language: Language;
  onApplyDistrict: (conditions: SoilWeatherInput) => void;
}

export const TamilNaduDistrictExplorer: React.FC<TamilNaduDistrictExplorerProps> = ({
  language,
  onApplyDistrict,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          <span>{t.quickPresetsTitle}</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">{t.quickPresetsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TAMIL_NADU_DISTRICTS.map((district) => (
          <div
            key={district.id}
            className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {language === 'ta' ? district.tamilName : district.name}
                  </h3>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">
                    {district.zone}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                {language === 'ta' ? district.tamilSoilDescription : district.soilDescription}
              </p>

              {/* Conditions Pills Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400">N-P-K: </span>
                  <span className="font-bold text-slate-800">
                    {district.conditions.nitrogen}-{district.conditions.phosphorus}-{district.conditions.potassium}
                  </span>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400">Temp: </span>
                  <span className="font-bold text-slate-800">{district.conditions.temperature}°C</span>
                </div>
                <div className="bg-white px-2 py-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-400">Rain: </span>
                  <span className="font-bold text-slate-800">{district.conditions.rainfall}mm</span>
                </div>
              </div>

              {/* Typical Crops */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                <span className="text-slate-400">Main crops:</span>
                {(language === 'ta' ? district.tamilTypicalCrops : district.typicalCrops).map((c) => (
                  <span
                    key={c}
                    className="font-medium bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-md text-[11px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onApplyDistrict(district.conditions)}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 hover:border-transparent transition-all cursor-pointer shadow-2xs"
            >
              <span>{language === 'ta' ? 'இந்த மாவட்டத்தை சோதிக்க' : 'Test This District Conditions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
