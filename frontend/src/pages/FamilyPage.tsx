import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAQI } from '../context/AQIContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Heart,
  Baby,
  User,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  group: 'child' | 'adult' | 'elderly';
}

export const FamilyPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  // Stored in localStorage for instant privacy
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('clearair_family_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'mem-1', name: 'Child / Student', group: 'child' },
      { id: 'mem-2', name: 'Elderly Parent', group: 'elderly' },
    ];
  });

  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<'child' | 'adult' | 'elderly'>('child');
  const [showAddForm, setShowAddForm] = useState(false);

  const saveMembers = (updated: FamilyMember[]) => {
    setMembers(updated);
    localStorage.setItem('clearair_family_members', JSON.stringify(updated));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMem: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: newName.trim(),
      group: newGroup,
    };
    saveMembers([...members, newMem]);
    setNewName('');
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: string) => {
    saveMembers(members.filter((m) => m.id !== id));
  };

  const isSevere = metrics.pollutionPercent > 75;
  const isHigh = metrics.pollutionPercent > 50;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-sky-500" />
              <span>Family Protection</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Clear, practical advice to protect children, adults, and elderly family members from winter smog.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* Current Pollution Warning Bar for Families */}
        <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${metrics.badgeBg} ${metrics.statusColor}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">
                Family Air Alert: {metrics.status} ({metrics.pollutionPercent}%)
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isSevere
                  ? 'Severe winter smog detected. All family members should stay indoors and minimize lung exposure.'
                  : isHigh
                  ? 'Pollution is elevated today. Children and seniors should avoid early morning and evening outdoor play.'
                  : 'Air quality is acceptable for family outdoor routines.'}
              </p>
            </div>
          </div>
        </div>

        {/* Add Member Form Modal / Accordion */}
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="p-5 rounded-2xl border border-sky-500/30 bg-sky-50/20 dark:bg-sky-950/20 space-y-3 text-xs animate-in fade-in duration-200"
          >
            <h3 className="font-bold text-zinc-900 dark:text-white">Add a Family Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Name or Label</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Daughter, Grandpa, Baby"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Age Group</label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="child">Child (Under 18)</option>
                  <option value="adult">Adult (18 - 60)</option>
                  <option value="elderly">Elderly (Above 60)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Member-Specific Cards */}
        {members.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Personalized Guidance for Your Family Members
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((mem) => {
                const isChild = mem.group === 'child';
                const isElderly = mem.group === 'elderly';

                return (
                  <div
                    key={mem.id}
                    className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
                      <div className="flex items-center gap-2">
                        {isChild ? (
                          <Baby className="w-4 h-4 text-sky-500" />
                        ) : isElderly ? (
                          <HeartPulse className="w-4 h-4 text-amber-500" />
                        ) : (
                          <User className="w-4 h-4 text-zinc-500" />
                        )}
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">{mem.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 capitalize">
                          {mem.group}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(mem.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-zinc-600 dark:text-zinc-300">
                      {isChild ? (
                        <>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                            <span>
                              {isHigh
                                ? 'Keep children away from heavy outdoor sports or morning running in cold smog.'
                                : 'Ensure adequate hydration throughout the school day.'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                            <span>
                              {isHigh
                                ? 'Have children wear a comfortable mask on the school bus or during morning transit.'
                                : 'Indoor activities and normal school routines are safe today.'}
                            </span>
                          </div>
                        </>
                      ) : isElderly ? (
                        <>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              {isHigh
                                ? 'Avoid early morning walks before 9:00 AM when cold temperature inversion blankets trap ground pollution.'
                                : 'Light morning walks after 8:30 AM are safe.'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              Keep any prescribed inhalers or medicines handy in the bedroom; keep room windows closed.
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                            <span>
                              Use metro, bus, or carpool rather than open 2-wheelers during heavy rush-hour smog.
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                            <span>
                              Run an air purifier in bedrooms at night to aid respiratory recovery during sleep.
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6 Core Practical Family Actions */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Core Family Protection Checklist
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">1. Outdoor Exercise</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Keep children and seniors away from vigorous outdoor exercise during high-pollution mornings.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">2. Window Management</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Keep windows closed during morning rush hour and cold nights when outdoor pollution is highest.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">3. Dust & Surface Mopping</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Keep indoor spaces clean by wet-mopping floors daily instead of broom sweeping.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">4. Bedroom Purification</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Use a HEPA air purifier in family bedrooms if available to ensure clean breathing during sleep.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">5. Smart Errand Timing</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Plan essential outdoor errands between 12:00 PM and 3:30 PM when sunlight disperses smog.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white block">6. Smoke Prevention</span>
              <p className="text-zinc-600 dark:text-zinc-300">
                Avoid burning incense coils, candles, or waste leaves near living quarters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};