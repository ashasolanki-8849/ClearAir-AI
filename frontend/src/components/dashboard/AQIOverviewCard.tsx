import { ShieldAlert, RefreshCw, Radio, MapPin, Info } from 'lucide-react';
import { AQIData } from '../../types';
import { getAQIConfig } from '../../utils/aqiHelper';
import { Badge } from '../common/Badge';

interface AQIOverviewCardProps {
  data: AQIData;
  onRefresh: () => void;
  isLoading?: boolean;
  onOpenLocationModal?: () => void;
}

export const AQIOverviewCard = ({
  data,
  onRefresh,
  isLoading = false,
  onOpenLocationModal,
}: AQIOverviewCardProps) => {
  const config = getAQIConfig(data.aqiCategory);

  // Calculate percentage of 0-500 scale
  const progressPercent = Math.min(100, Math.max(0, (data.aqi / 500) * 100));

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#070707] shadow-sm">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocationModal}
            className="group flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 transition-colors"
          >
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span>{data.location.name}</span>
            <span className="text-xs font-normal text-zinc-400">
              ({data.location.lat.toFixed(2)}°, {data.location.lon.toFixed(2)}°)
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {data.isDemo ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 border border-amber-500/30">
              <Info className="w-3.5 h-3.5" />
              DEMO SIMULATION
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE SENSOR FEED
            </span>
          )}

          <div className="text-zinc-400">
            Updated <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatTime(data.lastUpdated)}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Refresh AQI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Metric Hero Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Giant AQI Display */}
        <div className="md:col-span-6 flex flex-col justify-center">
          <div className="flex items-baseline gap-4">
            <span
              className="text-6xl sm:text-7xl font-extrabold tracking-tight font-mono"
              style={{ color: config.color }}
            >
              {data.aqi}
            </span>
            <div className="flex flex-col">
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-semibold">
                Air Quality Index
              </span>
              <div className="mt-1">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    color: config.textColor,
                  }}
                >
                  {config.label}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {config.healthSummary}
          </p>

          <p className="mt-2 text-[11px] text-zinc-400 font-mono">
            Standard: {data.standard}
          </p>
        </div>

        {/* Right: Scale & Key Dominant Pollutant */}
        <div className="md:col-span-6 space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-900 dark:bg-black/40">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-600 dark:text-zinc-400">Smog Pollution Scale (0 - 500)</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200">{data.aqi} / 500</span>
            </div>

            {/* Gradient Visual Scale */}
            <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-zinc-400 font-mono pt-1">
              <span>0 (Good)</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500+ (Severe)</span>
            </div>
          </div>

          {/* Dominant Pollutant Alert */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500">Primary Winter Smog Driver:</span>
              <span className="ml-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                PM2.5 ({data.pollutants.pm25} µg/m³)
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-500 font-medium">
              {(data.pollutants.pm25 / 60).toFixed(1)}x Safe Limit
            </span>
          </div>

          {/* Data Source Notice */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
            <Radio className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">Source: {data.dataSource}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
