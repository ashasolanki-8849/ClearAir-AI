import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Wind,
  Home,
  Clock,
  Car,
  Lightbulb,
  Flame,
  Check,
} from 'lucide-react';

interface DailyAction {
  id: string;
  title: string;
  impact: string;
}

const DEFAULT_DAILY_ACTIONS: DailyAction[] = [
  {
    id: 'act-1',
    title: 'Wipe indoor floors with a damp cloth instead of sweeping with a dry broom',
    impact: 'Stops fine dust particles from flying up into your breathing zone.',
  },
  {
    id: 'act-2',
    title: 'Avoid morning outdoor exercise during cold smoggy windows (6:00 AM – 9:00 AM)',
    impact: 'Prevents heavy particulate buildup in your lungs when inversion smog is trapped near the ground.',
  },
  {
    id: 'act-3',
    title: 'Switch one trip today to the metro, public bus, or a carpool',
    impact: 'Cuts direct vehicle exhaust emissions on local roads.',
  },
  {
    id: 'act-4',
    title: 'Turn off switches and appliances when not in use',
    impact: 'Reduces electricity demand from regional coal and fossil power stations.',
  },
  {
    id: 'act-5',
    title: 'Never burn dry garden leaves or household waste',
    impact: 'Directly stops toxic black carbon and choking smoke in your neighborhood.',
  },
  {
    id: 'act-6',
    title: 'Cover cooking pots with lids while cooking on the stove',
    impact: 'Reduces cooking gas consumption and keeps cooking fumes from filling bedrooms.',
  },
];

export const WhatToDoPage = () => {
  const [completedActions, setCompletedActions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('clearair_completed_actions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('clearair_completed_actions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-sky-500" />
            <span>What To Do</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Simple, practical actions to protect your health and reduce pollution.
          </p>
        </div>

        {/* Section 1: Protect Yourself */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">1. Protect Yourself</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Simple steps to stay safe when air pollution is high.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>When to avoid outdoor activities</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cold winter mornings (6:00 AM to 9:00 AM) and late evenings trap heavy smog near the ground. Shift exercise to afternoons or indoors.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>How to reduce exposure to smog</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                If you must travel in heavy traffic, wear a snug-fitting N95 or well-filtered mask and keep car windows rolled up with air recirculation on.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-sky-500" />
                <span>How to keep indoor air cleaner</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Close doors and windows during smog peaks. Seal door draft gaps with a cloth or draft stopper, and avoid burning incense or mosquito coils inside.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Extra care for family members</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Children and elderly family members with asthma or heart conditions should stay indoors when pollution is High or Very High.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Reduce Pollution */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">2. Reduce Pollution</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ways our daily habits can prevent adding more smoke into the air.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-sky-500" />
                <span>Use public transport & carpool</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Taking the metro or bus instead of solo car trips takes dozens of exhaust pipes off the road.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                <span>Save electricity at home</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Turn off geysers, lights, and appliances when not needed. Saving power directly reduces emissions from thermal power plants.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Never burn garden waste or trash</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Open burning of dry leaves, garbage, or plastics creates toxic ground-level smoke. Compost leaves into soil instead.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Avoid unnecessary idling</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Turn off your vehicle engine at traffic red lights if the wait is over 20 seconds to prevent localized fumes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Simple Daily Actions */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">3. Simple Daily Actions</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tap to mark actions you completed today.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {completedActions.length} of {DEFAULT_DAILY_ACTIONS.length} Done
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {DEFAULT_DAILY_ACTIONS.map((action) => {
              const isDone = completedActions.includes(action.id);
              return (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isDone
                      ? 'border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-sky-500 border-sky-500 text-white'
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <p
                      className={`font-semibold ${
                        isDone
                          ? 'text-zinc-900 dark:text-white line-through opacity-70'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {action.title}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {action.impact}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
