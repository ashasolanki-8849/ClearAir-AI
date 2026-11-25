import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAQI } from '../context/AQIContext';
import { calculatePollutionMetrics, PollutionStatus } from '../utils/pollutionScale';
import { forecastService } from '../services/forecastService';
import { Calendar, TrendingUp, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ForecastDayItem {
  dayLabel: string;
  dateStr: string;
  pollutionPercent: number;
  status: PollutionStatus;
}

export const ForecastPage: React.FC = () => {
  const { location, aqiData, refreshAQI, isLoading: aqiLoading } = useAQI();
  const todayMetrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const [forecastDays, setForecastDays] = useState<ForecastDayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDataAvailable, setIsDataAvailable] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, [location]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const res = await forecastService.getDailyForecast(location.lat, location.lon, 7, location.name);

      if (res.success && res.dailyForecast && res.dailyForecast.length > 0) {
        setIsDataAvailable(true);

        const mapped: ForecastDayItem[] = res.dailyForecast.map((item, idx) => {
          let label = item.dayName;
          if (idx === 0) label = 'Today';
          else if (idx === 1) label = 'Tomorrow';

          // Normalized percentage
          const pPercent = Math.min(100, Math.max(5, Math.round((item.avgAqi / 400) * 100)));
          let status: PollutionStatus = 'Low';
          if (pPercent > 75) status = 'Very High';
          else if (pPercent > 50) status = 'High';
          else if (pPercent > 25) status = 'Moderate';

          return {
            dayLabel: label,
            dateStr: item.date,
            pollutionPercent: pPercent,
            status,
          };
        });

        setForecastDays(mapped);
      } else {
        // If external API has no forecast data for location
        setIsDataAvailable(false);
      }
    } catch (e) {
      console.error('Forecast fetch error:', e);
      setIsDataAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-sky-500" />
              <span>Pollution Forecast</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>7-day air outlook for {location.name}</span>
            </p>
          </div>

          <button
            onClick={fetchForecast}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            <span>Update Forecast</span>
          </button>
        </div>

        {!isDataAvailable ? (
          <div className="p-8 rounded-3xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
              Forecast Unavailable
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
              Pollution forecast is not available for this location right now.
            </p>
          </div>
        ) : (
          <>
            {/* Today's Pollution Level Card */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Today's Air Status
                </span>
                <div className="flex items-baseline gap-3">
                  <span className={`text-4xl font-extrabold font-mono ${todayMetrics.statusColor}`}>
                    {todayMetrics.pollutionPercent}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${todayMetrics.badgeBg} ${todayMetrics.borderColor} ${todayMetrics.statusColor}`}>
                    {todayMetrics.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  {todayMetrics.shortAdvice}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-zinc-100 dark:sm:border-zinc-900 sm:pl-6 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Smog Factor: <strong>{todayMetrics.smogPercent}%</strong></span>
              </div>
            </div>

            {/* Clear Forecast Trend Graph as requested */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Pollution Trend Over Coming Days
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Predicted daily pollution percentages across the week.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pollutionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload as ForecastDayItem;
                          return (
                            <div className="p-2.5 rounded-xl bg-black text-white text-xs border border-zinc-800 shadow-md">
                              <p className="font-bold">{d.dayLabel}</p>
                              <p className="text-sky-400 font-mono">Pollution: {d.pollutionPercent}%</p>
                              <p className="text-zinc-400 text-[10px]">Status: {d.status}</p>
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
                      fill="url(#pollutionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day-by-Day Forecast List */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Day-by-Day Forecast
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {forecastDays.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">
                        {item.dayLabel}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Very High'
                            ? 'bg-red-500/10 text-red-500'
                            : item.status === 'High'
                            ? 'bg-orange-500/10 text-orange-500'
                            : item.status === 'Moderate'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-sky-500/10 text-sky-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs text-zinc-400">Pollution:</span>
                      <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
                        {item.pollutionPercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
