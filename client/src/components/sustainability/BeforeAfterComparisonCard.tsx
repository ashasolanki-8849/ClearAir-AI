import React from 'react';
import { BeforeAfterComparisonItem } from '../../types';
import { ArrowRight, TrendingDown, Award, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface BeforeAfterComparisonCardProps {
  comparisons: BeforeAfterComparisonItem[];
  overallMonthlyCo2SavedKg?: number;
  overallMonthlyMoneySavedInr?: number;
  disclaimerNotice?: string;
}

export const BeforeAfterComparisonCard: React.FC<BeforeAfterComparisonCardProps> = ({
  comparisons,
  overallMonthlyCo2SavedKg = 131.7,
  overallMonthlyMoneySavedInr = 3120,
  disclaimerNotice,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Compare Your Lifestyle Changes
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Measured comparison between previous unsustainable habits and verified green alternatives
          </p>
        </div>

        {/* Aggregate Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Badge variant="good">
            ~{overallMonthlyCo2SavedKg} kg CO2e Avoided / Mo
          </Badge>
          {overallMonthlyMoneySavedInr > 0 && (
            <Badge variant="outline">
              ~₹{overallMonthlyMoneySavedInr} / Mo Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-4">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-3 text-xs"
          >
            {/* Category Banner */}
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">
                {item.category}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {item.changeSummary}
              </span>
            </div>

            {/* Side-by-Side Visual Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Before */}
              <div className="p-3 rounded-lg bg-rose-50/30 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-900/30 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Previous Habit (Before)
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {item.beforeHabit}
                </p>
                <div className="text-[11px] font-mono text-rose-700 dark:text-rose-300 pt-1">
                  Metric: {item.beforeValueText}
                </div>
              </div>

              {/* After */}
              <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Sustainable Alternative (After)
                </span>
                <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {item.afterAlternative}
                </p>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 pt-1 font-bold">
                  Metric: {item.afterValueText}
                </div>
              </div>
            </div>

            {/* Scientific Explanation & Citation */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 gap-1">
              <span>{item.scientificExplanation}</span>
              <span className="text-zinc-400 shrink-0 italic">{item.disclaimer}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scientific Honesty Disclaimer */}
      {disclaimerNotice && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
          <strong>Transparency Notice:</strong> {disclaimerNotice}
        </div>
      )}
    </div>
  );
};
