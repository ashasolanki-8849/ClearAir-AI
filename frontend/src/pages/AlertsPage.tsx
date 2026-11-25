import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAQI } from '../context/AQIContext';
import { useToast } from '../context/ToastContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Wind,
  CheckCircle2,
  Sliders,
  Check,
  CheckCheck,
} from 'lucide-react';
import { apiClient } from '../services/api';

interface DynamicAlert {
  id: string;
  type: 'high_pollution' | 'very_high' | 'sudden_increase' | 'unsafe_outdoor';
  title: string;
  message: string;
  severity: 'warning' | 'critical' | 'info';
  timestamp: string;
  read: boolean;
}

export const AlertsPage = () => {
  const { aqiData, location, refreshAlertCount } = useAQI();
  const { showToast } = useToast();
  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<DynamicAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate realistic, actual pollution-grounded alerts based on current location and telemetry
    const generatedAlerts: DynamicAlert[] = [];
    const now = new Date();

    if (metrics.pollutionPercent > 75) {
      generatedAlerts.push({
        id: 'alt_very_high',
        type: 'very_high',
        title: 'Very High Pollution Warning',
        message: `Pollution is very high in ${location.name} (${metrics.pollutionPercent}%). Avoid outdoor exercise and keep windows closed.`,
        severity: 'critical',
        timestamp: 'Just now',
        read: false,
      });
    } else if (metrics.pollutionPercent > 50) {
      generatedAlerts.push({
        id: 'alt_high',
        type: 'high_pollution',
        title: 'High Pollution Advisory',
        message: `Pollution level is high in ${location.name} (${metrics.pollutionPercent}%). Sensitive individuals and children should stay indoors.`,
        severity: 'warning',
        timestamp: '15 mins ago',
        read: false,
      });
    }

    if (metrics.smogPercent > 60) {
      generatedAlerts.push({
        id: 'alt_smog',
        type: 'unsafe_outdoor',
        title: 'Unsafe Outdoor Smog Conditions',
        message: 'Dense winter smog is lingering in the breathing zone. If travelling outside, wear a well-fitting mask.',
        severity: 'warning',
        timestamp: '1 hour ago',
        read: false,
      });
    }

    if (aqiData?.hourlyTrend && aqiData.hourlyTrend.length >= 2) {
      const recent = aqiData.hourlyTrend.slice(-2);
      if (recent[1].aqi > recent[0].aqi + 15) {
        generatedAlerts.push({
          id: 'alt_spike',
          type: 'sudden_increase',
          title: 'Sudden Pollution Increase',
          message: 'Air pollution has risen over the last 2 hours due to cold morning atmospheric stagnation.',
          severity: 'warning',
          timestamp: '2 hours ago',
          read: true,
        });
      }
    }

    // Default safe baseline notice if air is Low
    if (generatedAlerts.length === 0) {
      generatedAlerts.push({
        id: 'alt_normal',
        type: 'unsafe_outdoor',
        title: 'Air Quality is Fair',
        message: `Pollution in ${location.name} is currently low to moderate (${metrics.pollutionPercent}%). Outdoor conditions are currently safe for regular activities.`,
        severity: 'info',
        timestamp: 'Today',
        read: true,
      });
    }

    setAlerts(generatedAlerts);
  }, [aqiData, location, metrics.pollutionPercent, metrics.smogPercent]);

  const handleToggleAlerts = () => {
    const nextState = !alertsEnabled;
    setAlertsEnabled(nextState);
    showToast(
      nextState ? 'Pollution alert notifications enabled.' : 'Notifications disabled.',
      'info'
    );
  };

  const handleMarkAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    showToast('All alerts marked as read.', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Bell className="w-7 h-7 text-sky-500" />
              <span>Pollution Alerts</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Timely warnings when air pollution reaches dangerous levels near {location.name}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-zinc-400" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Notifications Setting Toggle Card */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Pollution Notifications
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive in-app alerts whenever air quality drops to High or Very High.
            </p>
          </div>

          <button
            onClick={handleToggleAlerts}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              alertsEnabled ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
            role="switch"
            aria-checked={alertsEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                alertsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Current Alerts ({alerts.filter((a) => !a.read).length} new)
          </h2>

          <div className="space-y-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alt.severity === 'critical'
                    ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20'
                    : alt.severity === 'warning'
                    ? 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black'
                } ${alt.read ? 'opacity-85' : 'shadow-sm'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        alt.severity === 'critical'
                          ? 'bg-red-500 text-white'
                          : alt.severity === 'warning'
                          ? 'bg-orange-500 text-white'
                          : 'bg-sky-500/10 text-sky-500'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                          {alt.title}
                        </h3>
                        {!alt.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-500" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {alt.message}
                      </p>
                      <span className="text-[11px] text-zinc-400 block pt-1">
                        {alt.timestamp}
                      </span>
                    </div>
                  </div>

                  {!alt.read && (
                    <button
                      onClick={() => handleMarkAsRead(alt.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 text-xs"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
