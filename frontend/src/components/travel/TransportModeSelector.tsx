import React from 'react';
import {
  Footprints,
  Bike,
  Train,
  Bus,
  Users,
  Zap,
  Car,
  AlertTriangle,
  ShieldCheck,
  Leaf,
  Clock,
  DollarSign,
  Gauge,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface TransportModeSelectorProps {
  distanceKm: number;
  outdoorAqi: number;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
}

interface ModeSpec {
  id: string;
  name: string;
  icon: any;
  speedKmh: number;
  emissionPerKm: number;
  exposureMultiplier: number;
  costPerKm: number;
  cabinAirFiltration: boolean;
  smogWarningThreshold: number;
  pros: string;
  cons: string;
}

const MODES: ModeSpec[] = [
  {
    id: 'metro',
    name: 'Metro Rail',
    icon: Train,
    speedKmh: 36,
    emissionPerKm: 25,
    exposureMultiplier: 0.35,
    costPerKm: 2.5,
    cabinAirFiltration: true,
    smogWarningThreshold: 450,
    pros: 'Grade-separated electric rail, conditioned HVAC filtration, zero traffic smog delay',
    cons: 'Requires first/last mile connectivity to stations',
  },
  {
    id: 'electric_bus',
    name: 'Electric Bus',
    icon: Bus,
    speedKmh: 20,
    emissionPerKm: 20,
    exposureMultiplier: 0.55,
    costPerKm: 1.8,
    cabinAirFiltration: true,
    smogWarningThreshold: 350,
    pros: 'Zero tailpipe emissions, high passenger capacity, economical public transit',
    cons: 'Subject to road traffic congestion and opening doors intake',
  },
  {
    id: 'carpool',
    name: 'Carpooling (3+)',
    icon: Users,
    speedKmh: 28,
    emissionPerKm: 42,
    exposureMultiplier: 0.45,
    costPerKm: 3.5,
    cabinAirFiltration: true,
    smogWarningThreshold: 400,
    pros: 'Divides trip carbon by 3+, cabin air recirculation blocks 80% roadside smog',
    cons: 'Requires ride coordination and route alignment',
  },
  {
    id: 'electric_vehicle',
    name: 'Electric Car (EV)',
    icon: Zap,
    speedKmh: 28,
    emissionPerKm: 35,
    exposureMultiplier: 0.45,
    costPerKm: 3.0,
    cabinAirFiltration: true,
    smogWarningThreshold: 400,
    pros: 'Zero urban tailpipe smog emissions, enclosed climate-controlled cabin',
    cons: 'Higher initial vehicle cost, battery grid charging footprint',
  },
  {
    id: 'bus',
    name: 'Standard City Bus',
    icon: Bus,
    speedKmh: 18,
    emissionPerKm: 42,
    exposureMultiplier: 0.65,
    costPerKm: 1.5,
    cabinAirFiltration: false,
    smogWarningThreshold: 250,
    pros: 'Most affordable and universally available public transport',
    cons: 'Open windows on non-AC buses draw in roadside diesel exhaust',
  },
  {
    id: 'private_car',
    name: 'Solo Petrol/Diesel Car',
    icon: Car,
    speedKmh: 28,
    emissionPerKm: 145,
    exposureMultiplier: 0.45,
    costPerKm: 9.0,
    cabinAirFiltration: true,
    smogWarningThreshold: 400,
    pros: 'Direct point-to-point journey with AC recirculation option',
    cons: 'Highest personal carbon footprint and contributes to urban smog gridlock',
  },
  {
    id: 'two_wheeler',
    name: 'Two-Wheeler / Scooter',
    icon: Zap,
    speedKmh: 30,
    emissionPerKm: 38,
    exposureMultiplier: 1.35,
    costPerKm: 2.2,
    cabinAirFiltration: false,
    smogWarningThreshold: 200,
    pros: 'Nimble navigation through heavy traffic',
    cons: 'Direct breathing of vehicle exhaust pipes; N95 mask strictly required',
  },
  {
    id: 'cycling',
    name: 'Cycling (Bicycle)',
    icon: Bike,
    speedKmh: 14,
    emissionPerKm: 0,
    exposureMultiplier: 1.5,
    costPerKm: 0,
    cabinAirFiltration: false,
    smogWarningThreshold: 180,
    pros: 'Zero carbon, zero cost, active exercise on clean air days',
    cons: 'Elevated inhalation volume (2.5x resting breathing) drives deep lung PM2.5 deposition',
  },
  {
    id: 'walking',
    name: 'Walking (Pedestrian)',
    icon: Footprints,
    speedKmh: 4.5,
    emissionPerKm: 0,
    exposureMultiplier: 1.25,
    costPerKm: 0,
    cabinAirFiltration: false,
    smogWarningThreshold: 200,
    pros: 'Zero carbon, ideal for short 0.5 - 1.5 km first/last mile hops',
    cons: 'High roadside particulate exposure along major arterial avenues',
  },
];

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  distanceKm,
  outdoorAqi,
  selectedMode,
  onSelectMode,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-500" />
            Modes Comparison Matrix ({distanceKm} km Trip)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Compare travel time, cost, tailpipe carbon emissions, and micro-environment exposure
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400 self-start sm:self-auto">
          Current Ambient: <span className="font-bold text-amber-500">{outdoorAqi} AQI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          const tripMinutes = Math.round((distanceKm / m.speedKmh) * 60);
          const tripGramsCo2 = Math.round(m.emissionPerKm * distanceKm);
          const tripCost = Math.round(m.costPerKm * distanceKm);
          const isSmogHazard = outdoorAqi >= m.smogWarningThreshold;

          return (
            <div
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.name}</h4>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        ~{m.speedKmh} km/h avg
                      </span>
                    </div>
                  </div>

                  {isSmogHazard ? (
                    <Badge variant="severe">Smog Hazard</Badge>
                  ) : m.cabinAirFiltration ? (
                    <Badge variant="good">Filtered Cabin</Badge>
                  ) : (
                    <Badge variant="default">Open Air</Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-1.5 py-2 my-2 border-y border-zinc-200/60 dark:border-zinc-800/60 text-center text-[11px]">
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[9px] block">Time</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-zinc-400" />
                      {tripMinutes}m
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[9px] block">CO₂</span>
                    <span
                      className={`font-bold flex items-center justify-center gap-0.5 ${
                        tripGramsCo2 === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <Leaf className="w-2.5 h-2.5 text-emerald-500" />
                      {tripGramsCo2}g
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[9px] block">Fare</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-0.5">
                      <DollarSign className="w-2.5 h-2.5 text-zinc-400" />
                      ₹{tripCost}
                    </span>
                  </div>
                </div>

                {/* Exposure Multiplier Indicator */}
                <div className="text-[11px] mb-2 flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Inhaled Dose Multiplier:</span>
                  <span
                    className={`font-bold ${
                      m.exposureMultiplier <= 0.5
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : m.exposureMultiplier >= 1.2
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {m.exposureMultiplier}x
                  </span>
                </div>

                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                  {m.pros}
                </p>
              </div>

              {/* Hazard note */}
              {isSmogHazard && (
                <div className="mt-2.5 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/40 text-[10px] text-red-700 dark:text-red-400 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Hyperventilation hazard: Unfiltered breathing at AQI {outdoorAqi} causes severe particulate deposition.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
