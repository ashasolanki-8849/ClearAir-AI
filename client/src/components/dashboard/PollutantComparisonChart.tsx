import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

interface PollutantComparisonChartProps {
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
}

export const PollutantComparisonChart = ({ pollutants }: PollutantComparisonChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'PM2.5', current: pollutants.pm25, safeLimit: 60, unit: 'µg/m³' },
    { name: 'PM10', current: pollutants.pm10, safeLimit: 100, unit: 'µg/m³' },
    { name: 'NO2', current: pollutants.no2, safeLimit: 80, unit: 'µg/m³' },
    { name: 'SO2', current: pollutants.so2, safeLimit: 80, unit: 'µg/m³' },
    { name: 'O3', current: pollutants.o3, safeLimit: 100, unit: 'µg/m³' },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Pollutant Concentrations vs. Safety Limits
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comparing current ambient readings directly with CPCB 24-hour permissible limits.
          </p>
        </div>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1a1a1a' : '#f0f0f0'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
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
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white p-2.5 shadow-lg dark:border-zinc-800 dark:bg-black text-xs font-mono">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-emerald-500">
                        Current: <span className="font-bold">{item.current} {item.unit}</span>
                      </p>
                      <p className="text-zinc-400">
                        Permissible Limit: <span className="font-bold">{item.safeLimit} {item.unit}</span>
                      </p>
                      <p className="text-amber-500 pt-1 font-sans">
                        {item.current > item.safeLimit
                          ? `${(item.current / item.safeLimit).toFixed(1)}x over safety threshold`
                          : 'Within standard safety margin'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="current" fill="#10b981" radius={[4, 4, 0, 0]} name="Current Level" />
            <Bar dataKey="safeLimit" fill={isDark ? '#262626' : '#e5e7eb'} radius={[4, 4, 0, 0]} name="Permissible Limit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
