import React from 'react';
import { 
  GitCompare, 
  ArrowDownRight, 
  ArrowUpRight, 
  Minus, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Wind, 
  Car, 
  Flame, 
  HeartHandshake,
  Activity
} from 'lucide-react';
import { 
  SimulationBaselineData, 
  SimulationResultsData 
} from '../../types';

interface ScenarioComparisonViewProps {
  baseline: SimulationBaselineData;
  results: SimulationResultsData;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  baseline,
  results,
}) => {
  const getCategoryColor = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30', label: 'Satisfactory' };
    if (aqi <= 200) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Moderate' };
    if (aqi <= 300) return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Poor' };
    if (aqi <= 400) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Very Poor' };
    return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Severe' };
  };

  const currentStyle = getCategoryColor(baseline.currentAqi);
  const simulatedStyle = getCategoryColor(results.simulatedAqi);
  const recommendedStyle = getCategoryColor(results.comparison.recommended.aqi);

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Scientific Transparency Callout */}
      <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1.5">
              Scientific Model Boundary Note
            </div>
            <h4 className="text-sm font-bold text-white">
              Hypothetical Simulation Estimates vs. Measured Real-Time Telemetry
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              <strong>Current Situation</strong> is measured directly from continuous CPCB / Copernicus atmospheric stations. In contrast, <strong>Simulated Situation</strong> and <strong>Recommended Situation</strong> are physics-informed hypothetical estimates derived from peer-reviewed urban source-apportionment models (TERI / IIT Kanpur). Hypothetical projections never replace real-time regulatory sensors.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Three-State Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* State 1: Current Situation */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">STATE 1</span>
                <h4 className="text-base font-black text-white">Current Situation</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Measured Baseline
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Ambient AQI</div>
                <div className="text-3xl font-black text-white font-mono mt-0.5">{baseline.currentAqi}</div>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
                {currentStyle.label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900 text-xs font-mono">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">PM2.5 Fine</span>
                <span className="font-bold text-white">{baseline.currentPm25} µg/m³</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">PM10 Coarse</span>
                <span className="font-bold text-white">{baseline.currentPm10} µg/m³</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
              <span className="font-semibold text-zinc-300 block mb-0.5">Health Exposure Risk:</span>
              {results.comparison.current.personalRisk}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] text-zinc-500">
            Station: {baseline.stationName || baseline.city} • Live Telemetry
          </div>
        </div>

        {/* State 2: Simulated Situation (User Configuration) */}
        <div className="bg-zinc-950 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">STATE 2</span>
                <h4 className="text-base font-black text-white flex items-center gap-1.5">
                  Simulated Situation
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active Levers
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Simulated AQI</div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-2">
                  {results.simulatedAqi}
                  {results.aqiChange !== 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                      {results.aqiChange > 0 ? '+' : ''}{results.aqiChange} pts
                    </span>
                  )}
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${simulatedStyle.bg} ${simulatedStyle.text} ${simulatedStyle.border}`}>
                {simulatedStyle.label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900 text-xs font-mono">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">PM2.5 (-{results.pm25ReductionPct}%)</span>
                <span className="font-bold text-emerald-400">{results.simulatedPm25} µg/m³</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">PM10 (-{results.pm10ReductionPct}%)</span>
                <span className="font-bold text-emerald-400">{results.simulatedPm10} µg/m³</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-300 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/30">
              <span className="font-semibold text-emerald-400 block mb-0.5">Projected Health Protection:</span>
              {results.comparison.simulated.personalRisk}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-emerald-400/90 font-mono">
            <span>Inhaled Dose Avoided:</span>
            <span className="font-bold">{(results.personalInhaledDoseAvoidedGrams * 1000).toFixed(1)} mg PM2.5</span>
          </div>
        </div>

        {/* State 3: Recommended Situation */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">STATE 3</span>
                <h4 className="text-base font-black text-white">Recommended Target</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Optimal Benchmark
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Target AQI</div>
                <div className="text-3xl font-black text-white font-mono mt-0.5">
                  {results.comparison.recommended.aqi}
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${recommendedStyle.bg} ${recommendedStyle.text} ${recommendedStyle.border}`}>
                {recommendedStyle.label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-900 text-xs font-mono">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">Target PM2.5</span>
                <span className="font-bold text-sky-400">{results.comparison.recommended.pm25} µg/m³</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 font-sans block">Target PM10</span>
                <span className="font-bold text-sky-400">{results.comparison.recommended.pm10} µg/m³</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
              <span className="font-semibold text-zinc-300 block mb-0.5">Target Benchmark Risk:</span>
              {results.comparison.recommended.personalRisk}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 text-[11px] text-zinc-500">
            Balanced feasible levers: 40% transport, 50% zero-burn, 40% dust control
          </div>
        </div>
      </div>

      {/* 3. Detailed Physical Impacts Ledger */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-zinc-400">
          Estimated Physical Emissions & Exposure Avoided
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Car className="w-3.5 h-3.5 text-sky-400" />
              Tailpipe CO₂e Avoided
            </div>
            <div className="text-xl font-black text-white font-mono mt-1">
              {results.tailpipeEmissionsAvoidedKgCO2e} <span className="text-xs font-normal text-zinc-400">kg/day</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              Tailpipe PM2.5 Prevented
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              {results.tailpipePm25AvoidedGrams} <span className="text-xs font-normal text-zinc-400">g/day</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              Personal Inhaled Dose Cut
            </div>
            <div className="text-xl font-black text-white font-mono mt-1">
              {(results.personalInhaledDoseAvoidedGrams * 1000).toFixed(2)} <span className="text-xs font-normal text-zinc-400">mg PM2.5</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Community Participants
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              {results.communityImpact.totalHouseholdParticipants} <span className="text-xs font-normal text-zinc-400">Households</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScenarioComparisonView;
