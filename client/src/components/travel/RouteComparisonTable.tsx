import React from 'react';
import { RouteAlternativeData, TravelPriority } from '../../types';
import {
  ShieldAlert,
  Clock,
  Leaf,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  TrendingDown,
  Wind,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface RouteComparisonTableProps {
  routes: RouteAlternativeData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  onSaveRoute?: (route: RouteAlternativeData) => void;
  priority: TravelPriority;
}

export const RouteComparisonTable: React.FC<RouteComparisonTableProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onSaveRoute,
  priority,
}) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  const getExposureBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return <Badge variant="good">Low Exposure</Badge>;
      case 'Moderate':
        return <Badge variant="moderate">Moderate Smog</Badge>;
      case 'High':
        return <Badge variant="poor">High Exposure</Badge>;
      case 'Severe':
        return <Badge variant="severe">Severe Smog Trap</Badge>;
      default:
        return <Badge variant="default">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Route Comparison & Decision Matrix
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Compare 3 distinct route alternatives tailored for smog reduction & travel efficiency
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
          Prioritizing: <span className="capitalize font-semibold">{priority.replace('_', ' ')}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const isSelected = route.routeId === selectedRouteId;
          const isBypass = route.routeType === 'clean_bypass';
          const isMetro = route.routeType === 'metro_transit';

          let borderTheme = 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400';
          let headerBg = 'bg-amber-500/10 text-amber-800 dark:text-amber-300';
          let dotColor = 'bg-amber-500';

          if (isBypass) {
            borderTheme = 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400';
            headerBg = 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
            dotColor = 'bg-emerald-500';
          } else if (isMetro) {
            borderTheme = 'border-sky-200 dark:border-sky-900/50 hover:border-sky-400';
            headerBg = 'bg-sky-500/10 text-sky-800 dark:text-sky-300';
            dotColor = 'bg-sky-500';
          }

          return (
            <div
              key={route.routeId}
              onClick={() => onSelectRoute(route.routeId)}
              className={`relative rounded-2xl border bg-white dark:bg-zinc-950 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? `${borderTheme} ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-md transform -translate-y-0.5`
                  : `border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700`
              }`}
            >
              {/* Recommended Ribbon */}
              {route.isRecommended && (
                <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Recommended</span>
                </div>
              )}

              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${headerBg}`}>
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span>
                      {route.routeType === 'clean_bypass'
                        ? 'Clean Air Bypass'
                        : route.routeType === 'metro_transit'
                        ? 'Metro Transit Corridor'
                        : 'Fastest Arterial'}
                    </span>
                  </div>
                  {getExposureBadge(route.exposure.riskLevel)}
                </div>

                {/* Route Title */}
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {route.routeName}
                </h4>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block">Duration & Distance</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {route.durationMinutes} min
                    </span>
                    <span className="text-zinc-500 text-[11px] ml-1">({route.distanceKm} km)</span>
                  </div>

                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block">Street Exposure AQI</span>
                    <span className={`font-bold text-sm ${
                      route.streetAqiEstimated < 180 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      ~{route.streetAqiEstimated} AQI
                    </span>
                    <span className="text-zinc-500 text-[10px] block">
                      {route.trafficLevel} traffic
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block">Carbon Emissions</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {route.emissions.gramsCo2PerPassenger} g CO₂
                    </span>
                    {route.emissions.avoidedGramsCo2 > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] block flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5 inline" />
                        -{route.emissions.avoidedGramsCo2}g vs car
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block">Estimated Cost</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{route.estimatedCostInr}
                    </span>
                    <span className="text-zinc-500 text-[10px] block capitalize">
                      {route.mode.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    <span>Overall Suitability</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{route.overallScore}/100</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        route.overallScore >= 75
                          ? 'bg-emerald-500'
                          : route.overallScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${route.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation Reason */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 mb-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Why this route: </span>
                  {route.recommendationReason}
                </div>

                {/* Pros and Cons */}
                <div className="space-y-1.5 text-xs mb-4">
                  {route.advantages.map((adv, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{adv}</span>
                    </div>
                  ))}
                  {route.disadvantages.map((dis, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{dis}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoute(route.routeId);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{isSelected ? 'Active on Map' : 'Select Route'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {onSaveRoute && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveRoute(route);
                    }}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                    title="Bookmark this route"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
