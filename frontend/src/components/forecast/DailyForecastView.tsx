import React from 'react';
import { DailyForecastData } from '../../types';
import {
  Calendar,
  CloudSun,
  Wind,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DailyForecastViewProps {
  days: DailyForecastData[];
}

export const DailyForecastView: React.FC<DailyForecastViewProps> = ({ days }) => {
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

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            7-Day Synoptic Pollution Outlook
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Medium-range daily aggregates combining meteorological air currents and regional emission cycles
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
          {days.length} Days Horizon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {days.map((d, index) => {
          const isHighSmog = d.avgAqi >= 250;

          return (
            <div
              key={d.date}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isHighSmog
                  ? 'bg-red-50/30 dark:bg-red-950/15 border-red-200 dark:border-red-900/40'
                  : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      {d.dayName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {index === 0 ? 'Tomorrow' : `Day +${index + 1}`}
                    </span>
                  </div>
                  <Badge variant={getCategoryBadgeVariant(d.category)}>
                    {d.category}
                  </Badge>
                </div>

                {/* Average AQI & Range */}
                <div className="my-2.5 p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-zinc-500">Projected Avg:</span>
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                      {d.avgAqi}
                    </span>
                  </div>

                  {/* Range Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Low: {d.minAqi}</span>
                      <span>Peak: {d.maxAqi}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          d.avgAqi >= 300
                            ? 'bg-red-500'
                            : d.avgAqi >= 200
                            ? 'bg-orange-500'
                            : d.avgAqi >= 100
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (d.avgAqi / 400) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Weather & Particulate Mini Stats */}
                <div className="grid grid-cols-2 gap-1.5 py-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1 truncate">
                    <CloudSun className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{d.weather.condition}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-right justify-end">
                    <span>{d.weather.tempMin}° / {d.weather.tempMax}°C</span>
                  </div>

                  <div className="flex items-center gap-1 truncate">
                    <Wind className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>&lt;{d.weather.windSpeedMax} km/h</span>
                  </div>
                  <div className="text-right font-mono text-zinc-500">
                    PM2.5: ~{d.avgPm25}
                  </div>
                </div>

                {/* Precaution Box */}
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 leading-relaxed">
                  {d.healthPrecaution}
                </p>
              </div>

              {/* Trend Tag */}
              <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] flex items-center justify-between text-zinc-400">
                <span>Dominant: {d.dominantPollutant}</span>
                <span className="capitalize">{d.trend} trend</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
