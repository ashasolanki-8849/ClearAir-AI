import React, { useState } from 'react';
import { SustainabilityScoreData } from '../../types';
import { Award, Info, CheckCircle2, Flame, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SustainabilityScoreCardProps {
  score: SustainabilityScoreData;
  onRefresh?: () => void;
}

export const SustainabilityScoreCard: React.FC<SustainabilityScoreCardProps> = ({ score }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getScoreVariant = (val: number) => {
    if (val >= 80) return { badge: 'good' as const, label: 'Eco Leader', color: 'text-emerald-500' };
    if (val >= 60) return { badge: 'satisfactory' as const, label: 'Active Practitioner', color: 'text-teal-500' };
    if (val >= 40) return { badge: 'moderate' as const, label: 'Developing Habits', color: 'text-amber-500' };
    return { badge: 'poor' as const, label: 'Getting Started', color: 'text-rose-500' };
  };

  const status = getScoreVariant(score.overall);

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Personal Sustainability Score
              </h3>
              <Badge variant={status.badge}>{status.label}</Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Empirical habit index based on verified actions, challenge milestones, and household practices
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 self-start sm:self-auto px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>How Score is Calculated</span>
          {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center pt-2">
        {/* Big Number */}
        <div className="sm:col-span-2 flex items-center space-x-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
            {score.overall}
            <span className="text-base text-zinc-400 font-sans font-normal ml-1">/100</span>
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
              {score.overall >= 70 ? 'Excellent Progress' : score.overall >= 50 ? 'Steady Progress' : 'Room to Improve'}
            </div>
            <p className="text-zinc-400 text-[11px] leading-tight">
              Calculated using 4 objective criteria with zero arbitrary numbers.
            </p>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="sm:col-span-3 space-y-2.5 text-xs">
          {/* 1. Action Completion */}
          <div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-1">
              <span className="font-medium">Action Completion (Max 40 pts)</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {score.actionCompletionScore} / 40
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(score.actionCompletionScore / 40) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. Challenge Progress */}
          <div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-1">
              <span className="font-medium">7-Day Challenge Progress (Max 25 pts)</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {score.challengeScore} / 25
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(score.challengeScore / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Category Breadth */}
          <div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-1">
              <span className="font-medium">Lifestyle Category Breadth (Max 20 pts)</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {score.diversityScore} / 20
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(score.diversityScore / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 4. Household Practices */}
          <div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300 mb-1">
              <span className="font-medium">Household Practices (Max 15 pts)</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {score.householdScore} / 15
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(score.householdScore / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Explanation Accordion */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 mt-3 animate-in fade-in duration-200">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Transparent Mathematical Scoring Formula
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {score.calculationExplanation}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <div>• Actions: (Completed Actions / Total Active Actions) × 40</div>
            <div>• Challenge: (Completed Challenge Days / 7) × 25</div>
            <div>• Breadth: (Active Categories Practiced / 7) × 20</div>
            <div>• Household: Segregation (4) + Compost (4) + Solar (3) + Water (2) + Star App (2)</div>
          </div>
        </div>
      )}
    </div>
  );
};
