import React, { useState } from 'react';
import { ImpactCalculationResultData, ImpactSummaryData } from '../../types';
import { sustainabilityService } from '../../services/sustainabilityService';
import { BarChart3, Calculator, Award, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ImpactCalculatorCardProps {
  summary?: ImpactSummaryData;
  onImpactCalculated?: () => void;
}

export const ImpactCalculatorCard: React.FC<ImpactCalculatorCardProps> = ({
  summary,
  onImpactCalculated,
}) => {
  const [activityType, setActivityType] = useState('electricity_saving');
  const [quantity, setQuantity] = useState('10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImpactCalculationResultData | null>(null);

  const activityOptions = [
    { id: 'electricity_saving', label: 'Electricity Conserved (AC/Standby)', unit: 'kWh' },
    { id: 'transit_switch', label: 'Private Car Switch to Mass Transit (Metro)', unit: 'km' },
    { id: 'waste_segregation', label: 'Domestic Waste Segregated & Diverted', unit: 'kg' },
    { id: 'composting', label: 'Kitchen Wet Waste Composted', unit: 'kg' },
    { id: 'water_conservation', label: 'RO Reject / Aerator Water Saved', unit: 'Liters' },
    { id: 'reusable_product', label: 'Single-Use Plastic Bottles/Bags Avoided', unit: 'Items' },
  ];

  const currentOption = activityOptions.find((o) => o.id === activityType) || activityOptions[0];

  const handleCalculate = async () => {
    const q = parseFloat(quantity);
    if (isNaN(q) || q <= 0) return;

    setLoading(true);
    try {
      const res = await sustainabilityService.calculateImpact({
        activityType,
        quantity: q,
        unit: currentOption.unit,
        period: 'daily',
      });
      if (res?.impact) {
        setResult(res.impact);
      }
      if (onImpactCalculated) onImpactCalculated();
    } catch (err) {
      console.error('Impact calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            Understand Your Environmental Impact
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Documented conversion factors from CEA, IPCC, and CPCB — strictly separating CO2e, criteria pollutants, waste, and water
          </p>
        </div>

        <Badge variant="good">Verified Emission Factors</Badge>
      </div>

      {/* Summary Counters (if available) */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total CO2e Avoided</span>
            <div className="text-lg font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {summary.totalCo2EquivalentKg} <span className="text-xs font-sans font-normal text-zinc-400">kg</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">PM2.5 Roadway Avoided</span>
            <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {summary.totalPm25AvoidedGrams} <span className="text-xs font-sans font-normal text-zinc-400">grams</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Waste Diverted</span>
            <div className="text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {summary.totalWasteDivertedKg} <span className="text-xs font-sans font-normal text-zinc-400">kg</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Water Conserved</span>
            <div className="text-lg font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
              {summary.totalWaterSavedLiters} <span className="text-xs font-sans font-normal text-zinc-400">Liters</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Calculator Section */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-3 text-xs">
        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span>Single Activity Calculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Activity Dropdown */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold text-zinc-500">Select Sustainable Action</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full text-xs font-medium bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2"
            >
              {activityOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-500">
              Quantity ({currentOption.unit})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2"
              />
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl font-bold transition-colors shrink-0"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Calculate'}
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Result Breakdown */}
        {result && (
          <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">CO2e Avoided</span>
                <div className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                  {result.calculatedValues.co2EquivalentKg} kg
                </div>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">PM2.5 Avoided</span>
                <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {result.calculatedValues.pm25AvoidedGrams} g
                </div>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Waste Diverted</span>
                <div className="text-sm font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  {result.calculatedValues.wasteDivertedKg} kg
                </div>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Water Saved</span>
                <div className="text-sm font-extrabold font-mono text-teal-600 dark:text-teal-400">
                  {result.calculatedValues.waterSavedLiters} L
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-900">
              <div>
                <strong>Methodology:</strong> {result.calculationMethod}
              </div>
              <div>
                <strong>Emission Factor:</strong> {result.emissionFactor.factor} {result.emissionFactor.unit} ({result.emissionFactor.citation})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
