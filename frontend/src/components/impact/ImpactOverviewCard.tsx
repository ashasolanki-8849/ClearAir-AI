import React from 'react';
import { DashboardImpactData } from '../../types';
import {
  BarChart3,
  Car,
  Zap,
  Flame,
  Trash2,
  Droplets,
  Calendar,
  AlertCircle,
  TrendingDown,
  Info,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ImpactOverviewCardProps {
  data: DashboardImpactData;
  filter: string;
  onFilterChange: (filter: string) => void;
  onOpenCalculator: () => void;
  onOpenInsights: () => void;
}

export const ImpactOverviewCard: React.FC<ImpactOverviewCardProps> = ({
  data,
  filter,
  onFilterChange,
  onOpenCalculator,
  onOpenInsights,
}) => {
  const formatEmissions = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(2)} t CO₂e`;
    return `${val.toFixed(1)} kg CO₂e`;
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Header Row with Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Estimated Carbon Footprint & Environmental Indicators
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {data.periodLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Grounded calculations using Central Electricity Authority (CEA) and IPCC 2006 conversion standards
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-x-auto text-xs font-semibold self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: '7D' },
            { id: 'this_month', label: 'Month' },
            { id: 'last_3_months', label: '3M' },
            { id: 'this_year', label: 'Year' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === btn.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Banner */}
      {!data.hasSufficientData ? (
        <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto opacity-60" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Insufficient Activity Records for This Period
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            ClearAir AI strictly avoids fabricating placeholder environmental data. Log your commute distance, electricity kWh, or domestic waste segregation to see your calculated indicators.
          </p>
          <button
            onClick={onOpenCalculator}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm"
          >
            + Calculate Carbon Footprint
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total & Core Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Hero Card */}
            <div className="sm:col-span-2 lg:col-span-2 p-5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-800 shadow-md flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Total Evaluated Carbon Footprint
                </span>
                <div className="text-3xl font-black tracking-tight mt-1">
                  {formatEmissions(data.totalCarbonFootprintKgCO2e)}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Greenhouse gases evaluated across all recorded domains
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                <span>{data.activitiesCompletedCount} logged green actions</span>
                <span>•</span>
                <span>{data.activeGoalsCount} active goals</span>
              </div>
            </div>

            {/* Transportation */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Transport</span>
                <Car className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatEmissions(data.breakdown.transportationKgCO2e)}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {data.sharesPercentage.transportation}% of total
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                {data.resourceMetrics.totalDistanceKm} km logged
              </div>
            </div>

            {/* Electricity */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Electricity</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatEmissions(data.breakdown.electricityKgCO2e)}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {data.sharesPercentage.electricity}% of total
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                {data.resourceMetrics.electricityKwh} kWh logged
              </div>
            </div>

            {/* Household Fuel */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Fuel / Gas</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatEmissions(data.breakdown.householdFuelKgCO2e)}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {data.sharesPercentage.householdFuel}% of total
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                LPG / PNG cooking
              </div>
            </div>

            {/* Waste & Water */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Waste & Water</span>
                <Trash2 className="w-4 h-4 text-teal-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatEmissions(data.breakdown.wasteKgCO2e + data.breakdown.waterKgCO2e)}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {data.resourceMetrics.wasteDivertedKg} kg diverted
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                {data.resourceMetrics.waterLiters} L water logged
              </div>
            </div>
          </div>

          {/* Trend Chart (if multi-point) */}
          {data.trendSeries.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Timeline Trend (kg CO₂e)
                </h4>
                <span className="text-[11px] text-zinc-400">Daily logged emissions trajectory</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trendSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#71717a" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f4f4f5',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalKgCO2e"
                      name="Total CO₂e (kg)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#impactGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Criteria Local Air Pollutants Separator Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Criteria Local Air Pollutant Mass (Tailpipe / Power Emissions)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Strictly Disaggregated from CO₂e
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Expressed in pure mass grams (g)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400">PM2.5</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{data.criteriaPollutantsGrams.pm25} g</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400">PM10</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{data.criteriaPollutantsGrams.pm10} g</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400">NOx</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{data.criteriaPollutantsGrams.nox} g</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400">CO</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{data.criteriaPollutantsGrams.co} g</div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] text-zinc-400">SO2 (Upstream)</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{data.criteriaPollutantsGrams.so2} g</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Transparency Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>CEA Baseline v19 & IPCC Guidelines. All metrics derived from verified logged activities.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenInsights}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            View Smart Insights →
          </button>
          <button
            onClick={onOpenCalculator}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs transition-all shadow-xs"
          >
            + Calculate Activity
          </button>
        </div>
      </div>
    </div>
  );
};
