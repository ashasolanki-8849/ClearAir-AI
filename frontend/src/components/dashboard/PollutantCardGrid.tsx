import { PollutantDetail } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface PollutantCardGridProps {
  pollutants: Record<string, number | null>;
}

interface PollutantMeta {
  key: string;
  name: string;
  unit: string;
  limit24h: number;
  description: string;
}

const POLLUTANT_METAS: PollutantMeta[] = [
  {
    key: 'pm25',
    name: 'PM2.5',
    unit: 'µg/m³',
    limit24h: 60,
    description: 'Fine inhalable combustion particles entering deep lung alveoli.',
  },
  {
    key: 'pm10',
    name: 'PM10',
    unit: 'µg/m³',
    limit24h: 100,
    description: 'Coarse dust, road dust, and construction particulates.',
  },
  {
    key: 'no2',
    name: 'NO2',
    unit: 'µg/m³',
    limit24h: 80,
    description: 'Nitrogen dioxide from motor vehicles and diesel emissions.',
  },
  {
    key: 'so2',
    name: 'SO2',
    unit: 'µg/m³',
    limit24h: 80,
    description: 'Sulphur dioxide from power plants and coal combustion.',
  },
  {
    key: 'co',
    name: 'CO',
    unit: 'mg/m³',
    limit24h: 2.0,
    description: 'Carbon monoxide from incomplete automobile exhaust.',
  },
  {
    key: 'o3',
    name: 'O3',
    unit: 'µg/m³',
    limit24h: 100,
    description: 'Ground-level ozone formed by smog photochemical reactions.',
  },
  {
    key: 'nh3',
    name: 'NH3',
    unit: 'µg/m³',
    limit24h: 400,
    description: 'Ammonia from agricultural fertilizers and biomass decay.',
  },
];

export const PollutantCardGrid = ({ pollutants }: PollutantCardGridProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Individual Pollutant Telemetry
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Current concentrations measured against CPCB & WHO 24-hour health guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {POLLUTANT_METAS.map((meta) => {
          const value = pollutants[meta.key];
          if (value === undefined) return null;

          const numericVal = typeof value === 'number' ? value : 0;
          const ratio = numericVal / meta.limit24h;

          let status: 'good' | 'moderate' | 'poor' | 'severe' = 'good';
          let statusLabel = 'Safe';
          if (ratio > 2.0) {
            status = 'severe';
            statusLabel = 'Hazardous';
          } else if (ratio > 1.0) {
            status = 'poor';
            statusLabel = 'Exceeded';
          } else if (ratio > 0.6) {
            status = 'moderate';
            statusLabel = 'Moderate';
          }

          const percentBar = Math.min(100, Math.round(ratio * 100));

          return (
            <Card key={meta.key} className="flex flex-col justify-between p-4.5 hoverable">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {meta.name}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                        {value != null ? value : 'N/A'}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{meta.unit}</span>
                    </div>
                  </div>

                  <Badge variant={status} size="sm">
                    {statusLabel}
                  </Badge>
                </div>

                {/* Progress bar towards limit */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Standard: {meta.limit24h} {meta.unit}</span>
                    <span>{percentBar}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        status === 'severe'
                          ? 'bg-red-600'
                          : status === 'poor'
                          ? 'bg-orange-500'
                          : status === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentBar}%` }}
                    />
                  </div>
                </div>

                <p className="mt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-2">
                  {meta.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
