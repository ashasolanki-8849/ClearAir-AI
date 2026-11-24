import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sparkles, DollarSign, CheckCircle2, Wrench, Shield, ArrowRight } from 'lucide-react';

interface SolutionItem {
  id: string;
  problem: string;
  action: string;
  costCategory: 'zero_cost' | 'low_cost' | 'medium_cost' | 'higher_investment';
  expectedBenefit: string;
  maintenance: string;
}

const SOLUTIONS: SolutionItem[] = [
  // Low / Zero Cost
  {
    id: 'sol_damp_mopping',
    problem: 'Dry broom sweeping launches settled PM10 and allergens back into breathing height.',
    action: 'Damp-mop hard tiled floors using water with a drop of mild soap (wet pocha) instead of dry sweeping.',
    costCategory: 'zero_cost',
    expectedBenefit: 'Permanently captures 70%+ of floor dust without resuspending it into the air.',
    maintenance: 'Rinse mop frequently; replace water bucket between rooms.',
  },
  {
    id: 'sol_incense_reduction',
    problem: 'Smoldering agarbatti & dhoop release benzene, PAHs, and PM2.5 in closed prayer rooms.',
    action: 'Substitute burning dhoop with flameless brass LED diyas, pure camphor in tiny pinches, or burn incense only on an open balcony.',
    costCategory: 'zero_cost',
    expectedBenefit: 'Avoids acute morning PM2.5 spikes of 100–300 µg/m³ in living quarters.',
    maintenance: 'Wipe prayer room altar surfaces weekly with a damp microfiber cloth.',
  },
  {
    id: 'sol_kitchen_isolation',
    problem: 'Hot frying oil and spice tadka disperse ultrafine grease aerosols across hallways and bedrooms.',
    action: 'Turn on exhaust fan 1 minute before lighting burners, cover pans with splatter lids, and firmly shut bedroom corridor doors during cooking.',
    costCategory: 'zero_cost',
    expectedBenefit: 'Confines up to 80% of culinary smoke plumes to the kitchen extraction zone.',
    maintenance: 'Soak range hood mesh baffles in warm degreasing water once a month.',
  },
  // Medium Cost
  {
    id: 'sol_weatherstrip_windows',
    problem: 'Outdoor winter smog infiltrates through sliding window tracks and gaps around door frames.',
    action: 'Apply self-adhesive EPDM rubber or foam weatherstripping tape along window perimeter sills and fit a bottom door draft stopper.',
    costCategory: 'low_cost',
    expectedBenefit: 'Reduces passive outdoor smog leakage into bedrooms by 30% to 50%.',
    maintenance: 'Re-inspect adhesive bond each autumn before smog season begins.',
  },
  {
    id: 'sol_exhaust_fan_upgrade',
    problem: 'Slow or clogged kitchen/bathroom exhaust fans fail to achieve effective air extraction.',
    action: 'Clean clogged fan louvers and upgrade to a high-CFM exterior-discharging exhaust fan.',
    costCategory: 'medium_cost',
    expectedBenefit: 'Rapidly exhausts accumulated moisture, cooking pollutants, and VOCs.',
    maintenance: 'Degrease fan blades every 3–6 months.',
  },
  {
    id: 'sol_hvac_merv13',
    problem: 'Standard residential AC filters only catch coarse hair, letting fine PM2.5 pass through.',
    action: 'Replace thin foam AC intake mesh with pleated MERV 11 to MERV 13 filtration media if static pressure permits.',
    costCategory: 'medium_cost',
    expectedBenefit: 'Enables existing split/central AC to assist in scrubbing fine atmospheric dust.',
    maintenance: 'Inspect and replace or vacuum intake filters every 3 months.',
  },
  // Higher Investment
  {
    id: 'sol_true_hepa_purifier',
    problem: 'Severe ambient winter smog (AQI > 250) trapped indoors during sleeping and studying.',
    action: 'Install a certified True HEPA (Grade H13) mechanical purifier with CADR matched to 5 Air Changes per Hour for your room volume.',
    costCategory: 'higher_investment',
    expectedBenefit: 'Removes 99.97% of airborne PM2.5, smoke, and pollen down to 0.3 microns.',
    maintenance: 'Vacuum mesh pre-filter every 2–3 weeks; replace composite HEPA filter every 6–12 months.',
  },
  {
    id: 'sol_dedicated_iaq_monitor',
    problem: 'Lack of real-time visibility into indoor particulate and CO2 accumulation.',
    action: 'Deploy an optical laser PM2.5 and NDIR CO2 indoor sensor to inform ventilation decisions.',
    costCategory: 'higher_investment',
    expectedBenefit: 'Provides objective ground truth to trigger pulse ventilation and purifier operation.',
    maintenance: 'Perform zero-calibration in clean outdoor air once every 6 months.',
  },
];

export const AffordableSolutionsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'zero_cost' | 'low_cost' | 'medium_cost' | 'higher_investment'>('all');

  const filtered = SOLUTIONS.filter((s) => {
    if (activeTab === 'all') return true;
    return s.costCategory === activeTab;
  });

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case 'zero_cost':
        return <Badge variant="good">Zero Cost (Habit)</Badge>;
      case 'low_cost':
        return <Badge variant="satisfactory">Low Cost</Badge>;
      case 'medium_cost':
        return <Badge variant="moderate">Medium Cost</Badge>;
      case 'higher_investment':
        return <Badge variant="poor">Higher Investment</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Affordable Indoor Air Solutions (Stratified by Budget)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Practical, scientifically validated interventions designed for every budget level.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          {[
            { id: 'all', label: 'All' },
            { id: 'zero_cost', label: 'Zero Cost' },
            { id: 'low_cost', label: 'Low Cost' },
            { id: 'medium_cost', label: 'Medium Cost' },
            { id: 'higher_investment', label: 'Investment' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Solutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sol) => (
          <div
            key={sol.id}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {getCostBadge(sol.costCategory)}
              </div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {sol.action}
              </p>
              <div className="text-[11px] text-zinc-500 space-y-1">
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Problem:</strong> {sol.problem}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  <strong>Expected Benefit:</strong> {sol.expectedBenefit}
                </p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-zinc-400" />
                {sol.maintenance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
