import React from 'react';
import {
  ShieldAlert,
  Wind,
  Layers,
  Car,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Baby,
  HeartPulse,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PersonalExposureCardProps {
  outdoorAqi: number;
}

export const PersonalExposureCard: React.FC<PersonalExposureCardProps> = ({ outdoorAqi }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Personal Exposure vs. Environmental Emissions
          </h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Understanding why clean modes can carry high personal smog exposure and how to protect your lungs
        </p>
      </div>

      {/* The Core Distinction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exposure Box */}
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" />
              1. Personal Pollution Exposure
            </span>
            <Badge variant="moderate">Inhaled Dose</Badge>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Measures the <strong>actual quantity of toxic particles (PM2.5, NO₂, black carbon)</strong> entering your bronchial tubes during a trip.
          </p>
          <div className="p-2.5 bg-white/80 dark:bg-black/60 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border border-amber-100 dark:border-amber-900/30">
            Inhaled Dose = Duration &times; Concentration &times; Breathing Rate &times; Cabin Attenuation
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            <strong>Key Insight:</strong> Cycling produces 0g carbon, but vigorous cycling along a highway causes 3x heavier breathing, leading to <strong>maximum lung particulate poisoning</strong> during high smog.
          </p>
        </div>

        {/* Emissions Box */}
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              2. Transportation Carbon Emissions
            </span>
            <Badge variant="good">Climate Footprint</Badge>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Measures the <strong>greenhouse gas weight (g CO₂/km)</strong> emitted into the atmosphere by your chosen vehicle.
          </p>
          <div className="p-2.5 bg-white/80 dark:bg-black/60 rounded-lg text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border border-emerald-100 dark:border-emerald-900/30">
            Trip Carbon = Distance (km) &times; Mode Emission Factor &divide; Vehicle Occupancy
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            <strong>Key Insight:</strong> Metro Rail and Carpooling achieve the lowest per-capita emissions while maintaining an enclosed, air-conditioned buffer against smog.
          </p>
        </div>
      </div>

      {/* The Crucial Cabin Air Recirculation Protocol */}
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              The Lifesaving "Cabin Air Recirculation" Switch
            </h4>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Mandatory protocol for cars, cabs, and air-conditioned buses during smog
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">
              1. Turn ON Internal Recirculation
            </span>
            <p className="text-[11px]">
              Press the car button showing an arrow circulating inside a vehicle silhouette. This blocks highway tailpipes from being sucked into your cabin, cutting in-car PM2.5 by <strong>75%–85%</strong>.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">
              2. Keep Windows Firmly Sealed
            </span>
            <p className="text-[11px]">
              Cracking car windows even 1 inch in highway traffic floods the interior with concentrated black carbon and diesel exhaust within 60 seconds.
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">
              3. The 45-Minute CO₂ Flush
            </span>
            <p className="text-[11px]">
              On long trips (&gt;45 min), human exhalation raises cabin CO₂. Pulse fresh air intake for 30 seconds only when driving through an open, less-trafficked corridor.
            </p>
          </div>
        </div>
      </div>

      {/* Vulnerable Commuters Protection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex-shrink-0">
            <Baby className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Children & Strollers</h5>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Children are closer to vehicle exhaust pipe height (0.5m – 1.0m) where particulate concentration is 30% higher than adult breathing level. Avoid open-air strollers on arterial sidewalks.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex-shrink-0">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Elderly & Respiratory Patients</h5>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              When ambient AQI exceeds 200, open auto-rickshaw or motorcycle rides double the risk of bronchospasms. Prioritize grade-separated Metro Rail or enclosed cab transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
