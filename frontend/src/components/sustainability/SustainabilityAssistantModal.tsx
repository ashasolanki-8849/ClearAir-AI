import React, { useState } from 'react';
import { SustainabilityAIData } from '../../types';
import { sustainabilityService } from '../../services/sustainabilityService';
import { Sparkles, Send, RefreshCw, X, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SustainabilityAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
  currentAqi?: number;
}

export const SustainabilityAssistantModal: React.FC<SustainabilityAssistantModalProps> = ({
  isOpen,
  onClose,
  locationName = 'Delhi NCR',
  currentAqi = 185,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<SustainabilityAIData | null>(null);

  const suggestedQuestions = [
    'How can I reduce pollution in my daily routine?',
    'What sustainable changes can I make without spending money?',
    'What are affordable sustainable alternatives for my kitchen?',
    'How can our apartment society become more sustainable?',
    'Which high-pollution habits should I change first?',
  ];

  if (!isOpen) return null;

  const handleAsk = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setQuery(text);

    try {
      const res = await sustainabilityService.chatWithAdvisor(text, {
        locationName,
        currentAqi,
        dominantPollutant: 'PM2.5',
      });
      if (res.advice) {
        setAdvice(res.advice);
      }
    } catch (err) {
      console.error('Advisor query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  AI Sustainable Lifestyle Advisor
                </h3>
                <Badge variant="outline">Verified Engine</Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Actionable, budget-aware guidance grounded in environmental physics & BEE/CPCB data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Suggestions */}
          {!advice && !loading && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-medium text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className="text-xs text-zinc-500">
                Evaluating lifestyle trade-offs and verified emission benchmarks...
              </p>
            </div>
          )}

          {/* Structured Response Card */}
          {advice && !loading && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
              {/* Summary */}
              <div className="flex items-center justify-between">
                <Badge variant={advice.priority === 'high' ? 'severe' : 'satisfactory'}>
                  {advice.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge variant="outline">{advice.cost_category.toUpperCase()}</Badge>
              </div>

              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {advice.summary}
              </p>

              {/* Habit vs Alternative Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Current Habit</span>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">{advice.current_habit}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Recommended Alternative
                  </span>
                  <p className="text-zinc-900 dark:text-zinc-100 font-bold mt-0.5">
                    {advice.recommended_alternative}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Scientific Rationale:</span>
                <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">{advice.reason}</p>
              </div>

              {/* Implementation Steps */}
              {advice.implementation_steps && advice.implementation_steps.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Action Steps:</span>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-700 dark:text-zinc-300 mt-1">
                    {advice.implementation_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Dual Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    Personal Benefit:
                  </span>
                  <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">{advice.personal_benefit}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                    Environmental Benefit:
                  </span>
                  <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">{advice.environmental_benefit}</p>
                </div>
              </div>

              {/* Savings */}
              {advice.estimated_savings && (
                <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 flex justify-between items-center">
                  <span>Supported Financial Savings:</span>
                  <span className="font-mono font-bold">
                    ~₹{advice.estimated_savings.amount} / {advice.estimated_savings.period}
                  </span>
                </div>
              )}

              {/* Limitations & Sources */}
              <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-0.5">
                {advice.limitations && advice.limitations[0] && (
                  <div>• Notice: {advice.limitations[0]}</div>
                )}
                {advice.data_sources && advice.data_sources[0] && (
                  <div>• Source: {advice.data_sources[0]}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about sustainable habits, energy, waste, or affordable alternatives..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk(query)}
            className="flex-1 text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-hidden"
          />
          <button
            onClick={() => handleAsk(query)}
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
