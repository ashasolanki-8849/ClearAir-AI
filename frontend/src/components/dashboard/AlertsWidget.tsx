import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertItem } from '../../types';
import { apiClient } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const AlertsWidget = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiClient<{ success: boolean; alerts: AlertItem[] }>('/alerts');
        if (res.success && res.alerts) {
          setAlerts(res.alerts.slice(0, 3));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient(`/alerts/${id}/read`, { method: 'PATCH' });
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, read: true } : a))
      );
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return null;
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <Bell className="w-4 h-4 text-emerald-500" />
            <span>No critical pollution warnings active for this region right now.</span>
          </div>
          <Link to="/alerts" className="text-emerald-500 hover:underline">
            Configure thresholds →
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-amber-500/30 dark:border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Active Smog & Air Quality Alerts
          </h4>
        </div>
        <Link
          to="/alerts"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1"
        >
          <span>All Alerts</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`flex items-start justify-between p-3 rounded-lg border text-xs transition-colors ${
              alert.read
                ? 'bg-zinc-50/50 border-zinc-200/50 dark:bg-black/30 dark:border-zinc-900 text-zinc-500'
                : 'bg-white border-zinc-200 dark:bg-black dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
            }`}
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{alert.title}</span>
                <Badge
                  variant={alert.severity === 'critical' ? 'severe' : alert.severity === 'high' ? 'poor' : 'moderate'}
                  size="sm"
                >
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
                {alert.message}
              </p>
            </div>

            {!alert.read && (
              <button
                onClick={() => handleMarkAsRead(alert._id)}
                className="shrink-0 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-emerald-500"
                title="Mark as read"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
