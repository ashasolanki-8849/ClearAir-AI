import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MythFactItem {
  id: string;
  belief: string;
  explanation: string;
  practicalTakeaway: string;
  reference: string;
}

const MYTHS_AND_FACTS: MythFactItem[] = [
  {
    id: 'myth_plants',
    belief: 'Houseplants can replace mechanical air purifiers during severe winter smog episodes.',
    explanation:
      'The famous 1989 NASA study evaluated plant phytoremediation inside sealed microscopic airtight glass chambers with zero ventilation. In actual homes, natural air exchange rates dilute gases thousands of times faster than potted plant leaves can extract them. A peer-reviewed 2019 review demonstrated you would need 10 to 100 plants per square meter to match the CADR of a basic mechanical air purifier.',
    practicalTakeaway:
      'Enjoy houseplants for psychological biophilic well-being and natural humidity, but rely on certified mechanical True HEPA filtration for removing fine particulate matter (PM2.5).',
    reference: 'Journal of Exposure Science & Environmental Epidemiology (2019) / US EPA',
  },
  {
    id: 'myth_closing_windows',
    belief: 'Keeping all windows closed hermetically 24/7 is always best during winter smog.',
    explanation:
      'While sealing windows reduces outdoor particulate infiltration, indefinite hermetic sealing traps exhaled metabolic carbon dioxide (driving CO2 above 2,000–3,000 ppm), biological moisture, and domestic cooking gases. This results in morning headaches, lethargy, impaired cognitive focus, and mold proliferation.',
    practicalTakeaway:
      'Practice strategic "Pulse Ventilation": open opposite windows widely for a brief 5–10 minute cross-draft window between 12:30 and 15:00 when solar warming lifts the ground smog inversion, then re-seal and scrub with HEPA filtration.',
    reference: 'Harvard T.H. Chan School of Public Health / ASHRAE 62.2 Standard',
  },
  {
    id: 'myth_purifier_all',
    belief: 'Every air purifier cleans all types of indoor pollutants including gases and carbon monoxide.',
    explanation:
      'Mechanical True HEPA filters work exclusively by physical impaction, interception, and diffusion to trap solid particulates (PM2.5, dust, pollen, dander). They do not alter or capture gaseous molecules like carbon monoxide (CO), carbon dioxide (CO2), or nitrogen dioxide (NO2) unless combined with heavy activated carbon beds.',
    practicalTakeaway:
      'Never assume an air purifier protects against toxic heating fumes. Install a dedicated, certified electrochemical Carbon Monoxide (CO) detector in any home utilizing gas or combustion appliances.',
    reference: 'US Environmental Protection Agency (EPA) — Air Cleaners & Air Filters Guide',
  },
  {
    id: 'myth_fragrance',
    belief: 'A pleasant fragrance or floral scent means the indoor air is clean and sanitized.',
    explanation:
      'Aerosol room fresheners, scented plug-ins, and scented candles merely mask bad odors with synthetic volatile organic compounds (VOCs such as limonene, linalool, and phthalates). These chemicals react with ground-level ozone in the air to generate secondary toxic formaldehyde and ultrafine aerosol droplets.',
    practicalTakeaway:
      'Clean air smells like nothing. Eliminate odors at their root source (emptying bins, washing textiles, damp-mopping) rather than spraying chemical perfumes.',
    reference: 'National Institute of Environmental Health Sciences (NIEHS)',
  },
  {
    id: 'myth_air_conditioning',
    belief: 'Air conditioners automatically filter and clean indoor air of smog pollutants.',
    explanation:
      'Standard residential split and window air conditioners merely chill and recirculate the exact same indoor air. Their flimsy nylon mesh filters are designed only to prevent pet fur from clogging cooling coils; they have zero True HEPA capability and allow 90%+ of fine PM2.5 particles to circulate freely.',
    practicalTakeaway:
      'Use your AC in fan/cool mode for temperature and humidity control, but operate a standalone True HEPA air purifier in the same room to achieve particulate scrubbing.',
    reference: 'ASHRAE Residential Building Task Force',
  },
  {
    id: 'myth_cleaning_chemicals',
    belief: 'Household chemical cleaning sprays are always harmless because they are sold commercially.',
    explanation:
      'Bleach (sodium hypochlorite) and ammonia-based glass cleaners emit corrosive chlorine and chloramine vapors that irritate respiratory membranes and trigger asthma attacks. Mixing bleach with acidic cleaners or ammonia can produce lethal toxic chloramine gas clouds.',
    practicalTakeaway:
      'Use mild unscented soap and warm water for everyday floor mopping. When using disinfectants, ventilate the space and never mix different chemical cleaners together.',
    reference: 'American Lung Association (ALA) — Indoor Air Quality in the Home',
  },
];

export const MythsVsFactsCard: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('myth_plants');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
            Public Health Science Guide
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            Indoor Air Myths vs. Scientific Ground Truth
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Debunking common architectural and commercial misconceptions using peer-reviewed environmental research.
          </p>
        </div>
        <Badge variant="outline">6 Verified Evidence Topics</Badge>
      </div>

      <div className="space-y-3">
        {MYTHS_AND_FACTS.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-zinc-100/60 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 block mb-0.5">
                      Common Misconception
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                      "{item.belief}"
                    </p>
                  </div>
                </div>

                <div className="text-zinc-400 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-200/60 dark:border-zinc-800/80 text-xs">
                  {/* Scientific Fact */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Scientific Explanation & Physical Reality:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px]">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Practical Takeaway */}
                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 text-[11px] space-y-0.5">
                    <strong className="text-emerald-700 dark:text-emerald-400 block font-semibold">
                      Practical Daily Takeaway:
                    </strong>
                    <p className="text-zinc-600 dark:text-zinc-400">{item.practicalTakeaway}</p>
                  </div>

                  {/* Reference Citation */}
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                    <span>Reference Source: {item.reference}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
