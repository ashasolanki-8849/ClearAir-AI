import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { VentilationAdviceData, AQIData } from '../../types';
import { indoorService } from '../../services/indoorService';
import {
  Wind,
  Clock,
  AlertTriangle,
  Shield,
  Utensils,
  CheckCircle2,
  RefreshCw,
  Sun,
  Flame,
  Info,
} from 'lucide-react';

interface VentilationAdvisorCardProps {
  location?: { lat: number; lon: number; name: string };
  roomId?: string;
  roomName?: string;
  language?: string;
}

export const VentilationAdvisorCard: React.FC<VentilationAdvisorCardProps> = ({
  location,
  roomId,
  roomName = 'Living Area',
  language = 'en',
}) => {
  const [advice, setAdvice] = useState<VentilationAdviceData | null>(null);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [isCookingActive, setIsCookingActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const res = await indoorService.getVentilationAdvice({
        location,
        roomId,
        isCookingActive,
        language,
      });
      if (res.success && res.advice) {
        setAdvice(res.advice);
        if (res.aqiData) setAqiData(res.aqiData);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [location, roomId, isCookingActive, language]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'favorable':
        return <Badge variant="good">Favorable Ventilation Window</Badge>;
      case 'restricted_pulse_only':
        return <Badge variant="moderate">Restricted Pulse Only (5–10 min)</Badge>;
      case 'closed_filtration_only':
        return <Badge variant="severe">Closed Filtration Mode</Badge>;
      default:
        return <Badge variant="default">Balanced Protocol</Badge>;
    }
  };

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
              <Wind className="w-3.5 h-3.5" />
              Smart Ventilation Protocol
            </span>
            <span className="text-xs text-zinc-400">• {roomName}</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {advice?.headline || 'Atmospheric Ventilation Balance'}
          </h3>
        </div>

        {/* Cooking Active Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCookingActive(!isCookingActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isCookingActive
                ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isCookingActive ? 'text-orange-500 animate-pulse' : ''}`} />
            <span>{isCookingActive ? 'Cooking Active (Plume Mode)' : 'Cooking Idle'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdvice}
            disabled={loading}
            className="p-2"
            title="Refresh advice"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Guidance Callout */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          advice?.isWindowOpeningRecommended
            ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
            : 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {getStatusBadge(advice?.ventilationStatus)}
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Outdoor AQI: {aqiData?.aqi || 140} ({aqiData?.aqiCategory || 'Moderate'})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
              {advice?.recommendation}
            </p>
          </div>

          {/* Duration Badge */}
          {advice && advice.durationMinutes > 0 && (
            <div className="shrink-0 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                Window Duration
              </span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {advice.durationMinutes} min
              </span>
              <span className="text-[10px] text-zinc-500 block">Cross-Draft Pulse</span>
            </div>
          )}
        </div>
      </div>

      {/* Three Detail Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Col 1: Best Time Window */}
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Optimal Daily Window
          </span>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {advice?.bestTimeWindow || '12:00 – 15:30 (Midday solar mixing)'}
          </p>
          <p className="text-[11px] text-zinc-500">
            Solar heating expands the atmospheric boundary layer, reducing surface particulate concentration.
          </p>
        </div>

        {/* Col 2: Air Purifier Coordination */}
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Purifier Coordination
          </span>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {advice?.airPurifierCoordination}
          </p>
        </div>

        {/* Col 3: Kitchen Ventilation Rule */}
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-orange-500" />
            Kitchen Safety Rule
          </span>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            {advice?.kitchenVentilationRule}
          </p>
        </div>
      </div>

      {/* Scientific Principle Notice */}
      <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-start gap-2.5 text-xs text-zinc-500">
        <Info className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Scientific Principle:</strong> {advice?.scientificContext}
        </p>
      </div>
    </Card>
  );
};
