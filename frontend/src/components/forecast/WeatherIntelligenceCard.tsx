import React from 'react';
import { WeatherPollutionData } from '../../types';
import {
  Wind,
  Droplets,
  CloudRain,
  Sun,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface WeatherIntelligenceCardProps {
  report: WeatherPollutionData;
}

export const WeatherIntelligenceCard: React.FC<WeatherIntelligenceCardProps> = ({ report }) => {
  const getConditionBadgeVariant = (cond: string) => {
    switch (cond) {
      case 'optimal_dispersion':
        return 'good';
      case 'moderate_ventilation':
        return 'satisfactory';
      case 'poor_stagnation':
        return 'moderate';
      case 'severe_inversion_trap':
        return 'severe';
      default:
        return 'default';
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'optimal_dispersion':
        return 'Optimal Atmospheric Dispersion';
      case 'moderate_ventilation':
        return 'Moderate Ventilation';
      case 'poor_stagnation':
        return 'Poor Air Stagnation';
      case 'severe_inversion_trap':
        return 'Severe Inversion Trap Active';
      default:
        return cond;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Weather & Atmospheric Ventilation Intelligence
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            How meteorological variables (wind vector, thermal boundary layers, humidity) influence pollution accumulation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={getConditionBadgeVariant(report.overallDispersionCondition)}>
            {getConditionLabel(report.overallDispersionCondition)}
          </Badge>
          <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900">
            Dispersion Score: {report.dispersionScore}/100
          </span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-0.5">
          {report.headline}
        </span>
        {report.summary}
      </div>

      {/* Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {report.factors.map((f, i) => {
          let Icon = Wind;
          if (f.factor === 'humidity') Icon = Droplets;
          if (f.factor === 'precipitation') Icon = CloudRain;
          if (f.factor === 'solar_radiation' || f.factor === 'temperature_inversion') Icon = Sun;

          let badgeVariant: 'good' | 'satisfactory' | 'moderate' | 'severe' = 'satisfactory';
          if (f.status === 'favorable') badgeVariant = 'good';
          else if (f.status === 'unfavorable') badgeVariant = 'moderate';
          else if (f.status === 'hazardous') badgeVariant = 'severe';

          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Icon className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize block">
                      {f.factor.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{f.currentValueText}</span>
                  </div>
                </div>
                <Badge variant={badgeVariant}>{f.status.toUpperCase()}</Badge>
              </div>

              <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                  {f.influenceOnPollution}
                </p>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {f.scientificMechanism}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Limitation & Non-Speculation Notice */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          {report.scientificLimitationNotice}
        </span>
      </div>
    </div>
  );
};
