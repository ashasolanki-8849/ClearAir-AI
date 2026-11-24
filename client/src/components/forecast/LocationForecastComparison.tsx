import React from 'react';
import { LocationForecastComparisonData } from '../../types';
import { MapPin, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Compass, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LocationForecastComparisonProps {
  comparisons: LocationForecastComparisonData[];
  onSelectLocation?: (loc: LocationForecastComparisonData) => void;
}

export const LocationForecastComparison: React.FC<LocationForecastComparisonProps> = ({
  comparisons,
  onSelectLocation,
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

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Cross-Location Pollution & Forecast Comparison
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare ambient and upcoming 24h exposure across key transit hubs, university campuses, and residential sectors
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          {comparisons.length} Locations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {comparisons.map((loc, idx) => (
          <div
            key={idx}
            onClick={() => onSelectLocation && onSelectLocation(loc)}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              onSelectLocation ? 'cursor-pointer hover:border-emerald-500 hover:shadow-sm' : ''
            } bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate pr-2">
                  {loc.name}
                </span>
                <Badge variant={getCategoryBadgeVariant(loc.currentCategory)}>
                  {loc.currentCategory}
                </Badge>
              </div>

              {/* Current AQI vs 24h Forecast */}
              <div className="my-2.5 p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Current AQI</span>
                  <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {loc.currentAqi != null ? loc.currentAqi : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 block">24h Peak</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                    ~{loc.forecast24hPeak != null ? loc.forecast24hPeak : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Micro stats */}
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>24h Avg Projection:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    ~{loc.forecast24hAvg} AQI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current PM2.5:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">
                    {loc.pm25Current} µg/m³
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="capitalize">{loc.trendDirection} trend</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Live Data Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
