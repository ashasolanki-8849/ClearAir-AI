import React, { useState } from 'react';
import { BudgetAlternativeData, BudgetPreference } from '../../types';
import { Wallet, Tag, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../common/Badge';

interface BudgetSolutionsViewProps {
  alternatives: BudgetAlternativeData[];
  onSelectBudget?: (b: BudgetPreference) => void;
  selectedBudget?: BudgetPreference;
}

export const BudgetSolutionsView: React.FC<BudgetSolutionsViewProps> = ({
  alternatives,
  onSelectBudget,
  selectedBudget = 'all',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const budgetTiers: Array<{ id: BudgetPreference; label: string; desc: string }> = [
    { id: 'all', label: 'All Budgets', desc: 'Browse all practical alternatives' },
    { id: 'free', label: 'Free (₹0)', desc: 'Pure habit & operational changes' },
    { id: 'low_cost', label: 'Low Cost (< ₹500)', desc: 'Affordable daily replacements' },
    { id: 'medium_budget', label: 'Medium (₹500–₹5K)', desc: 'Durable household upgrades' },
    { id: 'high_investment', label: 'Investment (> ₹5K)', desc: 'Rooftop solar, BLDC, appliances' },
  ];

  const filtered = alternatives.filter(
    (a) => selectedBudget === 'all' || a.costCategory === selectedBudget
  );

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Find Sustainable Alternatives Within My Budget
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Transparent comparison between current habits and viable replacements categorized by upfront cost
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-zinc-400 self-start sm:self-auto">
          {filtered.length} Options Filtered
        </span>
      </div>

      {/* Budget Tier Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {budgetTiers.map((tier) => {
          const isSelected = selectedBudget === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onSelectBudget && onSelectBudget(tier.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <div className="font-bold text-xs truncate">{tier.label}</div>
              <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{tier.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Alternatives Comparison Cards */}
      <div className="space-y-3 pt-2">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={item.costCategory === 'free' ? 'good' : 'satisfactory'}>
                    {item.costCategoryLabel}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="text-xs text-zinc-400">
                    Difficulty: <strong className="capitalize text-zinc-700 dark:text-zinc-300">{item.implementationDifficulty}</strong>
                  </span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
                {/* Current Habit */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    Current Habit / Product
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {item.currentHabit}
                  </p>
                </div>

                {/* Replacement */}
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-2 md:pt-0 md:pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Sustainable Replacement
                  </span>
                  <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                    {item.suggestedReplacement}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Practical Benefit:</span>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{item.expectedPracticalBenefit}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Environmental Consideration:</span>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">{item.environmentalConsiderations}</p>
                </div>
              </div>

              {/* Expanded Steps & Savings */}
              {isExpanded && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs animate-in fade-in duration-150">
                  {item.estimatedSavings && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                      <span>Supported Monthly Savings:</span>
                      <span className="font-mono font-bold">
                        ~₹{item.estimatedSavings.amount} / {item.estimatedSavings.period} ({item.estimatedSavings.description})
                      </span>
                    </div>
                  )}

                  {item.implementationSteps && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Action Steps:</span>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-0.5">
                        {item.implementationSteps.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 pt-1">
                    Verified Citation: {item.citation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
