import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { indoorService } from '../../services/indoorService';
import { PurifierGuidanceData } from '../../types';
import {
  Wind,
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Calculator,
} from 'lucide-react';

interface PurifierCalculatorProps {
  initialLength?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialUnit?: 'meters' | 'feet';
}

export const PurifierCalculator: React.FC<PurifierCalculatorProps> = ({
  initialLength = 4,
  initialWidth = 3.5,
  initialHeight = 2.8,
  initialUnit = 'meters',
}) => {
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [unit, setUnit] = useState<'meters' | 'feet'>(initialUnit);
  const [budget, setBudget] = useState<'low_cost' | 'mid_range' | 'premium'>('mid_range');
  const [primaryConcern, setPrimaryConcern] = useState('smog_pm25');
  const [guidance, setGuidance] = useState<PurifierGuidanceData | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await indoorService.getPurifierAdvice({
        length: Number(length),
        width: Number(width),
        height: Number(height),
        unit,
        budget,
        primaryConcern,
      });
      if (res.success && res.advice) {
        setGuidance(res.advice);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [length, width, height, unit, budget, primaryConcern]);

  return (
    <div className="space-y-6">
      {/* Input Controls Card */}
      <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Room Sizing & Clean Air Delivery Rate (CADR) Calculator
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Calculate exact volume and minimum airflow required to clean your room 5 times per hour (5 ACH).
            </p>
          </div>
          {/* Unit Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 self-start sm:self-auto">
            <button
              onClick={() => setUnit('meters')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                unit === 'meters'
                  ? 'bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Meters (m)
            </button>
            <button
              onClick={() => setUnit('feet')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                unit === 'feet'
                  ? 'bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Feet (ft)
            </button>
          </div>
        </div>

        {/* Dimension Sliders / Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Room Length</span>
              <span className="font-mono font-bold text-emerald-500">
                {length} {unit}
              </span>
            </div>
            <input
              type="range"
              min={unit === 'meters' ? 2 : 6}
              max={unit === 'meters' ? 12 : 40}
              step={unit === 'meters' ? 0.5 : 1}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Room Width</span>
              <span className="font-mono font-bold text-emerald-500">
                {width} {unit}
              </span>
            </div>
            <input
              type="range"
              min={unit === 'meters' ? 2 : 6}
              max={unit === 'meters' ? 10 : 35}
              step={unit === 'meters' ? 0.5 : 1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Ceiling Height</span>
              <span className="font-mono font-bold text-emerald-500">
                {height} {unit}
              </span>
            </div>
            <input
              type="range"
              min={unit === 'meters' ? 2.4 : 8}
              max={unit === 'meters' ? 4.5 : 15}
              step={unit === 'meters' ? 0.1 : 0.5}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Budget & Concern Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Primary Pollution Concern
            </label>
            <select
              value={primaryConcern}
              onChange={(e) => setPrimaryConcern(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="smog_pm25">Severe Winter Smog (PM2.5 / PM10 Infiltration)</option>
              <option value="cooking_smoke">Cooking Smoke & Kitchen Spice Tadka</option>
              <option value="pet_allergies">Pet Dander & Allergic Asthma</option>
              <option value="dampness_dust">Resuspended Dust & Mild Dampness</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Budget Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low_cost', label: 'Budget' },
                { id: 'mid_range', label: 'Standard' },
                { id: 'premium', label: 'High-End' },
              ].map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBudget(b.id as any)}
                  className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                    budget === b.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Sizing Results Card */}
      {guidance && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sizing Metrics */}
          <Card className="p-5 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Minimum Required Airflow
              </span>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {guidance.recommendedCADR.smokeCfm}
                  </span>
                  <span className="text-sm font-semibold text-zinc-500">CFM (Smoke CADR)</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  or <strong>{guidance.recommendedCADR.smokeM3h} m³/h</strong> Clean Air Delivery Rate.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-500/20 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Room Volume:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {guidance.roomVolume.cubicMeters} m³ ({guidance.roomVolume.cubicFeet} ft³)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Floor Area:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {guidance.floorArea.sqMeters} m² ({guidance.floorArea.sqFeet} sq ft)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target Air Exchange:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {guidance.airChangesPerHour} ACH (Full Room Clean Every 12 min)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-zinc-500">
              * Based on ANSI/AHAM AC-1 standard room sizing equations.
            </div>
          </Card>

          {/* Filter Specs & Recommendations */}
          <Card className="p-5 flex flex-col justify-between border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Mandatory Filtration Layers
              </span>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Layer 1: Mesh Pre-Filter
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Captures coarse hair, pet fur, and lint to extend primary HEPA lifespan. Wash every 2–3 weeks.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Layer 2: True HEPA (Grade H13)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Traps 99.97% of fine particulates down to 0.3 microns. Replace every 6–12 months.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Layer 3: Activated Granular Carbon
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Adsorbs pungent cooking spices, VOC vapors, and nitrogen dioxide gas.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Power: {guidance.energyAndCostGuidance.typicalPowerWatts}
              </span>
              <span>{guidance.energyAndCostGuidance.dailyEnergyKWh}</span>
            </div>
          </Card>

          {/* Safety Warning & Technology Rejections */}
          <Card className="p-5 flex flex-col justify-between border-red-500/20 bg-red-500/5 dark:bg-red-950/10">
            <div>
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4" />
                Critical Safety Warnings
              </div>
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="p-2.5 rounded-lg border border-red-500/20 bg-white/60 dark:bg-black/60">
                  <p className="font-bold text-red-700 dark:text-red-300">
                    ❌ REJECT Ozone Generators & Ionizers
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    {guidance.filterTechRequired.forbiddenTechWarning}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-red-500/20 bg-white/60 dark:bg-black/60">
                  <p className="font-bold text-red-700 dark:text-red-300">
                    ⚠️ HEPA Does NOT Remove Carbon Monoxide (CO)
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    Ordinary mechanical filters cannot trap gaseous carbon monoxide from gas geysers or heaters. A dedicated CO detector is mandatory for fuel-burning homes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-500/20 text-[10px] text-zinc-500">
              Guidance based on WHO Guidelines for Indoor Air Quality & US EPA.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
