import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HourlyTrendPoint } from '../../types';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

interface AQITrendChartProps {
  data: HourlyTrendPoint[];
}

export const AQITrendChart = ({ data }: AQITrendChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = data.map((d) => {
    let formattedHour = '';
    try {
      const date = new Date(d.time);
      formattedHour = date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    } catch {
      formattedHour = d.time.slice(11, 16);
    }
    return {
      hour: formattedHour,
      aqi: d.aqi,
      pm25: d.pm25,
      temperature: d.temperature,
    };
  });

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            24-Hour Air Quality & Smog Trend
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real hourly observations capturing diurnal peaks, morning traffic surges, and night inversions.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-600 dark:text-zinc-400">AQI Index</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-zinc-600 dark:text-zinc-400">PM2.5 (µg/m³)</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1a1a1a' : '#f0f0f0'}
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke={isDark ? '#666' : '#999'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#222' : '#e5e7eb' }}
            />
            <YAxis
              stroke={isDark ? '#666' : '#999'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isDark ? '#222' : '#e5e7eb' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white p-2.5 shadow-lg dark:border-zinc-800 dark:bg-black text-xs font-mono">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                        {payload[0]?.payload.hour}
                      </p>
                      <p className="text-emerald-500">
                        AQI: <span className="font-bold">{payload[0]?.value}</span>
                      </p>
                      {payload[1] && (
                        <p className="text-amber-500">
                          PM2.5: <span className="font-bold">{payload[1]?.value} µg/m³</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#aqiGradient)"
            />
            <Area
              type="monotone"
              dataKey="pm25"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#pm25Gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
