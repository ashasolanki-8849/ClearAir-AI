import React from 'react';
import { InstitutionSpecificViewData } from '../../types';
import {
  Flame,
  Droplets,
  ShieldCheck,
  Zap,
  Activity,
  Car,
  Wind,
  BookOpen,
  Clock,
  Cpu,
  Users,
  HeartPulse,
  AlertCircle,
  Trees,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface InstitutionSpecificViewProps {
  viewData?: InstitutionSpecificViewData;
  communityType: string;
}

export const InstitutionSpecificView: React.FC<InstitutionSpecificViewProps> = ({
  viewData,
  communityType,
}) => {
  if (!viewData || !viewData.pillars) return null;

  const getPillarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-rose-500" />;
      case 'Car':
        return <Car className="w-5 h-5 text-purple-500" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-teal-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-teal-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'AlertCircle':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Trees className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {viewData.focusArea}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            Operational Blueprint
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Specialized governance checklists, staff welfare protocols, and air filtration standards
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viewData.pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs">
                {getPillarIcon(pillar.icon)}
              </div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {pillar.title}
              </h4>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {pillar.description}
            </p>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5 text-[11px]">
              <span className="font-semibold text-zinc-500 uppercase tracking-wider block">
                Key Metrics Tracked
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pillar.metricsTracked.map((metric, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    ✓ {metric}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
