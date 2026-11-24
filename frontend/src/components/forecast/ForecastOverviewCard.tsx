import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface ForecastOverviewCardProps {
  location: { name: string; lat: number; lon: number };
  currentAqi: number;
  currentCategory: string;
  trendSummary: {
    direction: string;
    summaryText: string;
    peakExpectedTime?: string;
    lowestExpectedTime?: string;
  };
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  dataSource: string;
  generatedAt: string;
  selectedHorizon: string;
  onSelectHorizon: (h: string) => void;
}

export const ForecastOverviewCard: React.FC<ForecastOverviewCardProps> = ({
  location,
  currentAqi,
  currentCategory,
  trendSummary,
  confidenceScore,
  confidenceLevel,
  dataSource,
  generatedAt,
  selectedHorizon,
  onSelectHorizon,
}) => {
  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'good':
        return 'good';
      case 'satisfactory':
        return 'satisfactory';
      case 'moderate':
        return 'moderate';
      case 'poor':
        return 'poor';
      case 'very poor':
      case 'verypoor':
        return 'verypoor';
      case 'severe':
        return 'severe';
      default:
        return 'default';
    }
  };

  const horizons = [
    { id: '6h', label: 'Next 6 Hours' },
    { id: '12h', label: 'Next 12 Hours' },
    { id: '24h', label: 'Next 24 Hours' },
    { id: '48h', label: 'Next 48 Hours' },
    { id: '7d', label: '7-Day Outlook' },
  ];

  const formatHour = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Top Banner: Location, Current vs Forecast, Confidence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Atmospheric Prediction Telemetry
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-zinc-500 font-mono">
              {location.name} ({location.lat.toFixed(2)}, {location.lon.toFixed(2)})
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <span>Air Quality Forecast & Trajectory</span>
          </h2>
        </div>

        {/* Model Confidence Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Model Confidence:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {confidenceScore}%
            </span>
            <Badge variant={confidenceLevel === 'high' ? 'good' : confidenceLevel === 'medium' ? 'satisfactory' : 'moderate'}>
              {confidenceLevel.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Measured Ground Truth Current AQI */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Current Measured AQI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Ground Truth
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {currentAqi}
              </span>
              <Badge variant={getCategoryBadgeVariant(currentCategory)}>
                {currentCategory}
              </Badge>
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-3 block">
            Calibrated against CPCB & US-EPA standards
          </span>
        </div>

        {/* 24-Hour Projected Trend */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Expected 24h Trajectory</span>
              {trendSummary.direction === 'increasing' ? (
                <span className="text-red-500 flex items-center text-[10px] font-bold">
                  <ArrowUpRight className="w-3 h-3" /> Worsening
                </span>
              ) : trendSummary.direction === 'decreasing' ? (
                <span className="text-emerald-500 flex items-center text-[10px] font-bold">
                  <ArrowDownRight className="w-3 h-3" /> Improving
                </span>
              ) : (
                <span className="text-zinc-400 text-[10px] font-bold">Stable</span>
              )}
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed mt-1">
              {trendSummary.summaryText}
            </p>
          </div>
          <span className="text-[10px] text-zinc-400 mt-2 block">
            Copernicus Atmospheric Dispersion Engine
          </span>
        </div>

        {/* Projected Peak Pollution Hour */}
        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Peak Exposure Hour
              </span>
              <Badge variant="moderate">Peak Alert</Badge>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
              {formatHour(trendSummary.peakExpectedTime)}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              Anticipated nocturnal inversion peak; avoid heavy outdoor cardio workouts.
            </p>
          </div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-2 block">
            Plan indoor recovery window
          </span>
        </div>

        {/* Projected Cleanest Opportunity Window */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Cleanest Window
              </span>
              <Badge variant="good">Opportunity</Badge>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
              {formatHour(trendSummary.lowestExpectedTime)}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
              Maximum convective solar mixing; safest timing for outdoor errands and pulse ventilation.
            </p>
          </div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-2 block">
            Optimal daily travel window
          </span>
        </div>
      </div>

      {/* Horizon Selector Chips & Data Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-medium mr-1 whitespace-nowrap">Horizon:</span>
          {horizons.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectHorizon(h.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedHorizon === h.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{dataSource}</span>
        </div>
      </div>
    </div>
  );
};
