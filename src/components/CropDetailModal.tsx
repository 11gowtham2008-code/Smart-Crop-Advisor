import React from 'react';
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  IndianRupee,
  Layers,
  Droplets,
  Sprout,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { CropName, CropProfile } from '../types/crop';
import { CROP_PROFILES } from '../data/cropProfiles';
import { Language } from '../translations/i18n';

interface CropDetailModalProps {
  crop: CropName | null;
  onClose: () => void;
  language: Language;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  onClose,
  language,
}) => {
  if (!crop) return null;

  const profile: CropProfile = CROP_PROFILES[crop];
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-neutral-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">{profile.name}</h2>
              <span className="text-base text-emerald-700 font-bold">{profile.tamilName}</span>
            </div>
            <p className="text-xs text-slate-500 italic font-mono">
              {profile.botanicalName} · {profile.category} Crop
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-6">
          {language === 'ta' ? profile.tamilDescription : profile.description}
        </p>

        {/* Vital Agronomic Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-medium">Sowing Season</div>
            <div className="font-bold text-slate-800 mt-1">
              {language === 'ta' ? profile.tamilSeason : profile.season}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-medium">Duration</div>
            <div className="font-bold text-slate-800 mt-1">{profile.durationMonths}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-medium">Average Yield</div>
            <div className="font-bold text-slate-800 mt-1">{profile.averageYield}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-slate-400 font-medium">Market Price / MSP</div>
            <div className="font-bold text-emerald-700 mt-1">{profile.marketPriceINR}</div>
          </div>
        </div>

        {/* Optimal Envelopes */}
        <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
            Optimal Soil Chemistry & Weather Envelopes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div>N: <strong className="text-emerald-950">{profile.idealConditions.nRange}</strong></div>
            <div>P: <strong className="text-emerald-950">{profile.idealConditions.pRange}</strong></div>
            <div>K: <strong className="text-emerald-950">{profile.idealConditions.kRange}</strong></div>
            <div>pH: <strong className="text-emerald-950">{profile.idealConditions.phRange}</strong></div>
            <div>Temp: <strong className="text-emerald-950">{profile.idealConditions.tempRange}</strong></div>
            <div>Humidity: <strong className="text-emerald-950">{profile.idealConditions.humidityRange}</strong></div>
            <div className="sm:col-span-2">Rainfall: <strong className="text-emerald-950">{profile.idealConditions.rainfallRange}</strong></div>
          </div>
        </div>

        {/* Soil & Nutrition Guidelines */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Soil & Fertilizer Recommendations</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ta' ? profile.tamilFertilizerTips : profile.fertilizerTips}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Irrigation & Water Schedule</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ta' ? profile.tamilIrrigationTips : profile.irrigationTips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
