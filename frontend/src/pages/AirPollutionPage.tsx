import { useState, useMemo } from 'react';
import { useAQI } from '../context/AQIContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import { AirPollutionMap } from '../components/pollution/AirPollutionMap';
import { CloudFog, MapPin, RefreshCw, Activity, Wind, TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AirPollutionPage = () => {
  const { aqiData, location, isLoading, refreshAQI, lastUpdatedTime, detectUserLocation } = useAQI();

  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  // Format real hourly trend data into simple time labels (Morning, Afternoon, Evening, Today)
  const chartData = useMemo(() => {
    if (!aqiData?.hourlyTrend || aqiData.hourlyTrend.length === 0) {
      return [];
    }

    // Pick 5-8 representative points with human-friendly labels
    const points = aqiData.hourlyTrend;
    const step = Math.max(1, Math.floor(points.length / 5));
    const sampled = [];

    for (let i = 0; i < points.length; i += step) {
      const p = points[i];
      const hour = new Date(p.time).getHours();
      let label = 'Today';
      if (hour >= 5 && hour < 12) label = `Morning (${hour}:00)`;
      else if (hour >= 12 && hour < 17) label = `Afternoon (${hour}:00)`;
      else if (hour >= 17 && hour < 21) label = `Evening (${hour}:00)`;
      else label = `Night (${hour}:00)`;

      // Convert AQI to normalized pollution percentage (0-100%)
      const pollutionPercent = Math.min(100, Math.max(5, Math.round((p.aqi / 400) * 100)));

      sampled.push({
        label,
        pollutionPercent,
        aqi: p.aqi,
        time: p.time,
      });
    }

    return sampled;
  }, [aqiData?.hourlyTrend]);

  // Simplify pollutants status without displaying scientific microgram units
  const getPollutantStatus = (val: number | null | undefined, type: 'pm25' | 'pm10' | 'gas') => {
    if (val == null) return { label: 'Good', color: 'text-sky-500', bar: 'w-1/4 bg-sky-500' };
    if (type === 'pm25') {
      if (val > 120) return { label: 'Very High', color: 'text-red-500', bar: 'w-full bg-red-500' };
      if (val > 60) return { label: 'High', color: 'text-orange-500', bar: 'w-3/4 bg-orange-500' };
      if (val > 30) return { label: 'Moderate', color: 'text-amber-500', bar: 'w-1/2 bg-amber-500' };
      return { label: 'Low', color: 'text-sky-500', bar: 'w-1/4 bg-sky-500' };
    }
    if (type === 'pm10') {
      if (val > 250) return { label: 'Very High', color: 'text-red-500', bar: 'w-full bg-red-500' };
      if (val > 100) return { label: 'High', color: 'text-orange-500', bar: 'w-3/4 bg-orange-500' };
      if (val > 50) return { label: 'Moderate', color: 'text-amber-500', bar: 'w-1/2 bg-amber-500' };
      return { label: 'Low', color: 'text-sky-500', bar: 'w-1/4 bg-sky-500' };
    }
    if (val > 80) return { label: 'Elevated', color: 'text-orange-500', bar: 'w-3/4 bg-orange-500' };
    if (val > 40) return { label: 'Moderate', color: 'text-amber-500', bar: 'w-1/2 bg-amber-500' };
    return { label: 'Low', color: 'text-sky-500', bar: 'w-1/4 bg-sky-500' };
  };

  const pm25Status = getPollutantStatus(aqiData?.pollutants?.pm25, 'pm25');
  const pm10Status = getPollutantStatus(aqiData?.pollutants?.pm10, 'pm10');
  const no2Status = getPollutantStatus(aqiData?.pollutants?.no2, 'gas');
  const ozoneStatus = getPollutantStatus(aqiData?.pollutants?.o3, 'gas');

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
              <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span>{location.name}</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* AQI Badge */}
            {aqiData?.aqi != null && (
              <div className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3.5 h-3.5 text-sky-500" />
                <span>AQI: {aqiData.aqi}</span>
              </div>
            )}

            <button
              onClick={refreshAQI}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
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
                  metrics.pollutionPercent > 90
                    ? 'bg-red-900'
                    : metrics.pollutionPercent > 75
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
              Atmospheric particulate haze. Winter smog peaks in cold mornings and late evenings.
            </p>
          </div>
        </div>

        {/* Section: Interactive Zoom-based Pollution Map with Percentages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Pollution Map
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactive map displaying pollution percentages and safety levels across regional stations and local wards.
              </p>
            </div>
          </div>

          <AirPollutionMap
            center={{ lat: location.lat, lon: location.lon, name: location.name }}
            basePollutionPercent={metrics.pollutionPercent}
            baseSmogPercent={metrics.smogPercent}
            baseStatus={metrics.status}
            lastUpdated={lastUpdatedTime}
            onDetectLocation={detectUserLocation}
          />
        </div>

        {/* Section: Available Pollutants (Simple and Understandable) */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Available Pollutants
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Clear breakdown of air pollutants measured by regional environmental sensors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PM2.5 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">PM2.5 (Fine Smoke)</span>
                <span className={`text-xs font-semibold ${pm25Status.color}`}>{pm25Status.label}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pm25Status.bar}`} />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tiny smoke and smog particles that enter deep into lungs.
              </p>
            </div>

            {/* PM10 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">PM10 (Coarse Dust)</span>
                <span className={`text-xs font-semibold ${pm10Status.color}`}>{pm10Status.label}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pm10Status.bar}`} />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Road dust and construction matter causing throat irritation.
              </p>
            </div>

            {/* Nitrogen Dioxide */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">Nitrogen Dioxide</span>
                <span className={`text-xs font-semibold ${no2Status.color}`}>{no2Status.label}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${no2Status.bar}`} />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Vehicle exhaust gas from busy roads and heavy traffic.
              </p>
            </div>

            {/* Ozone & Secondary Smog */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">Ground Ozone</span>
                <span className={`text-xs font-semibold ${ozoneStatus.color}`}>{ozoneStatus.label}</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${ozoneStatus.bar}`} />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Formed when sunlight reacts with urban emissions during midday.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Pollution Graph (Changes over time) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" />
                <span>Pollution Graph Over Time</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Track how pollution changes across morning, afternoon, evening, and night.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pollutionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-md text-xs">
                              <p className="font-semibold text-zinc-900 dark:text-white">{data.label}</p>
                              <p className="text-sky-500 font-bold mt-0.5">
                                Pollution: {data.pollutionPercent}%
                              </p>
                              <p className="text-zinc-400 text-[11px]">AQI: {data.aqi}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pollutionPercent"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#pollutionGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                <Info className="w-4 h-4 text-sky-500" />
                <span>Pollution timeline readings are being updated. Check back shortly.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};