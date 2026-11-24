import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Car, 
  Trash2, 
  FileText,
  Sparkles
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { SmartEnvironmentalInsight } from '../../types';

interface SmartEnvironmentalInsightsCardProps {
  onOpenAdvisor?: () => void;
  onOpenCalculator?: () => void;
}

export const SmartEnvironmentalInsightsCard: React.FC<SmartEnvironmentalInsightsCardProps> = ({ 
  onOpenAdvisor,
  onOpenCalculator 
}) => {
  const [insights, setInsights] = useState<SmartEnvironmentalInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await impactService.getSmartInsights();
        if (res.success && res.data) {
          setInsights(res.data);
        }
      } catch (err) {
        console.error('Error fetching smart insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">High Impact</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Opportunity</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">Notice</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="w-4 h-4 text-sky-400" />;
      case 'electricity': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-purple-400" />;
      case 'data_gap': return <FileText className="w-4 h-4 text-rose-400" />;
      default: return <Lightbulb className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Smart Environmental Insights</h3>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Rule-based analytics highlighting highest emission drivers, audit gaps, and high-leverage steps.
          </p>
        </div>

        {onOpenAdvisor && (
          <button
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Impact AI Co-Pilot
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-2" />
          <p className="text-xs">Analyzing historical footprint patterns...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="py-10 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-300">Your environmental ledger is well-balanced!</p>
          <p className="text-xs text-zinc-500 mt-1">Continue recording activities and utility readings for deeper pattern analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                      {getCategoryIcon(ins.category || 'general')}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {(ins.category || 'general').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {getPriorityBadge(ins.priority || 'medium')}
                </div>

                <h4 className="text-base font-bold text-white mb-1.5">{ins.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{ins.description}</p>
              </div>

              {ins.recommendedAction && (
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium line-clamp-1">
                    → {ins.recommendedAction}
                  </span>
                  {ins.category === 'data_gap' && onOpenCalculator && (
                    <button
                      onClick={onOpenCalculator}
                      className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1 flex-shrink-0 ml-2"
                    >
                      Log Now <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
