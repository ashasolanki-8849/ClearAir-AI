import React, { useState } from 'react';
import { CommunityAIData } from '../../types';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Package,
  ShieldAlert,
  Database,
  Building,
} from 'lucide-react';

interface AskCommunityAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  communityType: string;
  onAskAdvice: (query?: string) => Promise<CommunityAIData>;
}

export const AskCommunityAIModal: React.FC<AskCommunityAIModalProps> = ({
  isOpen,
  onClose,
  communityName,
  communityType,
  onAskAdvice,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<CommunityAIData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchAdvice = async (customQuery?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await onAskAdvice(customQuery || query);
      setAdvice(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate community advice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Ask Community AI Advisor
              </h3>
              <p className="text-xs text-zinc-500">
                Collective environmental safeguards tailored to {communityName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input / Suggested Prompts */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. How should our RWA prevent leaf burning and protect security guards?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetchAdvice();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleFetchAdvice()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? 'Consulting...' : <><Send className="w-3.5 h-3.5" /> Advise</>}
            </button>
          </div>

          {/* Quick prompt pills */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="text-zinc-400 py-1">Quick Scenarios:</span>
            <button
              onClick={() => {
                setQuery('What collective precautions are needed today given severe winter smog?');
                handleFetchAdvice('What collective precautions are needed today given severe winter smog?');
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Emergency Smog Protocol
            </button>
            <button
              onClick={() => {
                setQuery('How to stop open refuse burning in our neighborhood perimeter?');
                handleFetchAdvice('How to stop open refuse burning in our neighborhood perimeter?');
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Zero Burning Strategy
            </button>
            <button
              onClick={() => {
                setQuery('How can our society protect maintenance staff and security guards?');
                handleFetchAdvice('How can our society protect maintenance staff and security guards?');
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Guard & Staff Welfare
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Structured AI Output Cards */}
        {advice && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
            {/* Summary */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
              <h5 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                Actionable Environmental Summary
              </h5>
              <p className="text-zinc-700 dark:text-emerald-100/90 leading-relaxed">
                {advice.summary}
              </p>
            </div>

            {/* Identified Concerns */}
            {advice.identified_concerns && advice.identified_concerns.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Identified Local Concerns
                </h5>
                <ul className="space-y-1 pl-2">
                  {advice.identified_concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="text-amber-500">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Actions */}
            {advice.recommended_actions && advice.recommended_actions.length > 0 && (
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Priority Collective Actions
                </h5>
                <div className="space-y-2">
                  {advice.recommended_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                          {act.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
                          {act.priority}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 leading-normal">
                        {act.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                        <span>Target: <b>{act.targetGroup}</b></span>
                        <span className="text-emerald-600 dark:text-emerald-400">Outcome: {act.expectedOutcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Implementation Steps & Resources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advice.implementation_steps && advice.implementation_steps.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h6 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-blue-500" />
                    Implementation Roadmap
                  </h6>
                  <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 text-[11px]">
                    {advice.implementation_steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
              )}

              {advice.estimated_resources && advice.estimated_resources.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h6 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-500" />
                    Estimated Resources
                  </h6>
                  <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 text-[11px]">
                    {advice.estimated_resources.map((res, i) => (
                      <li key={i}>• {res}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sources & Transparency Note */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Sources: {advice.data_sources?.join(', ')}
              </span>
              <span>Ground truth environmental AI advisory</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
