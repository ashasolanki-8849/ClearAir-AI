import { Shield, AlertTriangle, Users, CheckCircle2, HeartPulse } from 'lucide-react';
import { HealthGuidance, AQICategory } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface HealthRiskCardProps {
  guidance: HealthGuidance;
  category: AQICategory;
  userCategory?: string;
}

export const HealthRiskCard = ({ guidance, category, userCategory }: HealthRiskCardProps) => {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Health Impact & Advisory System
          </h3>
        </div>
        <Badge variant={category.toLowerCase().replace(' ', '') as any} size="md">
          {category} Risk Level
        </Badge>
      </div>

      <div className="mt-4 space-y-4">
        {/* Health Implications Banner */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800/80">
          <h4 className="text-xs font-mono uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            General Health Implications
          </h4>
          <p className="mt-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {guidance.healthImplications}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vulnerable Groups */}
          <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#070707]">
            <h4 className="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              High-Risk Demographics
            </h4>
            <ul className="space-y-1.5">
              {guidance.vulnerableGroups.map((group, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{group}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Precautions */}
          <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#070707]">
            <h4 className="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Actionable Precautions
            </h4>
            <ul className="space-y-1.5">
              {guidance.precautions.map((precaution, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{precaution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Personalized Demographics Note */}
        {userCategory && (
          <div className="px-3.5 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>
              Profile tailored for <strong>{userCategory}</strong>: Monitor respiratory health and minimize outdoor exposure during peak smog hours (06:00 - 09:30).
            </span>
          </div>
        )}

        {/* Medical Advisory Note */}
        <p className="text-[11px] text-zinc-400 italic leading-normal pt-1">
          {guidance.disclaimer}
        </p>
      </div>
    </Card>
  );
};
