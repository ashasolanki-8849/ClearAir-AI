import { useState } from 'react';
import { useAQI } from '../context/AQIContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import { AirPollutionMap } from '../components/pollution/AirPollutionMap';
import { LocationSelectorModal } from '../components/dashboard/LocationSelectorModal';
import { CloudFog, MapPin, Wind, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export const AirPollutionPage = () => {
  const { aqiData, location, isLoading, refreshAQI } = useAQI();
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <CloudFog className="w-7 h-7 text-sky-500" />
              <span>Air Pollution</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>Showing air quality near:</span>
              <button
                onClick={() => setLocationModalOpen(true)}
                className="font-semibold text-zinc-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 hover:underline flex items-center gap-0.5"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span>{location.name}</span>
              </button>
            </p>
          </div>

          <button
            onClick={refreshAQI}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 2 Big Clear Cards: Pollution % and Smog % */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Pollution Level */}
          <div className="p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Overall Pollution Level
            </span>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl sm:text-5xl font-extrabold font-mono ${metrics.statusColor}`}>
                {metrics.pollutionPercent}%
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${metrics.badgeBg} ${metrics.borderColor} ${metrics.statusColor}`}>
                {metrics.status}
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.pollutionPercent > 75
                    ? 'bg-red-500'
                    : metrics.pollutionPercent > 50
                    ? 'bg-orange-500'
                    : metrics.pollutionPercent > 25
                    ? 'bg-amber-400'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${metrics.pollutionPercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              {metrics.shortAdvice}
            </p>
          </div>

          {/* Card 2: Smog Level */}
          <div className="p-6 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Current Smog Level
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-zinc-900 dark:text-white">
                {metrics.smogPercent}%
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                {metrics.smogPercent > 65 ? 'Dense Smog' : metrics.smogPercent > 35 ? 'Moderate Haze' : 'Clear Air'}
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-500"
                style={{ width: `${metrics.smogPercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              Particulate haze in the air. Dense smog tends to peak in early mornings and late evenings.
            </p>
          </div>
        </div>

        {/* Interactive Google Map Style View */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Pollution Map
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive map showing estimated pollution levels in nearby areas. Click on any circle to view its readings.
            </p>
          </div>

          <AirPollutionMap
            center={{ lat: location.lat, lon: location.lon, name: location.name }}
            basePollutionPercent={metrics.pollutionPercent}
            baseSmogPercent={metrics.smogPercent}
            baseStatus={metrics.status}
          />
        </div>
      </div>

      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </DashboardLayout>
  );
};
