import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Wifi,
  BatteryCharging,
  Zap,
  Radio,
} from 'lucide-react';
import { SoilWeatherInput } from '../types/crop';
import { Language, TRANSLATIONS } from '../translations/i18n';

interface IoTSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySensorData: (data: SoilWeatherInput) => void;
  language: Language;
}

export const IoTSensorModal: React.FC<IoTSensorModalProps> = ({
  isOpen,
  onClose,
  onApplySensorData,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [telemetry, setTelemetry] = useState<SoilWeatherInput>({
    nitrogen: 84,
    phosphorus: 49,
    potassium: 41,
    temperature: 24.6,
    humidity: 82.5,
    ph: 6.4,
    rainfall: 225,
  });

  // Telemetry fluctuation effect simulating real physical sensor jitter
  useEffect(() => {
    if (!isStreaming || !isOpen) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        nitrogen: Math.max(10, Math.min(130, Math.round(prev.nitrogen + (Math.random() - 0.5) * 2))),
        phosphorus: Math.max(10, Math.min(120, Math.round(prev.phosphorus + (Math.random() - 0.5) * 1.5))),
        potassium: Math.max(10, Math.min(180, Math.round(prev.potassium + (Math.random() - 0.5) * 1.5))),
        temperature: parseFloat(
          Math.max(15, Math.min(42, prev.temperature + (Math.random() - 0.5) * 0.2)).toFixed(1)
        ),
        humidity: parseFloat(
          Math.max(25, Math.min(98, prev.humidity + (Math.random() - 0.5) * 0.5)).toFixed(1)
        ),
        ph: parseFloat(
          Math.max(4.5, Math.min(8.5, prev.ph + (Math.random() - 0.5) * 0.05)).toFixed(2)
        ),
        rainfall: parseFloat(
          Math.max(20, Math.min(290, prev.rainfall + (Math.random() - 0.5) * 1.5)).toFixed(1)
        ),
      }));
      setLastSync(new Date().toLocaleTimeString());
    }, 1800);

    return () => clearInterval(interval);
  }, [isStreaming, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplySensorData(telemetry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-neutral-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'IoT மண் சென்சார் இணைப்பு முனையம்' : 'IoT Agricultural Soil Telemetry Node'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                AgriProbe Node #TN-DELTA-04
              </span>
              <span>·</span>
              <span className="font-mono">Last sync: {lastSync}</span>
            </div>
          </div>
        </div>

        {/* Hardware Status Strip */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protocol: LoRaWAN 868MHz</span>
          </div>
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>Solar: 98%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>RSSI: -64 dBm</span>
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Nitrogen (N)</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
              {telemetry.nitrogen} <span className="text-xs font-normal text-slate-500">kg/ha</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Phosphorus (P)</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
              {telemetry.phosphorus} <span className="text-xs font-normal text-slate-500">kg/ha</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Potassium (K)</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
              {telemetry.potassium} <span className="text-xs font-normal text-slate-500">kg/ha</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Soil pH</div>
            <div className="text-xl font-bold text-purple-700 tabular-nums mt-1">
              {telemetry.ph}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Ambient Temp</div>
            <div className="text-xl font-bold text-amber-700 tabular-nums mt-1">
              {telemetry.temperature}°C
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 uppercase">Relative Hum.</div>
            <div className="text-xl font-bold text-sky-700 tabular-nums mt-1">
              {telemetry.humidity}%
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
            <div className="text-[11px] text-slate-500 uppercase">Cumulative Rain Gauge</div>
            <div className="text-xl font-bold text-blue-700 tabular-nums mt-1">
              {telemetry.rainfall} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
          </div>
        </div>

        {/* Live Stream Toggle & Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isStreaming
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>{isStreaming ? 'Pause Stream' : 'Resume Live Stream'}</span>
          </button>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'ta' ? 'இந்த சென்சார் தரவை உள்ளிடு' : 'Capture & Apply to Predictor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
