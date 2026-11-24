import React from 'react';
import { ChallengeProgressData, ChallengeDayData } from '../../types';
import { Award, CheckCircle2, Circle, Clock, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface GreenChallengeViewProps {
  progress: ChallengeProgressData;
  onToggleDay?: (dayNumber: number, isCompleted: boolean) => void;
}

export const GreenChallengeView: React.FC<GreenChallengeViewProps> = ({
  progress,
  onToggleDay,
}) => {
  const percentComplete = Math.round((progress.completedDaysCount / progress.totalDays) * 100);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-500" />
              {progress.challengeTitle}
            </h3>
            {progress.badgeAwarded && <Badge variant="good">Champion Awarded</Badge>}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            7 achievable micro-actions building sustainable daily resilience without hazardous outdoor smog exposure
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {progress.completedDaysCount} / {progress.totalDays} Days
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            {percentComplete}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Day by Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {progress.daysProgress.map((day) => {
          return (
            <div
              key={day.dayNumber}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                day.isCompleted
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-900/50'
                  : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {day.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {day.title}
                  </h4>
                </div>

                {/* Checkbox button */}
                {onToggleDay && (
                  <button
                    onClick={() => onToggleDay(day.dayNumber, !day.isCompleted)}
                    className={`p-1 rounded-lg transition-colors shrink-0 ${
                      day.isCompleted
                        ? 'text-emerald-500 hover:text-emerald-600'
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {day.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">
                {day.practicalAction}
              </p>

              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{day.estimatedTimeMinutes} mins
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[180px]">
                  {day.expectedBenefit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
