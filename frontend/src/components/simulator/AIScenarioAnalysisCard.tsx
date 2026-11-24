import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Wind
} from 'lucide-react';
import { 
  SimulationBaselineData, 
  SimulationParametersData, 
  SimulationResultsData, 
  SimulationAIAnalysisData 
} from '../../types';
import { simulationService } from '../../services/simulationService';

interface AIScenarioAnalysisCardProps {
  baseline: SimulationBaselineData;
  parameters: SimulationParametersData;
  results: SimulationResultsData;
  initialAnalysis?: SimulationAIAnalysisData;
}

export const AIScenarioAnalysisCard: React.FC<AIScenarioAnalysisCardProps> = ({
  baseline,
  parameters,
  results,
  initialAnalysis,
}) => {
  const [analysis, setAnalysis] = useState<SimulationAIAnalysisData | undefined>(initialAnalysis);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAIAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await simulationService.analyzeScenarioWithAI({
        baseline,
        parameters,
        results,
      });

      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      } else {
        setError(res.error || 'Failed to generate AI scenario analysis');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI explanation service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              AI Scenario Explanation & Science
              {analysis && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Confidence: {analysis.confidenceLevel}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Deep GenAI analysis breaking down physical causal mechanisms, limitations, and beneficiary groups.
          </p>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/30 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Atmospheric Box...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!analysis && !loading && (
        <div className="py-12 text-center text-zinc-500 text-sm">
          <Bot className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
          <p className="font-semibold text-zinc-300">Ready for Evidence-Based Scenario Evaluation</p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            Click <strong>Generate AI Analysis</strong> to have our environmental public health co-pilot explain the physical mechanisms and community benefits of this specific simulation.
          </p>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: What Changes */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. What Changes in This Scenario?</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{analysis.whatChanges}</p>
          </div>

          {/* Card 2: Why Pollution Changes */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Wind className="w-4 h-4" />
              <span>2. Underlying Physical Mechanisms</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{analysis.whyPollutionChanges}</p>
          </div>

          {/* Card 3: Pollutants & Beneficiaries */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                <Flame className="w-4 h-4" />
                <span>3. Pollutants Directly Affected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.pollutantsAffected.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
                <Users className="w-4 h-4" />
                <span>4. Primary Demographic Beneficiaries</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{analysis.whoBenefits}</p>
            </div>
          </div>

          {/* Card 4: Atmospheric Limitations & Caveats */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>5. Physical Airshed Limitations</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-400 leading-relaxed">
              {analysis.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Card 5: Practical Next Steps (Span 2) */}
          <div className="md:col-span-2 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>6. Recommended Practical Actions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analysis.practicalActions.map((act, idx) => (
                <div key={idx} className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                  <span className="font-bold text-emerald-400 font-mono">{idx + 1}.</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider whitespace-nowrap">Community Coordination:</span>
              <span className="text-zinc-300">{analysis.communityParticipation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIScenarioAnalysisCard;
