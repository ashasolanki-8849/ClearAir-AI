import React from 'react';
import { DepartureTimeAdviceData } from '../../types';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DepartureTimeAdvisorCardProps {
  advice?: DepartureTimeAdviceData;
  outdoorAqi: number;
}

export const DepartureTimeAdvisorCard: React.FC<DepartureTimeAdvisorCardProps> = ({
  advice,
  outdoorAqi,
}) => {
  // Default windows if advice is not yet fetched
  const windows = advice?.windows || [
    {
      id: 'morning_peak',
      name: 'Morning Rush & Smog Peak',
      timeRange: '07:30 - 10:30',
      ambientAqiExpected: Math.round(outdoorAqi * 1.25),
      trafficMultiplier: 1.5,
      atmosphericCondition: 'Shallow nocturnal thermal inversion trapping vehicle cold starts',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'critical_smog_peak' as const,
      explanation: 'Ground-level cold air traps diesel particulates; vehicle congestion maximizes idling emissions.',
    },
    {
      id: 'midday_solar_mixing',
      name: 'Midday Solar Dispersion Window',
      timeRange: '12:00 - 15:30',
      ambientAqiExpected: Math.round(outdoorAqi * 0.75),
      trafficMultiplier: 0.9,
      atmosphericCondition: 'Solar convective heating expands planetary boundary layer',
      inversionRisk: false,
      solarMixingDispersion: true,
      recommendationLevel: 'optimal' as const,
      explanation: 'Optimal travel window: Sun heats the ground, lifting the smog inversion blanket and diluting particulate concentration.',
    },
    {
      id: 'evening_rush',
      name: 'Evening Commute Window',
      timeRange: '17:30 - 21:00',
      ambientAqiExpected: Math.round(outdoorAqi * 1.15),
      trafficMultiplier: 1.6,
      atmosphericCondition: 'Ground cooling initiates thermal inversion; evening traffic surge',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'avoid_if_possible' as const,
      explanation: 'Traffic congestion peaks while evening cooling re-traps tailpipe pollution near breathing height.',
    },
    {
      id: 'night_inversion',
      name: 'Night / Early Hours',
      timeRange: '22:00 - 06:00',
      ambientAqiExpected: Math.round(outdoorAqi * 1.1),
      trafficMultiplier: 0.6,
      atmosphericCondition: 'Strong nocturnal radiation inversion + heavy interstate truck transit',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'acceptable' as const,
      explanation: 'Light passenger traffic, but heavy diesel freight trucks transit city bypasses under cold stagnant air.',
    },
  ];

  const getWindowIcon = (id: string) => {
    switch (id) {
      case 'morning_peak':
        return Sunrise;
      case 'midday_solar_mixing':
        return Sun;
      case 'evening_rush':
        return Sunset;
      default:
        return Moon;
    }
  };

  const getStatusBadge = (level: string) => {
    switch (level) {
      case 'optimal':
        return <Badge variant="good">Recommended Window</Badge>;
      case 'acceptable':
        return <Badge variant="satisfactory">Acceptable</Badge>;
      case 'avoid_if_possible':
        return <Badge variant="moderate">High Smog</Badge>;
      case 'critical_smog_peak':
        return <Badge variant="severe">Critical Inversion</Badge>;
      default:
        return <Badge variant="default">{level}</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Diurnal Smog Dynamics & Departure Time Advisor
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Timing your departure to coincide with atmospheric solar mixing can reduce inhaled pollution by 30%–45%
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimal: 12:00 PM – 3:30 PM</span>
        </div>
      </div>

      {/* 4 Windows Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {windows.map((win) => {
          const Icon = getWindowIcon(win.id);
          const isOptimal = win.recommendationLevel === 'optimal';
          const isCritical = win.recommendationLevel === 'critical_smog_peak';

          return (
            <div
              key={win.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isOptimal
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/70 ring-1 ring-emerald-500/50 shadow-sm'
                  : isCritical
                  ? 'bg-red-50/40 dark:bg-red-950/15 border-red-200 dark:border-red-900/40'
                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      isOptimal
                        ? 'bg-emerald-500 text-white'
                        : isCritical
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {getStatusBadge(win.recommendationLevel)}
                </div>

                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{win.name}</h4>
                <div className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {win.timeRange}
                </div>

                {/* AQI Expectation */}
                <div className="my-2.5 p-2 bg-white/80 dark:bg-black/40 rounded-lg border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Expected AQI:</span>
                  <span
                    className={`font-bold ${
                      isOptimal
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    ~{win.ambientAqiExpected}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {win.explanation}
                </p>
              </div>

              {/* Tag */}
              <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                {isOptimal ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span>Convective boundary mixing active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>Thermal inversion layer trapped</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Atmospheric Science Explainer */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
        <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
            Why does AQI drop in midday winter sun?
          </span>
          <p className="text-[11px] leading-relaxed">
            During winter nights and early mornings, a cold layer of air forms near the ground under warmer air above (thermal inversion), trapping vehicle emissions at breathing level. As solar radiation peaks between 12:00 PM and 3:30 PM, convective vertical currents break this blanket, lifting the planetary boundary layer from 150m to over 800m and diluting particulate density.
          </p>
        </div>
      </div>
    </div>
  );
};
