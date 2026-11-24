import React from 'react';
import { TrendAnalysisData } from '../../types';
import { TrendingUp, TrendingDown, Clock, Sun, Moon, Sunrise, Sunset, Sparkles, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TrendAnalysisCardProps {
  trend: TrendAnalysisData;
}

export const TrendAnalysisCard: React.FC<TrendAnalysisCardProps> = ({ trend }) => {
  const formatTime = (iso?: string) => {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getTrendBadge = () => {
    switch (trend.currentTrend) {
      case 'rising_fast':
        return <Badge variant="severe">Rising Rapidly</Badge>;
      case 'rising_slow':
        return <Badge variant="moderate">Gradual Rise</Badge>;
      case 'clearing':
        return <Badge variant="good">Clearing Trend</Badge>;
      default:
        return <Badge variant="satisfactory">Stable Continuum</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            AI Pollution Trend Analysis & Diurnal Cycles
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Temporal trajectory tracking and diurnal boundary layer inversion indicators
          </p>
        </div>

        {getTrendBadge()}
      </div>

      {/* Headline & Explanation */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
          {trend.headline}
        </span>
        <p className="leading-relaxed">{trend.explanation}</p>
      </div>

      {/* Peak & Clearing Spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-white dark:bg-zinc-950 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider block">
              Anticipated Peak Smog Hour
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5 block">
              {formatTime(trend.peakHour.time)}
            </span>
            <span className="text-[11px] text-zinc-500">
              Expected Level: ~{trend.peakHour.expectedAqi} AQI ({trend.peakHour.category})
            </span>
          </div>
          <Badge variant="moderate">Peak</Badge>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-950 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider block">
              Anticipated Clean Air Trough
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5 block">
              {formatTime(trend.clearingHour.time)}
            </span>
            <span className="text-[11px] text-zinc-500">
              Expected Level: ~{trend.clearingHour.expectedAqi} AQI ({trend.clearingHour.category})
            </span>
          </div>
          <Badge variant="good">Trough</Badge>
        </div>
      </div>

      {/* Diurnal Pattern Indicators */}
      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
        <span className="text-zinc-500 font-semibold text-[11px] block">
          Diurnal Cycle Phase Indicators:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              trend.diurnalPattern.morningInversionRisk
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 text-red-800 dark:text-red-300'
                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
            <span className="font-semibold block text-[11px]">Morning Inversion</span>
            <span className="text-[10px] opacity-75">
              {trend.diurnalPattern.morningInversionRisk ? 'Active Inversion Lid' : 'Normal Gradient'}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              trend.diurnalPattern.middayDispersionWindow
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-500" />
            <span className="font-semibold block text-[11px]">Midday Dispersion</span>
            <span className="text-[10px] opacity-75">
              {trend.diurnalPattern.middayDispersionWindow ? 'Solar Mixing Window' : 'Suppressed'}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              trend.diurnalPattern.eveningCommuteSpike
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
            <span className="font-semibold block text-[11px]">Evening Commute</span>
            <span className="text-[10px] opacity-75">
              {trend.diurnalPattern.eveningCommuteSpike ? 'Traffic Spike Likely' : 'Mild Delay'}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-colors ${
              trend.diurnalPattern.nightColdStagnation
                ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-900/50 text-purple-800 dark:text-purple-300'
                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            <Moon className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" />
            <span className="font-semibold block text-[11px]">Night Stagnation</span>
            <span className="text-[10px] opacity-75">
              {trend.diurnalPattern.nightColdStagnation ? 'Low Wind (<5km/h)' : 'Moderate Airflow'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
