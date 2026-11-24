import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  School, 
  Briefcase, 
  Trees, 
  Flame, 
  Car, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { SimulationParametersData } from '../../types';

interface CommunitySimulationCardProps {
  onApplyCommunityParams: (params: Partial<SimulationParametersData>) => void;
}

export const CommunitySimulationCard: React.FC<CommunitySimulationCardProps> = ({
  onApplyCommunityParams,
}) => {
  const [scaleType, setScaleType] = useState<'society' | 'school' | 'office' | 'ward'>('society');
  const [householdsCount, setHouseholdsCount] = useState<number>(300);
  const [carpoolParticipationPct, setCarpoolParticipationPct] = useState<number>(40);
  const [zeroWasteBanStrict, setZeroWasteBanStrict] = useState<boolean>(true);
  const [purifiedCommonAreas, setPurifiedCommonAreas] = useState<boolean>(true);
  const [treeBufferCount, setTreeBufferCount] = useState<number>(500);

  // Compute Community Outputs
  const activeCarpoolers = Math.round((householdsCount * carpoolParticipationPct) / 100);
  // Average commute: 16 km/day; ICE tailpipe: 0.192 kg CO2e/km, 0.025 g PM2.5/km
  const dailyCommuteKmAvoided = activeCarpoolers * 12;
  const dailyCO2eAvoidedKg = +(dailyCommuteKmAvoided * 0.185).toFixed(1);
  const dailyTailpipePM25AvoidedGrams = +(dailyCommuteKmAvoided * 0.022).toFixed(1);
  const monthlyCO2eAvoidedKg = +(dailyCO2eAvoidedKg * 30).toFixed(0);

  const handleApplyToMainSimulator = () => {
    onApplyCommunityParams({
      carpoolingHouseholdsCount: activeCarpoolers,
      vehicleReductionPct: Math.min(60, Math.round(carpoolParticipationPct * 0.7)),
      wasteBurningBanCompliancePct: zeroWasteBanStrict ? 95 : 40,
      householdsIndoorPurifiedCount: purifiedCommonAreas ? Math.round(householdsCount * 0.4) : 0,
      treesPlantedCount: treeBufferCount,
    });
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Community Scale Simulator</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate collective interventions across housing societies, school campuses, corporate tech parks, and wards.
          </p>
        </div>

        {/* Scale Type Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => { setScaleType('society'); setHouseholdsCount(300); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scaleType === 'society' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Residential Society
          </button>
          <button
            onClick={() => { setScaleType('school'); setHouseholdsCount(800); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scaleType === 'school' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            School / Campus
          </button>
          <button
            onClick={() => { setScaleType('office'); setHouseholdsCount(1200); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              scaleType === 'office' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Corporate Tech Park
          </button>
        </div>
      </div>

      {/* Community Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">
              {scaleType === 'society' ? 'Households / Apartments' : scaleType === 'school' ? 'Students / Faculty' : 'Employees'}
            </span>
            <span className="font-mono font-bold text-white text-sm">{householdsCount}</span>
          </div>
          <input
            type="range"
            min="50"
            max="3000"
            step="50"
            value={householdsCount}
            onChange={(e) => setHouseholdsCount(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Carpool / Shuttle Adherence</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{carpoolParticipationPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={carpoolParticipationPct}
            onChange={(e) => setCarpoolParticipationPct(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Campus Tree Canopy Buffer</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">{treeBufferCount} Trees</span>
          </div>
          <input
            type="range"
            min="50"
            max="2500"
            step="50"
            value={treeBufferCount}
            onChange={(e) => setTreeBufferCount(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Community Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-xs font-semibold text-white">Strict Zero Waste Burning Pact</div>
              <div className="text-[10px] text-zinc-400">Electric heating for night guards + decentralized composting</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={zeroWasteBanStrict}
            onChange={(e) => setZeroWasteBanStrict(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">Clean Air Sanctuaries in Common Halls</div>
              <div className="text-[10px] text-zinc-400">HEPA purified study rooms, gymnasiums and reception lounges</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={purifiedCommonAreas}
            onChange={(e) => setPurifiedCommonAreas(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
          />
        </label>
      </div>

      {/* Computed Collective Scale Metrics */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-950 p-5 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Collective Emissions & Exposure Avoided
          </div>
          <div className="text-xl font-black text-white font-mono flex items-center gap-3">
            <span>{dailyCO2eAvoidedKg} kg CO₂e / day</span>
            <span className="text-xs font-normal text-zinc-400">({monthlyCO2eAvoidedKg} kg / month)</span>
          </div>
          <div className="text-xs text-zinc-300">
            Over <strong className="text-white font-mono">{activeCarpoolers}</strong> actively participating households • <strong className="text-cyan-400 font-mono">{dailyTailpipePM25AvoidedGrams} grams</strong> tailpipe PM2.5 eliminated daily
          </div>
        </div>

        <button
          onClick={handleApplyToMainSimulator}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all whitespace-nowrap shadow-lg shadow-emerald-950/40"
        >
          <span>Sync into Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default CommunitySimulationCard;
