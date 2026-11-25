import React from 'react';
import { StructuredAIResponse } from '../../types';
import {
  ShieldCheck,
  Clock,
  Sparkles,
  HeartPulse,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { calculatePollutionMetrics } from '../../utils/pollutionScale';

interface StructuredResponseCardProps {
  data: StructuredAIResponse;
  onSelectFollowUp?: (question: string) => void;
}

export const StructuredResponseCard: React.FC<StructuredResponseCardProps> = ({
  data,
  onSelectFollowUp,
}) => {
  const metrics = calculatePollutionMetrics(data.current_conditions?.aqi);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* Location & Status Banner */}
      {data.current_conditions?.locationName && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${metrics.dotColor}`} />
            <span className="font-semibold text-zinc-900 dark:text-white">
              {data.current_conditions.locationName}
            </span>
            <span className="text-zinc-400">•</span>
            <span className={`font-bold ${metrics.statusColor}`}>
              Pollution: {metrics.pollutionPercent}% ({metrics.status})
            </span>
          </div>

          {data.current_conditions.temperature != null && (
            <span className="text-[11px] text-zinc-400">
              {data.current_conditions.temperature}°C
            </span>
          )}
        </div>
      )}

      {/* Main Friendly Explanation Summary */}
      <div className="space-y-2">
        <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
          {data.summary}
        </p>
      </div>

      {/* Practical Action Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Recommended Actions:
          </span>
          <div className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 space-y-1 shadow-2xs"
              >
                <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{rec.action}</span>
                </div>
                {rec.reason && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-6 leading-relaxed">
                    {rec.reason}
                  </p>
                )}
                {rec.personal_benefit && (
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 pl-6 font-medium">
                    Protection: {rec.personal_benefit}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Routine Summary (if provided) */}
      {data.daily_routine && (
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Daily Safety Routine:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {data.daily_routine.morning && (
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">🌅 Morning:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{data.daily_routine.morning}</span>
              </div>
            )}
            {data.daily_routine.afternoon && (
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">☀️ Afternoon:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{data.daily_routine.afternoon}</span>
              </div>
            )}
            {data.daily_routine.evening && (
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">🌇 Evening:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{data.daily_routine.evening}</span>
              </div>
            )}
            {data.daily_routine.night && (
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">🌙 Night:</span>
                <span className="text-zinc-600 dark:text-zinc-400">{data.daily_routine.night}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-up Question Chips */}
      {data.follow_up_questions && data.follow_up_questions.length > 0 && onSelectFollowUp && (
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
            You might also want to ask:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.follow_up_questions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectFollowUp(q)}
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-sky-500 text-[11px] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
