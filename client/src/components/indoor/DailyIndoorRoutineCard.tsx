import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sun, CloudSun, Sunset, Moon, CheckCircle2, Shield, Wind, Fan } from 'lucide-react';

export const DailyIndoorRoutineCard: React.FC = () => {
  const ROUTINE_PERIODS = [
    {
      period: 'Morning (07:00 – 10:00)',
      icon: Sun,
      color: 'text-amber-500',
      badge: 'Peak Inversion Risk',
      badgeVariant: 'poor',
      outdoorContext: 'Cold nocturnal boundary layer traps dense PM2.5 at breathing height outdoors.',
      action: 'Keep external windows latched shut. Avoid early morning dry broom sweeping; use damp mop on floors.',
      purifierRule: 'Run True HEPA on medium or high in living and study spaces.',
      kitchenRule: 'Ensure exhaust fan is on before boiling morning tea or heating breakfast oil.',
    },
    {
      period: 'Afternoon (12:00 – 15:30)',
      icon: CloudSun,
      color: 'text-amber-400',
      badge: 'Midday Solar Mixing Window',
      badgeVariant: 'good',
      outdoorContext: 'Solar surface heating expands the thermal boundary layer, breaking the ground inversion.',
      action: 'Perform a strategic 5–10 minute cross-ventilation pulse to flush accumulated indoor CO2 and moisture.',
      purifierRule: 'Purifier can run on eco mode during the window, then boost to Turbo for 15 minutes post-sealing.',
      kitchenRule: 'Ideal time to air out food storage cabinets and sun drying cushions.',
    },
    {
      period: 'Evening (18:00 – 21:00)',
      icon: Sunset,
      color: 'text-orange-500',
      badge: 'Cooking & Commute Influx',
      badgeVariant: 'moderate',
      outdoorContext: 'Evening traffic rush-hour merges with cooling air, causing secondary particulate rise.',
      action: 'Keep bedroom corridor doors firmly shut while dinner is being cooked. Wipe dining counters with damp cloth.',
      purifierRule: 'Keep bedroom purifiers active to maintain a pristine sleeping sanctuary.',
      kitchenRule: 'Run kitchen chimney at maximum speed; keep lids over frying pans to contain splatter aerosols.',
    },
    {
      period: 'Night (21:00 – 07:00)',
      icon: Moon,
      color: 'text-indigo-400',
      badge: 'Bedroom Recovery Sanctuary',
      badgeVariant: 'satisfactory',
      outdoorContext: 'Night radiative cooling traps heavy smog near ground level across the city.',
      action: 'Ensure bedroom windows are tightly latched. Place door draft stopper at bedroom threshold. Sleep in 18–22°C ambient temperature.',
      purifierRule: 'Switch True HEPA air purifier to Night/Sleep mode (<30 dB whisper quiet) for continuous 8-hour lung protection.',
      kitchenRule: 'Ensure all gas cylinders and fuel valves are securely shut off before sleeping.',
    },
  ];

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
            <Wind className="w-4 h-4" />
            Module 3 Synchronized Protocol
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            24-Hour Diurnal Indoor Air Quality Routine
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Harmonizing window ventilation, kitchen exhaust, and HEPA scrubbing with the atmospheric smog curve.
          </p>
        </div>
        <Badge variant="outline">4 Day Periods</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {ROUTINE_PERIODS.map((rp, i) => {
          const Icon = rp.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${rp.color}`} />
                    {rp.period}
                  </span>
                  <Badge variant={rp.badgeVariant as any}>{rp.badge}</Badge>
                </div>

                <p className="text-[11px] text-zinc-500 italic">
                  * {rp.outdoorContext}
                </p>

                <div className="space-y-1.5 pt-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Room Action:</strong> {rp.action}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Purifier Protocol:</strong> {rp.purifierRule}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Fan className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Kitchen Rule:</strong> {rp.kitchenRule}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
