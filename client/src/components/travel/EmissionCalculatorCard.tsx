import React, { useState } from 'react';
import { Leaf, Calculator, ArrowRight, TreePine, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { travelService } from '../../services/travelService';
import { EmissionCalculationResult } from '../../types';

export const EmissionCalculatorCard: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const [mode, setMode] = useState<string>('metro');
  const [fuelType, setFuelType] = useState<string>('petrol');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [result, setResult] = useState<EmissionCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await travelService.calculateEmissions({
        distanceKm,
        mode,
        fuelType,
        passengerCount,
      });
      if (res.success) {
        setResult(res.calculation);
      }
    } catch (err) {
      console.error('Failed to calculate emissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Interactive Trip Emissions Calculator
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          IPCC & ARAI Factors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Distance Slider */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex justify-between font-semibold text-zinc-700 dark:text-zinc-300">
            <span>Trip Distance</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Mode Selector */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Transport Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="metro">Metro Rail / Train</option>
            <option value="bus">Standard City Bus</option>
            <option value="electric_bus">Electric City Bus</option>
            <option value="carpool">Carpooling</option>
            <option value="car">Private Car</option>
            <option value="electric_vehicle">Electric Vehicle (EV)</option>
            <option value="two_wheeler">Two-Wheeler / Scooter</option>
            <option value="cycling">Cycling (0g)</option>
            <option value="walking">Walking (0g)</option>
          </select>
        </div>

        {/* Fuel Type (Conditional) */}
        {(mode === 'car' || mode === 'carpool' || mode === 'two_wheeler') && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="petrol">Petrol (Gasoline)</option>
              <option value="diesel">Diesel</option>
              <option value="cng">CNG (Clean Gas)</option>
              <option value="electric">Electric / EV</option>
              <option value="hybrid">Strong Hybrid</option>
            </select>
          </div>
        )}

        {/* Passenger Count */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Passengers Sharing</label>
          <select
            value={passengerCount}
            onChange={(e) => setPassengerCount(Number(e.target.value))}
            className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={1}>1 (Solo Traveler)</option>
            <option value={2}>2 Passengers</option>
            <option value={3}>3 Passengers</option>
            <option value={4}>4 Passengers</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleCalculate}
          isLoading={isLoading}
          className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculate Carbon Footprint</span>
        </Button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-fadeIn">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Total Trip Emissions</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {result.totalTripGramsCo2} g CO₂
            </span>
            <span className="text-[10px] text-zinc-500 block">
              {result.modeFactSheet.gramsCo2PerKm} g/km factor
            </span>
          </div>

          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Per-Passenger Footprint</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {result.perPassengerGramsCo2} g CO₂
            </span>
            <span className="text-[10px] text-zinc-500 block">
              divided by {passengerCount} traveler(s)
            </span>
          </div>

          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Avoided vs Solo Petrol Car</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {result.avoidedVsSoloCarGramsCo2} g CO₂
            </span>
            <span className="text-[10px] text-zinc-500 block">
              clean air conservation
            </span>
          </div>

          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Offset Equivalent</span>
            <span className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
              <TreePine className="w-4 h-4 text-emerald-500" />
              {result.equivalentTreesPerYear} trees / yr
            </span>
            <span className="text-[10px] text-zinc-500 block">
              annual absorption value
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
