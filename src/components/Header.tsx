import React from 'react';
import { Sprout, Globe, Activity, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations/i18n';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isIoTSimActive: boolean;
  onOpenIoTModal: () => void;
  onPredictClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  isIoTSimActive,
  onOpenIoTModal,
  onPredictClick,
}) => {
  const t = TRANSLATIONS[language];

  const navLinks = [
    { id: 'dashboard', label: t.navDashboard },
    { id: 'predictor', label: t.navPredictor },
    { id: 'evaluation', label: t.navEvaluation },
    { id: 'upload', label: t.navUpload },
    { id: 'districts', label: t.navDistricts },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-emerald-950 hover:text-emerald-800 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-950">
              Smart Crop Advisor
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`relative py-1 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            {/* IoT Sensor Quick Access */}
            <button
              onClick={onOpenIoTModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isIoTSimActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="IoT Soil Sensor Simulation"
            >
              <Activity className={`w-3.5 h-3.5 ${isIoTSimActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{isIoTSimActive ? t.iotSimActive : t.navIoTSensor}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer border border-emerald-200/60"
              title="Switch language between English and தமிழ்"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.langToggle}</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onPredictClick}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>{t.predictAction}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
