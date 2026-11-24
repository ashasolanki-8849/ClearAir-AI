import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Zap,
  Target
} from 'lucide-react';
import { 
  ScenarioRecommendationsData, 
  SimulationParametersData 
} from '../../types';
import { simulationService } from '../../services/simulationService';

interface SimulationRecommendationsCardProps {
  baselineAqi: number;
  city: string;
  onApplyRecommendation: (params: Partial<SimulationParametersData>) => void;
}

export const SimulationRecommendationsCard: React.FC<SimulationRecommendationsCardProps> = ({
  baselineAqi,
  city,
  onApplyRecommendation,
}) => {
  const [data, setData] = useState<ScenarioRecommendationsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        setLoading(true);
        const res = await simulationService.getRecommendations(baselineAqi, city);
        if (res.success && res.recommendations) {
          setData(res.recommendations);
        }
      } catch (err) {
        console.error('Failed to load simulation recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, [baselineAqi, city]);

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400">
        <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent mb-2" />
        <p className="text-xs">Evaluating optimal atmospheric recommendation pathways...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">System Scenario Recommendations</h3>
          <p className="text-xs text-zinc-400">
            Four scientifically optimized pathways targeting maximum feasibility, effort-to-benefit ratio, and health protection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rec 1: Best Achievable Scenario */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Best Achievable
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                -{data.bestAchievable.estimatedAqiReduction} AQI Pts
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{data.bestAchievable.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-3">{data.bestAchievable.subtitle}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.bestAchievable.levers.map((l, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {l}
                </span>
              ))}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{data.bestAchievable.whySuggested}</p>
          </div>

          <button
            onClick={() => onApplyRecommendation({
              vehicleReductionPct: 60,
              wasteBurningBanCompliancePct: 95,
              treesPlantedCount: 10000,
              constructionDustMitigationPct: 75,
              publicTransitAdoptionPct: 50,
            })}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
          >
            <span>Apply Best Achievable</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* Rec 2: Most Practical Scenario */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Most Practical
              </span>
              <span className="text-xs font-mono font-bold text-sky-400">
                -{data.mostPractical.estimatedAqiReduction} AQI Pts
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{data.mostPractical.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-3">{data.mostPractical.subtitle}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.mostPractical.levers.map((l, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {l}
                </span>
              ))}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{data.mostPractical.whySuggested}</p>
          </div>

          <button
            onClick={() => onApplyRecommendation({
              vehicleReductionPct: 40,
              publicTransitAdoptionPct: 50,
              carpoolingHouseholdsCount: 200,
            })}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
          >
            <span>Apply Most Practical</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>

        {/* Rec 3: Lowest Effort Win */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Lowest Effort (Society Win)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                -{data.lowestEffort.estimatedAqiReduction} AQI Pts
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{data.lowestEffort.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-3">{data.lowestEffort.subtitle}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.lowestEffort.levers.map((l, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {l}
                </span>
              ))}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{data.lowestEffort.whySuggested}</p>
          </div>

          <button
            onClick={() => onApplyRecommendation({
              wasteBurningBanCompliancePct: 90,
              householdsIndoorPurifiedCount: 250,
              constructionDustMitigationPct: 30,
            })}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
          >
            <span>Apply Lowest Effort</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Rec 4: Highest Health Benefit */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Highest Health Protection
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                -{data.highestHealthBenefit.estimatedAqiReduction} AQI Pts
              </span>
            </div>
            <h4 className="text-base font-bold text-white">{data.highestHealthBenefit.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-3">{data.highestHealthBenefit.subtitle}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.highestHealthBenefit.levers.map((l, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {l}
                </span>
              ))}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{data.highestHealthBenefit.whySuggested}</p>
          </div>

          <button
            onClick={() => onApplyRecommendation({
              householdsIndoorPurifiedCount: 500,
              peakHourOutdoorAvoidancePct: 80,
              vehicleReductionPct: 20,
            })}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
          >
            <span>Apply Health Shield</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SimulationRecommendationsCard;
