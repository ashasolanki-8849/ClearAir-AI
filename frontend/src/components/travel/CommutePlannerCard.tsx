import React, { useState } from 'react';
import { GraduationCap, Briefcase, Users, CheckCircle2, AlertTriangle, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export const CommutePlannerCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'office' | 'family'>('student');

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Specialized Commuter Solutions
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tailored travel playbooks for students, corporate teams, and families
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'student'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Commute</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'office'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Corporate / Office</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'family'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family & Sensitive</span>
          </button>
        </div>
      </div>

      {/* Student Commute Tab */}
      {activeTab === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              1. Metro & Campus Rail First
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Avoid open bicycle or e-rickshaw commutes along major ring roads during early morning college hours (07:30 - 09:30 AM). Metro transit provides grade-separated filtered air and 80% lower PM2.5 inhalation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              2. Campus Bypass Corridors
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              When walking the final mile from metro to campus, choose residential inner lanes or campus park trails rather than perimeter arterial boulevards with idling diesel buses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              3. Two-Wheeler Mask Protocol
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              If riding a motorcycle or scooter to university, a certified N95 or FFP2 respirator with tight nasal pinch is non-negotiable. Cloth face masks offer less than 15% filtration against sub-micron soot particles.
            </p>
          </div>
        </div>
      )}

      {/* Office Commute Tab */}
      {activeTab === 'office' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              1. Staggered Arrival (Post-10:00 AM)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Shifting departure from 8:30 AM to 10:30 AM allows morning thermal inversion to lift, slashing roadside particulate density by 35% and cutting commute gridlock time in half.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" />
              2. Corporate Carpooling Circles
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Sharing a 4-person carpool reduces per-commuter CO₂ emissions to under 38g/km while ensuring an enclosed HEPA cabin environment with internal AC air recirculation enabled.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              3. Cabin Filter Maintenance
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Upgrade your vehicle cabin air filter to an activated-carbon PM2.5 filter before the winter season begins. Replace annually or every 10,000 km for optimal smog capture.
            </p>
          </div>
        </div>
      )}

      {/* Family Travel Tab */}
      {activeTab === 'family' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              1. Enclosed Cabin Preference
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Always opt for AC cabs or private vehicles with closed windows and internal recirculation when traveling with toddlers, seniors, or family members with cardiac or pulmonary conditions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              2. Midday Shopping & Outings
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Schedule all essential outdoor family errands, grocery visits, and doctor consultations strictly between 12:00 PM and 3:30 PM when ambient smog dispersion is at its diurnal maximum.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              3. Avoid Open Auto-Rickshaws
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Open three-wheelers expose children sitting on side seats directly to heavy diesel truck exhaust plumes at direct chest height. Use app-based cabs or public transit when AQI exceeds 250.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
