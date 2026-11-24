import React from 'react';
import { PollutantForecastData } from '../../types';
import { Layers, ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

interface PollutantForecastGridProps {
  pollutants: PollutantForecastData[];
}

export const PollutantForecastGrid: React.FC<PollutantForecastGridProps> = ({ pollutants }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Multi-Pollutant Trajectory Matrix
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Individual chemical species modeled via Copernicus CAMS numerical chemistry transport
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          6 Key Contaminants
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pollutants.map((p) => {
          const isExceeded = p.forecast24h > p.safetyThreshold24h;
          const pctOfThreshold = Math.min(100, Math.round((p.forecast24h / p.safetyThreshold24h) * 100));

          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isExceeded
                  ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
                  : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {p.name.split('(')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {p.trend === 'increasing' ? (
                      <span className="text-red-500 text-[10px] font-bold flex items-center">
                        <ArrowUpRight className="w-3 h-3" /> Rising
                      </span>
                    ) : p.trend === 'decreasing' ? (
                      <span className="text-emerald-500 text-[10px] font-bold flex items-center">
                        <ArrowDownRight className="w-3 h-3" /> Falling
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">Stable</span>
                    )}
                  </div>
                </div>

                {/* Values Table */}
                <div className="my-2 p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Current</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      {p.currentValue}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{p.unit}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block">+6h Forecast</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      {p.forecast6h}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{p.unit}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block">+24h Forecast</span>
                    <span
                      className={`font-bold font-mono ${
                        isExceeded ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {p.forecast24h}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">{p.unit}</span>
                  </div>
                </div>

                {/* Threshold Safety Bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>24h Threshold: {p.safetyThreshold24h} {p.unit}</span>
                    <span className={isExceeded ? 'text-red-500 font-bold' : 'text-emerald-500'}>
                      {pctOfThreshold}% Limit
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pctOfThreshold >= 100
                          ? 'bg-red-500'
                          : pctOfThreshold >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pctOfThreshold}%` }}
                    />
                  </div>
                </div>

                {/* Biological Health Significance */}
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {p.healthSignificance}
                </p>
              </div>

              {/* Status footer */}
              <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>Standard: CPCB 24h</span>
                <span>{isExceeded ? 'Exceeds Guideline' : 'Within Safety Band'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
