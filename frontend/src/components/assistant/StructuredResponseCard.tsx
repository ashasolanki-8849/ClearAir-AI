import React, { useState } from 'react';
import { StructuredAIResponse } from '../../types';
import {
  Shield,
  Clock,
  Sparkles,
  Leaf,
  HeartPulse,
  Sun,
  Moon,
  CloudSun,
  Sunset,
  HelpCircle,
  AlertTriangle,
  Radio,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { getAQIConfig } from '../../utils/aqiHelper';

interface StructuredResponseCardProps {
  data: StructuredAIResponse;
  onSelectFollowUp?: (question: string) => void;
}

export const StructuredResponseCard: React.FC<StructuredResponseCardProps> = ({
  data,
  onSelectFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'routine' | 'whatif'>('recommendations');
  const aqiConfig = getAQIConfig(data.current_conditions?.category || data.risk_level);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* 1. Context Grounding Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-black/50">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: aqiConfig.color }}
          />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {data.current_conditions?.locationName}
          </span>
          <span className="text-zinc-400">•</span>
          <span className="font-mono font-bold" style={{ color: aqiConfig.color }}>
            AQI {data.current_conditions?.aqi ?? 'N/A'} ({data.current_conditions?.category})
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          {data.current_conditions?.is_live ? (
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <Radio className="w-3 h-3" />
              Live Telemetry
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Info className="w-3 h-3" />
              Baseline Model
            </span>
          )}
          {data.current_conditions?.temperature != null && (
            <span>• {data.current_conditions.temperature}°C</span>
          )}
        </div>
      </div>

      {/* 2. Primary Executive Summary */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#070707] leading-relaxed text-zinc-800 dark:text-zinc-200">
        <p>{data.summary}</p>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
            activeTab === 'recommendations'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Actionable Guidance ({data.recommendations?.length || 0})</span>
        </button>

        {data.daily_routine && (
          <button
            onClick={() => setActiveTab('routine')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'routine'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Routine</span>
          </button>
        )}

        {data.what_if_analysis && (
          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'whatif'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>What-If Analysis</span>
          </button>
        )}
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3 pt-1">
          {data.recommendations?.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-2.5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  {rec.category}
                </span>
                {rec.timing && (
                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.timing}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
                  {rec.action}
                </h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              {/* Impact Explanation Engine: Personal vs Environmental Benefit */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Personal Benefit */}
                <div className="p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    <HeartPulse className="w-3 h-3" />
                    <span>Personal Inhalation Impact</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-normal">
                    {rec.personal_benefit}
                  </p>
                </div>

                {/* Environmental Benefit */}
                <div className="p-2.5 rounded-lg bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase font-mono text-cyan-600 dark:text-cyan-400">
                    <Leaf className="w-3 h-3" />
                    <span>Environmental Emission Impact</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-normal">
                    {rec.environmental_benefit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DYNAMIC DAILY ROUTINE */}
      {activeTab === 'routine' && data.daily_routine && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-500">
              <Sun className="w-3.5 h-3.5" />
              <span>MORNING</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.daily_routine.morning}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400">
              <CloudSun className="w-3.5 h-3.5" />
              <span>AFTERNOON</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.daily_routine.afternoon}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-orange-400">
              <Sunset className="w-3.5 h-3.5" />
              <span>EVENING</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.daily_routine.evening}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-400">
              <Moon className="w-3.5 h-3.5" />
              <span>NIGHT</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.daily_routine.night}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT-IF ANALYSIS */}
      {activeTab === 'whatif' && data.what_if_analysis && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Scenario: {data.what_if_analysis.scenario}</span>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
              Predicted Exposure Consequences:
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {data.what_if_analysis.consequences}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safer Actionable Alternative:</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300">
              {data.what_if_analysis.safer_alternative}
            </p>
          </div>
        </div>
      )}

      {/* 4. Follow-up Clickable Prompts */}
      {data.follow_up_questions && data.follow_up_questions.length > 0 && (
        <div className="pt-2">
          <p className="text-[11px] font-mono uppercase font-bold text-zinc-400 mb-2">
            Suggested Follow-up Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {data.follow_up_questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFollowUp && onSelectFollowUp(q)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition-colors group"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Non-clinical Disclaimer Footer */}
      {data.limitations && data.limitations.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 space-y-0.5">
          {data.limitations.map((lim, idx) => (
            <p key={idx} className="italic leading-normal">
              • {lim}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
