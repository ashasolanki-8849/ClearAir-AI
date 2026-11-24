import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HourlyForecastData } from '../../types';
import { Clock, TrendingUp, Filter, Sparkles, Wind, Thermometer, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HourlyForecastChartProps {
  data: HourlyForecastData[];
  hoursToDisplay: number;
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  data,
  hoursToDisplay,
}) => {
  const [activeMetric, setActiveMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');

  const slicedData = data.slice(0, hoursToDisplay);

  const formattedChartData = slicedData.map((d) => {
    const timeObj = new Date(d.time);
    const hourLabel = timeObj.toLocaleTimeString([], { hour: 'numeric' });
    const dayLabel = timeObj.toLocaleDateString([], { weekday: 'short' });

    return {
      time: `${dayLabel} ${hourLabel}`,
      rawTime: d.time,
      hourOffset: d.hourOffset,
      aqi: d.aqi,
      category: d.category,
      pm25: d.pollutants.pm25,
      pm10: d.pollutants.pm10,
      temperature: d.weather.temperature,
      humidity: d.weather.humidity,
      windSpeed: d.weather.windSpeed,
      condition: d.weather.condition,
      confidenceScore: d.confidenceScore,
      confidenceLevel: d.confidenceLevel,
    };
  });

  const getMetricColor = () => {
    switch (activeMetric) {
      case 'pm25':
        return '#f97316'; // orange
      case 'pm10':
        return '#eab308'; // yellow
      default:
        return '#10b981'; // emerald
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0].payload;

    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-lg text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{pt.time}</span>
          <span className="text-[10px] text-zinc-400">+{pt.hourOffset}h horizon</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Predicted AQI:</span>
          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
            {pt.aqi}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {pt.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
          <div>PM2.5: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pt.pm25} µg/m³</span></div>
          <div>PM10: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pt.pm10} µg/m³</span></div>
          <div>Temp: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pt.temperature}°C</span></div>
          <div>Wind: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{pt.windSpeed} km/h</span></div>
        </div>

        <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
          <span>{pt.condition}</span>
          <span className="font-mono">Confidence: {pt.confidenceScore}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Hourly Predicted Telemetry ({hoursToDisplay} Hours)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Empirical atmospheric predictions derived from Open-Meteo & Copernicus CAMS ensemble
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveMetric('aqi')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeMetric === 'aqi'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Predicted AQI
          </button>
          <button
            onClick={() => setActiveMetric('pm25')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeMetric === 'pm25'
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            PM2.5 (µg/m³)
          </button>
          <button
            onClick={() => setActiveMetric('pm10')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeMetric === 'pm10'
                ? 'bg-white dark:bg-zinc-800 text-yellow-600 dark:text-yellow-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            PM10 (µg/m³)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] md:h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.25} vertical={false} />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              interval={Math.ceil(formattedChartData.length / 8)}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              domain={[0, 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* CPCB Threshold Reference Lines */}
            {activeMetric === 'aqi' && (
              <>
                <ReferenceLine
                  y={100}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: 'Moderate (100)', fill: '#eab308', fontSize: 9, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={200}
                  stroke="#f97316"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: 'Poor (200)', fill: '#f97316', fontSize: 9, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={300}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                  label={{ value: 'Severe (300)', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }}
                />
              </>
            )}

            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={getMetricColor()}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#forecastAreaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>0-50 Good</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>51-100 Satisfactory</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>101-200 Moderate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>201-300 Poor</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>301+ Severe</span>
          </span>
        </div>

        <div className="font-mono text-[10px] text-zinc-400">
          Model Confidence decreases on &gt;24h horizons
        </div>
      </div>
    </div>
  );
};
