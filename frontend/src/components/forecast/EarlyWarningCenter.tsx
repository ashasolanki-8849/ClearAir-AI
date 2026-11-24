import React from 'react';
import { EarlyWarningAlertData } from '../../types';
import {
  BellRing,
  AlertOctagon,
  AlertTriangle,
  Info,
  CloudRain,
  Sun,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EarlyWarningCenterProps {
  alerts: EarlyWarningAlertData[];
  onMarkRead?: (id: string) => void;
}

export const EarlyWarningCenter: React.FC<EarlyWarningCenterProps> = ({ alerts, onMarkRead }) => {
  const getSeverityBadgeVariant = (sev: string) => {
    switch (sev) {
      case 'emergency':
        return 'severe';
      case 'alert':
        return 'verypoor';
      case 'warning':
        return 'moderate';
      default:
        return 'good';
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'severe_hazard':
        return AlertOctagon;
      case 'rain_cleansing':
        return CloudRain;
      case 'improving_window':
        return Sun;
      default:
        return AlertTriangle;
    }
  };

  const formatExpectedTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-500" />
            AI Early-Warning Intelligence Center
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Automated alerts detecting impending severe smog episodes, rapid deterioration, and cleansing windows
          </p>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
          {alerts.length} Active Warnings
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            No Active Health Risk Alerts
          </h4>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Upcoming atmospheric conditions are tracking smoothly without rapid jumps or acute particulate peaks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const Icon = getAlertIcon(alert.category);
            const isSevere = alert.severity === 'emergency' || alert.severity === 'alert';

            return (
              <div
                key={alert.id || idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                  alert.read
                    ? 'opacity-60 bg-zinc-50/40 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800'
                    : isSevere
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 shadow-sm'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSevere
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {alert.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Expected Window: {formatExpectedTime(alert.expectedTime)} • Projected AQI: ~{alert.expectedAqi}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {alert.explanation}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Preventive Protocol:
                    </span>{' '}
                    {alert.recommendedAction}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 self-stretch sm:self-auto shrink-0">
                  <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>

                  {onMarkRead && alert.id && !alert.read && (
                    <button
                      onClick={() => onMarkRead(alert.id!)}
                      className="text-[10px] text-zinc-500 hover:text-emerald-500 flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
