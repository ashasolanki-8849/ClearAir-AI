import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Car, 
  Zap, 
  Trash2, 
  Droplet, 
  AlertCircle
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { ComparisonAnalyticsData } from '../../types';

interface BeforeAfterComparisonViewProps {
  onRefreshNeeded?: () => void;
}

export const BeforeAfterComparisonView: React.FC<BeforeAfterComparisonViewProps> = () => {
  const [period1, setPeriod1] = useState<string>('this_month');
  const [period2, setPeriod2] = useState<string>('last_month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonAnalyticsData | null>(null);

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'this_year', label: 'This Year' }
  ];

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await impactService.comparePeriods(period1, period2);
      if (res.success && (res.comparison || res.data)) {
        setComparison(res.comparison || res.data || null);
      } else {
        setError(res.error || 'Failed to compare periods');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching comparison data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [period1, period2]);

  const renderDiffBadge = (diff: number, pct: number | null | undefined, inverted: boolean = false) => {
    const validPct = typeof pct === 'number' ? pct : 0;
    const isGood = inverted ? diff > 0 : diff < 0;
    const isZero = Math.abs(diff) < 0.001;

    if (isZero) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
          <Minus className="w-3 h-3" /> No Change (0%)
        </span>
      );
    }

    if (isGood) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ArrowDownRight className="w-3.5 h-3.5" />
          {Math.abs(validPct).toFixed(1)}% ({diff > 0 ? '+' : ''}{diff.toFixed(2)})
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <ArrowUpRight className="w-3.5 h-3.5" />
        +{Math.abs(validPct).toFixed(1)}% ({diff > 0 ? '+' : ''}{diff.toFixed(2)})
      </span>
    );
  };

  // Safe metrics extraction
  const p1 = comparison?.period1?.metrics || (comparison as any)?.period1Metrics || {};
  const p2 = comparison?.period2?.metrics || (comparison as any)?.period2Metrics || {};

  const totalDiff = comparison?.differences?.totalCarbonFootprint?.absoluteDifference ?? (comparison as any)?.differences?.totalEmissionsKg ?? 0;
  const totalPct = comparison?.differences?.totalCarbonFootprint?.percentageDifference ?? (comparison as any)?.percentageChanges?.totalEmissionsPct ?? 0;

  const transDiff = comparison?.differences?.transportation?.absoluteDifference ?? (comparison as any)?.differences?.transportEmissionsKg ?? 0;
  const transPct = comparison?.differences?.transportation?.percentageDifference ?? (comparison as any)?.percentageChanges?.transportEmissionsPct ?? 0;

  const energyDiff = comparison?.differences?.energy?.absoluteDifference ?? (comparison as any)?.differences?.energyEmissionsKg ?? 0;
  const energyPct = comparison?.differences?.energy?.percentageDifference ?? (comparison as any)?.percentageChanges?.energyEmissionsPct ?? 0;

  const wasteDiff = comparison?.differences?.waste?.absoluteDifference ?? (comparison as any)?.differences?.wasteDivertedKg ?? 0;
  const wastePct = comparison?.differences?.waste?.percentageDifference ?? (comparison as any)?.percentageChanges?.wasteDivertedPct ?? 0;

  return (
    <div className="space-y-6">
      {/* Selector Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Period-over-Period Impact Comparison</h3>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Compare your environmental footprints, energy use, and reductions across two verifiable time horizons.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Current Period</label>
              <select
                value={period1}
                onChange={(e) => setPeriod1(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {periodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="text-zinc-500 font-bold self-end pb-2">vs</div>

            <div className="flex-1 md:flex-initial">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Baseline Period</label>
              <select
                value={period2}
                onChange={(e) => setPeriod2(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {periodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-3" />
            <p className="text-sm">Calculating period-over-period environmental deltas...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        ) : !comparison ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Insufficient data recorded in the selected periods to calculate comparisons.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Total Footprint Delta Banner */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              totalDiff <= 0 
                ? 'bg-emerald-950/20 border-emerald-800/40' 
                : 'bg-rose-950/20 border-rose-800/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  totalDiff <= 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {totalDiff <= 0 ? (
                    <TrendingDown className="w-6 h-6" />
                  ) : (
                    <TrendingUp className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Net Carbon Footprint Delta</div>
                  <div className="text-2xl font-black text-white">
                    {Math.abs(totalDiff).toFixed(2)} kg CO₂e{' '}
                    <span className="text-sm font-medium text-zinc-400">
                      ({totalDiff <= 0 ? 'Net Reduction' : 'Net Increase'})
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {renderDiffBadge(totalDiff, totalPct)}
              </div>
            </div>

            {/* Metrics Breakdown Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Metric / Category</th>
                    <th className="py-3 px-4 capitalize">{period1.replace(/_/g, ' ')}</th>
                    <th className="py-3 px-4 capitalize">{period2.replace(/_/g, ' ')}</th>
                    <th className="py-3 px-4">Absolute Change</th>
                    <th className="py-3 px-4 text-right">% Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {/* Total Emissions */}
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-4 px-4 flex items-center gap-2 text-white font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Total Carbon Footprint
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {(p1.totalEmissionsKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {(p2.totalEmissionsKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {totalDiff > 0 ? '+' : ''}
                      {totalDiff.toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 text-right">
                      {renderDiffBadge(totalDiff, totalPct)}
                    </td>
                  </tr>

                  {/* Transport Emissions */}
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-4 px-4 flex items-center gap-2">
                      <Car className="w-4 h-4 text-sky-400" />
                      Transport Emissions
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {(p1.transportationKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {(p2.transportationKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {transDiff > 0 ? '+' : ''}
                      {transDiff.toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 text-right">
                      {renderDiffBadge(transDiff, transPct)}
                    </td>
                  </tr>

                  {/* Energy Emissions */}
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-4 px-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Electricity & Energy
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {(p1.energyKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {(p2.energyKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {energyDiff > 0 ? '+' : ''}
                      {energyDiff.toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 text-right">
                      {renderDiffBadge(energyDiff, energyPct)}
                    </td>
                  </tr>

                  {/* Waste Diverted */}
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-4 px-4 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-purple-400" />
                      Waste Diverted / Composted
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {(p1.wasteKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {(p2.wasteKg || 0).toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {wasteDiff > 0 ? '+' : ''}
                      {wasteDiff.toFixed(2)} kg
                    </td>
                    <td className="py-4 px-4 text-right">
                      {renderDiffBadge(wasteDiff, wastePct, true)}
                    </td>
                  </tr>

                  {/* Water Consumed */}
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-4 px-4 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-cyan-400" />
                      Water Consumption
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {(p1.waterKg || 0).toFixed(0)} L
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {(p2.waterKg || 0).toFixed(0)} L
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {((p1.waterKg || 0) - (p2.waterKg || 0)) > 0 ? '+' : ''}
                      {((p1.waterKg || 0) - (p2.waterKg || 0)).toFixed(0)} L
                    </td>
                    <td className="py-4 px-4 text-right">
                      {renderDiffBadge((p1.waterKg || 0) - (p2.waterKg || 0), null)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Methodology & Data Completeness Footnote */}
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-300">Auditable Comparison Rule:</span> Calculations compare verified and entered emission ledgers across equalized calendar dates. Missing days in either period reflect true logged activity; where records are absent, conservative estimates are never fabricated.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BeforeAfterComparisonView;
