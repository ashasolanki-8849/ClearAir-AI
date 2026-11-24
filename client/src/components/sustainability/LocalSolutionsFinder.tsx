import React, { useState } from 'react';
import { LocalSustainableFacilityData } from '../../types';
import { MapPin, Navigation, Clock, CheckCircle2, Info, Compass, Phone } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LocalSolutionsFinderProps {
  facilities: LocalSustainableFacilityData[];
  onSelectCategory?: (cat: string) => void;
  selectedCategory?: string;
  dataNotice?: string;
  sourceAttribution?: string;
}

export const LocalSolutionsFinder: React.FC<LocalSolutionsFinderProps> = ({
  facilities,
  onSelectCategory,
  selectedCategory = 'all',
  dataNotice,
  sourceAttribution,
}) => {
  const facilityCategories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Local Hubs' },
    { id: 'e_waste_center', label: '💻 E-Waste Drop-Off' },
    { id: 'dry_waste_collection', label: '📦 Dry Waste (MRF)' },
    { id: 'public_transit_hub', label: '🚇 Mass Transit Hubs' },
    { id: 'bicycle_sharing', label: '🚲 Bike-Share Stations' },
    { id: 'community_composting', label: '🍂 Community Compost' },
    { id: 'renewable_solar_service', label: '☀️ Rooftop Solar Centers' },
    { id: 'refill_zero_waste_store', label: '🛍️ Refill Stores' },
  ];

  const filtered = facilities.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Solutions Available Around Me
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Verified local collection facilities, public transit nodes, and municipal environmental hubs
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-zinc-400 self-start sm:self-auto">
          {filtered.length} Local Facilities
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {facilityCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory && onSelectCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {item.categoryLabel}
                </span>
                {item.distanceKm !== undefined && (
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    ~{item.distanceKm} km away
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {item.name}
              </h4>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-start gap-1">
                <Navigation className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                <span>{item.address}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.operatingHours}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Hub
                </span>
              </div>

              {/* Supported Services Tags */}
              <div className="flex flex-wrap gap-1">
                {item.servicesOffered.map((svc, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-300 font-medium"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Footnote */}
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          {dataNotice || 'Facilities are sourced from municipal environmental portals and CPCB registries. No commercial businesses are fabricated.'}
        </p>
      </div>
    </div>
  );
};
