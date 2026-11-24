import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Play, 
  Car, 
  Zap, 
  Home, 
  Trees, 
  Construction, 
  Factory, 
  Flame, 
  Clock, 
  Users, 
  Sparkles,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import { 
  SimulationParametersData, 
  ScenarioPresetData 
} from '../../types';

interface SimulationControlsCardProps {
  parameters: SimulationParametersData;
  presets: ScenarioPresetData[];
  onParametersChange: (newParams: SimulationParametersData) => void;
  onApplyPreset: (preset: ScenarioPresetData) => void;
  onReset: () => void;
  onSaveScenario: () => void;
  isCalculating?: boolean;
}

export const SimulationControlsCard: React.FC<SimulationControlsCardProps> = ({
  parameters,
  presets,
  onParametersChange,
  onApplyPreset,
  onReset,
  onSaveScenario,
  isCalculating = false,
}) => {
  const updateParam = (key: keyof SimulationParametersData, value: number) => {
    onParametersChange({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Preset Quick Loaders */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">What-if Simulation Controls</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Adjust hypothetical levers to simulate atmospheric response and personal exposure reduction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveScenario}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            title="Save this simulation scenario"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            Save Scenario
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold transition-all"
            title="Reset parameters to zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Preset Scenario Quick-Pills */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Pre-Configured Scenario Presets:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-white transition-all whitespace-nowrap"
            >
              <span className="font-semibold">{preset.name}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 font-mono">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Lever 1: Vehicle Reduction */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Car className="w-4 h-4 text-sky-400" />
              <span>Private Vehicle Usage Cut</span>
            </div>
            <span className="font-mono font-bold text-sky-400 text-sm">
              {parameters.vehicleReductionPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={parameters.vehicleReductionPct}
            onChange={(e) => updateParam('vehicleReductionPct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% (Normal Traffic)</span>
            <span>40% (Odd-Even/Wfh)</span>
            <span>80% (Lockdown Scale)</span>
          </div>
        </div>

        {/* Lever 2: Public Transit & Metro Surge */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Public Transit & Metro Adoption</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {parameters.publicTransitAdoptionPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={parameters.publicTransitAdoptionPct}
            onChange={(e) => updateParam('publicTransitAdoptionPct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% Baseline</span>
            <span>35% Feeder Bus Surge</span>
            <span>80% Max Grid Capacity</span>
          </div>
        </div>

        {/* Lever 3: Electric Vehicles (EV) Shift */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Electric Vehicle (EV) Transition</span>
            </div>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {parameters.evAdoptionPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={parameters.evAdoptionPct}
            onChange={(e) => updateParam('evAdoptionPct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% Current Fleet</span>
            <span>25% Target 2026</span>
            <span>60% Electrified</span>
          </div>
        </div>

        {/* Lever 4: Waste Burning Ban Enforcement */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Waste & Biomass Burning Elimination</span>
            </div>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {parameters.wasteBurningBanCompliancePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={parameters.wasteBurningBanCompliancePct}
            onChange={(e) => updateParam('wasteBurningBanCompliancePct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% Open Fires</span>
            <span>50% Society Watch</span>
            <span>100% Zero-Burn Strict</span>
          </div>
        </div>

        {/* Lever 5: Construction & Road Dust Mitigation */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Construction className="w-4 h-4 text-amber-400" />
              <span>Construction & Road Dust Suppression</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {parameters.constructionDustMitigationPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={parameters.constructionDustMitigationPct}
            onChange={(e) => updateParam('constructionDustMitigationPct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% Uncovered</span>
            <span>40% Water Misting</span>
            <span>80% Full Enclosure</span>
          </div>
        </div>

        {/* Lever 6: Peak Hour Outdoor Activity Avoidance */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Avoid Peak Smog Inversion (06:00-09:30)</span>
            </div>
            <span className="font-mono font-bold text-purple-400 text-sm">
              {parameters.peakHourOutdoorAvoidancePct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={parameters.peakHourOutdoorAvoidancePct}
            onChange={(e) => updateParam('peakHourOutdoorAvoidancePct', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0% Morning Jogging</span>
            <span>50% Shift Midday</span>
            <span>100% Full Inversion Shield</span>
          </div>
        </div>

        {/* Lever 7: Indoor HEPA Purifier Adoption */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Home className="w-4 h-4 text-teal-400" />
              <span>Households with True HEPA Purifiers</span>
            </div>
            <span className="font-mono font-bold text-teal-400 text-sm">
              {parameters.householdsIndoorPurifiedCount} Homes
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={parameters.householdsIndoorPurifiedCount}
            onChange={(e) => updateParam('householdsIndoorPurifiedCount', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0</span>
            <span>500 (Society Scale)</span>
            <span>2,000 Homes</span>
          </div>
        </div>

        {/* Lever 8: Urban Trees Planted */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>Urban Trees Planted (Canopy Buffer)</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {parameters.treesPlantedCount} Trees
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="15000"
            step="500"
            value={parameters.treesPlantedCount}
            onChange={(e) => updateParam('treesPlantedCount', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0</span>
            <span>5,000 Urban Forest</span>
            <span>15,000 Trees</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SimulationControlsCard;
