import React, { useState } from 'react';
import {
  Car,
  Zap,
  Flame,
  Trash2,
  Droplets,
  Calculator,
  X,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

interface CarbonFootprintCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculateTransport: (data: any) => Promise<any>;
  onCalculateEnergy: (data: any) => Promise<any>;
  onCalculateWaste: (data: any) => Promise<any>;
  onCalculateWater: (data: any) => Promise<any>;
  onCalculationSaved: () => void;
}

export const CarbonFootprintCalculatorModal: React.FC<CarbonFootprintCalculatorModalProps> = ({
  isOpen,
  onClose,
  onCalculateTransport,
  onCalculateEnergy,
  onCalculateWaste,
  onCalculateWater,
  onCalculationSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'transport' | 'electricity' | 'fuel' | 'waste' | 'water'>('transport');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [transportMode, setTransportMode] = useState('petrol_car');
  const [distanceKm, setDistanceKm] = useState('25');
  const [passengers, setPassengers] = useState('1');

  const [electricityKwh, setElectricityKwh] = useState('150');
  const [renewableShare, setRenewableShare] = useState('0');

  const [fuelType, setFuelType] = useState<'lpg_cylinder' | 'lpg_kg' | 'png_m3'>('lpg_cylinder');
  const [fuelQuantity, setFuelQuantity] = useState('1');

  const [wasteType, setWasteType] = useState<'mixed_unsegregated' | 'organic_composted' | 'recyclable_recovered'>('mixed_unsegregated');
  const [wasteQuantityKg, setWasteQuantityKg] = useState('10');

  const [waterLiters, setWaterLiters] = useState('200');

  if (!isOpen) return null;

  const handleCompute = async (saveToLog: boolean) => {
    try {
      setIsCalculating(true);
      setError(null);
      let res;

      if (activeTab === 'transport') {
        res = await onCalculateTransport({
          transportMode,
          distanceKm: parseFloat(distanceKm),
          passengers: parseInt(passengers, 10) || 1,
          saveToLog,
        });
      } else if (activeTab === 'electricity') {
        res = await onCalculateEnergy({
          kwh: parseFloat(electricityKwh),
          renewableShare: parseFloat(renewableShare) || 0,
          saveToLog,
        });
      } else if (activeTab === 'fuel') {
        res = await onCalculateEnergy({
          fuelType,
          quantity: parseFloat(fuelQuantity),
          saveToLog,
        });
      } else if (activeTab === 'waste') {
        res = await onCalculateWaste({
          wasteType,
          quantityKg: parseFloat(wasteQuantityKg),
          saveToLog,
        });
      } else if (activeTab === 'water') {
        res = await onCalculateWater({
          liters: parseFloat(waterLiters),
          saveToLog,
        });
      }

      setCalculationResult(res.result);
      if (saveToLog) {
        onCalculationSaved();
      }
    } catch (err: any) {
      setError(err.message || 'Calculation error. Check your inputs.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Personal Carbon Footprint Calculator
              </h3>
              <p className="text-xs text-zinc-500">
                Transparent greenhouse gas emission estimates using verified emission factors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('transport'); setCalculationResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'transport'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-rose-500" />
            <span>Transit</span>
          </button>

          <button
            onClick={() => { setActiveTab('electricity'); setCalculationResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'electricity'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Electricity</span>
          </button>

          <button
            onClick={() => { setActiveTab('fuel'); setCalculationResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'fuel'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Cooking Gas</span>
          </button>

          <button
            onClick={() => { setActiveTab('waste'); setCalculationResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'waste'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-teal-500" />
            <span>Waste</span>
          </button>

          <button
            onClick={() => { setActiveTab('water'); setCalculationResult(null); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'water'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Water</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Dynamic Inputs based on Tab */}
        <div className="space-y-4 text-xs">
          {activeTab === 'transport' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Transport Mode</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <option value="petrol_car">Petrol Passenger Car</option>
                  <option value="diesel_car">Diesel Passenger Car</option>
                  <option value="two_wheeler">Two Wheeler (Motorcycle / Scooter)</option>
                  <option value="electric_car">Electric Car (EV)</option>
                  <option value="electric_2w">Electric Two-Wheeler</option>
                  <option value="city_bus">City Bus</option>
                  <option value="metro_rail">Metro Rail (DMRC)</option>
                  <option value="electric_train">Suburban Train</option>
                  <option value="walking_cycling">Walking / Bicycle</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Distance Travelled (km)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Passengers Sharing Car</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'electricity' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Electricity Usage (kWh / Units)</label>
                <input
                  type="number"
                  min="1"
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Certified Clean / Solar Share (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={renewableShare}
                  onChange={(e) => setRenewableShare(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'fuel' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <option value="lpg_cylinder">LPG 14.2 kg Domestic Cylinder</option>
                  <option value="lpg_kg">LPG by Weight (kg)</option>
                  <option value="png_m3">Piped Natural Gas (PNG in m³)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={fuelQuantity}
                  onChange={(e) => setFuelQuantity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Waste Stream</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <option value="mixed_unsegregated">Mixed Municipal Waste (Landfilled)</option>
                  <option value="organic_composted">Organic Waste Composted (Avoided Methane)</option>
                  <option value="recyclable_recovered">Dry Recyclables Recovered (Paper/Plastic/Metal)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={wasteQuantityKg}
                  onChange={(e) => setWasteQuantityKg(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          )}

          {activeTab === 'water' && (
            <div>
              <label className="font-semibold block mb-1">Water Consumption (Liters)</label>
              <input
                type="number"
                min="10"
                step="50"
                value={waterLiters}
                onChange={(e) => setWaterLiters(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => handleCompute(false)}
              disabled={isCalculating}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              Preview Calculation
            </button>
            <button
              type="button"
              onClick={() => handleCompute(true)}
              disabled={isCalculating}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              Save to Carbon Ledger
            </button>
          </div>
        </div>

        {/* Calculation Details Breakdown */}
        {calculationResult && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                Calculation Output
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {calculationResult.calculatedEmissionsKgCO2e} kg CO₂e
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 font-semibold block">Mathematical Formula Applied:</span>
              <code className="p-2 rounded-lg bg-white dark:bg-zinc-950 font-mono text-[11px] block border border-zinc-200 dark:border-zinc-800">
                {calculationResult.formula}
              </code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-zinc-400">Emission Factor:</span>{' '}
                <b>{calculationResult.emissionFactor.factor} {calculationResult.emissionFactor.unit}</b>
              </div>
              <div>
                <span className="text-zinc-400">Authority Citation:</span>{' '}
                <b>{calculationResult.emissionFactor.source}</b>
              </div>
            </div>

            {calculationResult.dataQuality && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
                <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Data Quality Status: <span className="text-emerald-600 dark:text-emerald-400">{calculationResult.dataQuality.status}</span>
                </div>
                <div>Assumptions: {calculationResult.dataQuality.assumptions?.join('; ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
