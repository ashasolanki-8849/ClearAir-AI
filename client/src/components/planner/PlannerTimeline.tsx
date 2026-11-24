import React from 'react';
import { PlannedActivity } from '../../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRightLeft,
  Shield,
  HeartPulse,
  Leaf,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  AlertTriangle,
  Building,
  Navigation,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PlannerTimelineProps {
  activities: PlannedActivity[];
  onToggleStatus: (activityId: string, currentStatus: string) => void;
  onSwapAlternative: (activityId: string) => void;
  filter: 'all' | 'pending' | 'completed';
}

export const PlannerTimeline: React.FC<PlannerTimelineProps> = ({
  activities,
  onToggleStatus,
  onSwapAlternative,
  filter,
}) => {
  const filtered = activities.filter((act) => {
    if (filter === 'completed') return act.status === 'completed';
    if (filter === 'pending') return act.status !== 'completed';
    return true;
  });

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'early_morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'morning':
        return <Navigation className="w-4 h-4 text-orange-400" />;
      case 'afternoon':
        return <CloudSun className="w-4 h-4 text-amber-400" />;
      case 'evening':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night':
      default:
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'severe':
        return <Badge variant="severe">Severe Risk</Badge>;
      case 'high':
        return <Badge variant="poor">High Risk</Badge>;
      case 'moderate':
        return <Badge variant="moderate">Moderate Risk</Badge>;
      default:
        return <Badge variant="good">Low Risk</Badge>;
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {filter === 'completed'
            ? 'No activities marked as completed yet.'
            : 'All scheduled activities for today are completed! Great job protecting your air quality.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((act) => {
        const isCompleted = act.status === 'completed';

        return (
          <div
            key={act.id}
            className={`p-4 sm:p-5 rounded-xl border transition-all ${
              isCompleted
                ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10 opacity-75'
                : act.pollutionRisk === 'severe'
                ? 'border-red-500/30 bg-red-500/5 dark:bg-red-950/10'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {/* Header: Period & Time */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleStatus(act.id, act.status)}
                  className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                  title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase font-mono text-zinc-700 dark:text-zinc-300">
                  {getPeriodIcon(act.period)}
                  <span>{act.periodLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {act.recommendedTime}
                </span>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  {act.indoorOutdoor}
                </span>

                {getRiskBadge(act.pollutionRisk)}
              </div>
            </div>

            {/* Activity Name & Scientific Reason */}
            <div className="py-3 space-y-1.5">
              <div className="flex items-start justify-between gap-4">
                <h3
                  className={`text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug ${
                    isCompleted ? 'line-through text-zinc-500 dark:text-zinc-500' : ''
                  }`}
                >
                  {act.activity}
                </h3>

                {act.alternativeActivity && !isCompleted && (
                  <button
                    onClick={() => onSwapAlternative(act.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline shrink-0 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors"
                    title="Swap with pre-calculated safer alternative"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Swap Alternative</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {act.reason}
              </p>
            </div>

            {/* Impact Explanation Engine */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                  <HeartPulse className="w-3 h-3" />
                  <span>Personal Inhalation Benefit</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-normal">
                  {act.personalBenefit || act.expectedBenefit}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase font-mono text-cyan-600 dark:text-cyan-400">
                  <Leaf className="w-3 h-3" />
                  <span>Environmental Emission Impact</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-normal">
                  {act.environmentalBenefit || 'Low-emission conscious scheduling.'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
