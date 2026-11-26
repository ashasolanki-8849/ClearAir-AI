import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAQI } from '../context/AQIContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Home,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  Flame,
  DoorClosed,
  Fan,
  Lightbulb,
} from 'lucide-react';

export const IndoorPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  // Simple Situation Question States
  const [windowsOpen, setWindowsOpen] = useState<boolean>(false);
  const [hasPurifier, setHasPurifier] = useState<boolean>(false);
  const [hasSmokeOrDust, setHasSmokeOrDust] = useState<boolean>(false);
  const [isCooking, setIsCooking] = useState<boolean>(false);

  // Dynamic indoor air estimation (Clearly labeled as estimated guide)
  const isOutdoorHigh = metrics.pollutionPercent > 50;
  
  let indoorScore = 80;
  if (isOutdoorHigh && windowsOpen) indoorScore -= 40;
  if (isOutdoorHigh && !windowsOpen) indoorScore -= 10;
  if (hasSmokeOrDust) indoorScore -= 25;
  if (isCooking) indoorScore -= 15;
  if (hasPurifier && !windowsOpen) indoorScore += 25;
  indoorScore = Math.max(10, Math.min(95, indoorScore));

  const indoorQuality =
    indoorScore >= 75
      ? { label: 'Good Indoor Air', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
      : indoorScore >= 50
      ? { label: 'Moderate Indoor Air', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
      : { label: 'Poor Indoor Air', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Home className="w-7 h-7 text-sky-500" />
            <span>Indoor Air Quality Guide</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Simple steps to keep the air inside your living room, bedroom, and kitchen clean and safe.
          </p>
        </div>

        {/* Estimated Status Notice */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${indoorQuality.bg} ${indoorQuality.color}`}>
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400 block text-[11px]">
                Estimated Indoor Condition
              </span>
              <span className={`text-sm font-bold ${indoorQuality.color}`}>
                {indoorQuality.label}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Estimated guide based on outdoor smog ({metrics.pollutionPercent}%) & household situation.</span>
          </div>
        </div>

        {/* 5 Simple Situation Questions */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Tell us about your home right now:
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select your current situation to see simple, immediate recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Question 1: Windows */}
            <div
              onClick={() => setWindowsOpen(!windowsOpen)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                windowsOpen
                  ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <DoorClosed className={`w-4 h-4 ${windowsOpen ? 'text-amber-500' : 'text-zinc-400'}`} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Are your windows open?</p>
                  <p className="text-[11px] text-zinc-500">{windowsOpen ? 'Yes, windows are open' : 'No, windows are closed'}</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                windowsOpen ? 'bg-amber-500 border-amber-500 text-white' : 'border-zinc-300 dark:border-zinc-700 text-transparent'
              }`}>✓</span>
            </div>

            {/* Question 2: Air Purifier */}
            <div
              onClick={() => setHasPurifier(!hasPurifier)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                hasPurifier
                  ? 'border-sky-500 bg-sky-50/20 dark:bg-sky-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Fan className={`w-4 h-4 ${hasPurifier ? 'text-sky-500' : 'text-zinc-400'}`} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Do you have an air purifier?</p>
                  <p className="text-[11px] text-zinc-500">{hasPurifier ? 'Yes, running inside' : 'No air purifier'}</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                hasPurifier ? 'bg-sky-500 border-sky-500 text-white' : 'border-zinc-300 dark:border-zinc-700 text-transparent'
              }`}>✓</span>
            </div>

            {/* Question 3: Smoke or Dust */}
            <div
              onClick={() => setHasSmokeOrDust(!hasSmokeOrDust)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                hasSmokeOrDust
                  ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className={`w-4 h-4 ${hasSmokeOrDust ? 'text-red-500' : 'text-zinc-400'}`} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Is there smoke, incense, or dust?</p>
                  <p className="text-[11px] text-zinc-500">{hasSmokeOrDust ? 'Yes, noticeable smoke/dust' : 'No smoke or dust'}</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                hasSmokeOrDust ? 'bg-red-500 border-red-500 text-white' : 'border-zinc-300 dark:border-zinc-700 text-transparent'
              }`}>✓</span>
            </div>

            {/* Question 4: Cooking */}
            <div
              onClick={() => setIsCooking(!isCooking)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isCooking
                  ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className={`w-4 h-4 ${isCooking ? 'text-amber-500' : 'text-zinc-400'}`} />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">Are you cooking or frying food?</p>
                  <p className="text-[11px] text-zinc-500">{isCooking ? 'Yes, cooking active' : 'No cooking right now'}</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                isCooking ? 'bg-amber-500 border-amber-500 text-white' : 'border-zinc-300 dark:border-zinc-700 text-transparent'
              }`}>✓</span>
            </div>
          </div>
        </div>

        {/* Simple Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Action Steps for Your Home
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Rule 1 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Window Management</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">
                {isOutdoorHigh || windowsOpen
                  ? 'Keep windows and balcony doors firmly closed while outdoor pollution is high to avoid smog entering.'
                  : 'Open windows for 20 minutes between 12:00 PM and 3:00 PM when sunlight naturally disperses ground pollution.'}
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Avoid Indoor Smoke</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">
                {hasSmokeOrDust
                  ? 'Avoid burning incense sticks, mosquito coils, or candles indoors. They create heavy fine smoke inside closed rooms.'
                  : 'Keep indoor air clean by avoiding smoking, incense coils, or open flames inside the house.'}
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cleaning & Dusting</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">
                Use a wet mop instead of dry sweeping. Wet mopping traps fine dust on the floor without throwing it into the air.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kitchen & Ventilation</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">
                {isCooking
                  ? 'Turn on your kitchen exhaust fan or chimney while cooking to extract frying smoke directly outside.'
                  : 'Ensure the kitchen door is closed during frying to keep cooking fumes from spreading into bedrooms.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};