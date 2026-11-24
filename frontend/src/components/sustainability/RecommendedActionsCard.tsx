import React, { useState } from 'react';
import { SustainableRecommendationData, SustainabilityCategory, BudgetPreference } from '../../types';
import {
  Leaf,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface RecommendedActionsCardProps {
  recommendations: SustainableRecommendationData[];
  onCompleteAction?: (id: string) => void;
  onSelectCategory?: (cat: string) => void;
  selectedCategory?: string;
}

export const RecommendedActionsCard: React.FC<RecommendedActionsCardProps> = ({
  recommendations,
  onCompleteAction,
  onSelectCategory,
  selectedCategory = 'all',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeBudgetFilter, setActiveBudgetFilter] = useState<string>('all');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Categories' },
    { id: 'transportation', label: '🚗 Transport' },
    { id: 'energy', label: '⚡ Energy' },
    { id: 'cooking', label: '🍳 Kitchen' },
    { id: 'waste', label: '♻️ Waste' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'water', label: '💧 Water' },
    { id: 'environment', label: '🌿 Environment' },
  ];

  const filtered = recommendations.filter((r) => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchBudget = activeBudgetFilter === 'all' || r.costCategory === activeBudgetFilter;
    return matchCategory && matchBudget;
  });

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'severe';
      case 'recommended':
        return 'satisfactory';
      default:
        return 'default';
    }
  };

  const getCostBadge = (cost: BudgetPreference) => {
    switch (cost) {
      case 'free':
        return <Badge variant="good">Free / Zero Cost</Badge>;
      case 'low_cost':
        return <Badge variant="satisfactory">Low Cost (&lt; ₹500)</Badge>;
      case 'medium_budget':
        return <Badge variant="moderate">Medium Budget</Badge>;
      default:
        return <Badge variant="outline">Investment</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            Recommended Lifestyle Improvements
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Prioritized alternatives based on your profile, budget, and local environmental conditions
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-zinc-400 self-start sm:self-auto">
          {filtered.length} Actions Available
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory && onSelectCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3 pt-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
            <p>No actions found for the selected category.</p>
            <button
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className="text-emerald-500 underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item._id;

            return (
              <div
                key={item._id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getPriorityBadgeVariant(item.priority)}>
                        {item.priority === 'high' ? 'High Priority' : item.priority === 'recommended' ? 'Recommended' : 'Optional'}
                      </Badge>
                      {getCostBadge(item.costCategory)}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-0.5">
                      {item.recommendedAlternative}
                    </h4>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Replaces: <span className="line-through">{item.currentHabit}</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                    {onCompleteAction && (
                      <button
                        onClick={() => onCompleteAction(item._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>I Do This</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      title="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Why this alternative is recommended */}
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                  {item.reason}
                </p>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-xs animate-in fade-in duration-150">
                    {/* Implementation Steps */}
                    {item.implementationSteps && item.implementationSteps.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                          How to Implement
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                          {item.implementationSteps.map((step, idx) => (
                            <li key={idx} className="leading-snug">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Dual Benefit Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                          Personal Health & Exposure Benefit
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 text-xs">
                          {item.personalBenefit}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-0.5">
                          Environmental Benefit
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 text-xs">
                          {item.environmentalBenefit}
                        </p>
                      </div>
                    </div>

                    {/* Estimated Savings */}
                    {item.estimatedSavings && (
                      <div className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 flex items-center justify-between">
                        <span className="font-semibold text-xs">
                          Estimated Financial Savings:
                        </span>
                        <span className="font-mono font-bold text-xs">
                          ~₹{item.estimatedSavings.amount} / {item.estimatedSavings.period}
                        </span>
                      </div>
                    )}

                    {/* Limitations & Citations */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 gap-1">
                      <span>Source: {item.dataSource.name}</span>
                      {item.limitations && item.limitations[0] && (
                        <span className="italic">Notice: {item.limitations[0]}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
