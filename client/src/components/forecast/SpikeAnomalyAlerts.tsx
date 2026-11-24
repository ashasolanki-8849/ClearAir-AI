import React from 'react';
import { AnomalySpikeData } from '../../types';
import { AlertTriangle, Activity, Zap, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SpikeAnomalyAlertsProps {
  anomalies: AnomalySpikeData[];
}

export const SpikeAnomalyAlerts: React.FC<SpikeAnomalyAlertsProps> = ({ anomalies }) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical_spike':
        return <Badge variant="severe">Critical Spike</Badge>;
      case 'severe':
        return <Badge variant="verypoor">Severe Deviation</Badge>;
      case 'moderate':
        return <Badge variant="moderate">Moderate Anomaly</Badge>;
      default:
        return <Badge variant="satisfactory">Mild</Badge>;
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Statistical Anomaly & Spike Detection
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Algorithmic detection of unusual particulate surges exceeding 24h rolling statistical thresholds
          </p>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
          {anomalies.length} Flagged
        </span>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            No Statistical Anomalies Detected
          </h4>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Pollutant levels are tracking smoothly within standard 2-sigma variance limits without sudden uncharacteristic spikes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((a, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      {a.pollutant.toUpperCase()} Spike (+{a.anomalyDelta} µg/m³ above baseline)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      Target Time: {formatTime(a.timestamp)}
                    </span>
                  </div>
                </div>

                {getSeverityBadge(a.severity)}
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-center text-[11px]">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Projected Peak</span>
                  <span className="font-bold text-red-600 dark:text-red-400 font-mono">
                    {a.detectedValue} µg/m³
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">24h Mean Baseline</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {a.baselineValue} µg/m³
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Deviation Z-Score</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    +{a.zScore} σ
                  </span>
                </div>
              </div>

              {/* Causes */}
              <div className="space-y-1 pt-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] block">
                  Contributing Atmospheric Conditions:
                </span>
                <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                  {a.possibleCauses.map((cause, cIdx) => (
                    <li key={cIdx}>{cause}</li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-zinc-800 dark:text-zinc-200">
                <span className="font-bold text-amber-800 dark:text-amber-400">Action: </span>
                {a.actionableAdvice}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
