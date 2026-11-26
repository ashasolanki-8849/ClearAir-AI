import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Wind,
  Home,
  Clock,
  Car,
  Lightbulb,
  Flame,
  Check,
  GraduationCap,
  Users,
  Briefcase,
  HeartPulse,
} from 'lucide-react';

interface DailyAction {
  id: string;
  title: string;
  impact: string;
}

const CATEGORY_DAILY_ACTIONS: Record<string, DailyAction[]> = {
  general: [
    {
      id: 'act-gen-1',
      title: 'Wipe indoor floors with a damp cloth instead of sweeping with a dry broom',
      impact: 'Stops fine dust particles from flying up into your breathing zone.',
    },
    {
      id: 'act-gen-2',
      title: 'Avoid morning outdoor exercise during cold smoggy windows (6:00 AM – 9:00 AM)',
      impact: 'Prevents heavy particulate buildup in your lungs when inversion smog is trapped near the ground.',
    },
    {
      id: 'act-gen-3',
      title: 'Switch one trip today to the metro, public bus, or a carpool',
      impact: 'Cuts direct vehicle exhaust emissions on local roads.',
    },
    {
      id: 'act-gen-4',
      title: 'Turn off switches and appliances when not in use',
      impact: 'Reduces electricity demand from regional fossil power stations.',
    },
    {
      id: 'act-gen-5',
      title: 'Never burn dry garden leaves or household waste',
      impact: 'Directly stops toxic black carbon and choking smoke in your neighborhood.',
    },
  ],
  student: [
    {
      id: 'act-stu-1',
      title: 'Wear a certified N95 mask during school or campus commutes',
      impact: 'Filters out 95% of toxic roadside particles and vehicle smoke.',
    },
    {
      id: 'act-stu-2',
      title: 'Request indoor sports or indoor PE activities during high pollution days',
      impact: 'Reduces heavy deep breathing in smog that harms developing lungs.',
    },
    {
      id: 'act-stu-3',
      title: 'Carry a water bottle and stay hydrated throughout classes',
      impact: 'Helps keep mucosal linings hydrated and clears throat irritation.',
    },
    {
      id: 'act-stu-4',
      title: 'Carpool with classmates or take the school/college electric bus',
      impact: 'Fewer cars dropping off students at the gate cuts morning traffic smog.',
    },
    {
      id: 'act-stu-5',
      title: 'Study in rooms with closed windows and clean ventilation',
      impact: 'Prevents fatigue, headaches, and loss of focus during exam revision.',
    },
  ],
  family: [
    {
      id: 'act-fam-1',
      title: 'Keep children indoors before 9:00 AM while cold smog is trapped low',
      impact: 'Protects young lungs from peak winter ground inversion concentrations.',
    },
    {
      id: 'act-fam-2',
      title: 'Place a damp rolled towel at the base of exterior doors and balcony gaps',
      impact: 'Blocks outdoor particulate drafts from penetrating living areas and bedrooms.',
    },
    {
      id: 'act-fam-3',
      title: 'Cover cooking pots with lids and turn on kitchen exhaust fan while cooking',
      impact: 'Prevents indoor oil vapors and gas combustion fumes from settling in rooms.',
    },
    {
      id: 'act-fam-4',
      title: 'Keep emergency asthma inhalers and saline nasal sprays readily accessible',
      impact: 'Ensures immediate relief if sudden smog causes wheezing or breathing discomfort.',
    },
    {
      id: 'act-fam-5',
      title: 'Prepare warm tulsi-ginger-honey water for children and family members in the evening',
      impact: 'Soothes inflamed airways and reduces throat coughing after outdoor exposure.',
    },
  ],
  working_professional: [
    {
      id: 'act-pro-1',
      title: 'Set vehicle ventilation to "Internal Recirculation" mode in traffic',
      impact: 'Blocks toxic nitrogen dioxide and diesel fumes from entering your car cabin.',
    },
    {
      id: 'act-pro-2',
      title: 'Shift commute departure 30 minutes earlier or later to avoid peak rush hours',
      impact: 'Cuts time spent stuck in idling bumper-to-bumper tailpipe exhaust.',
    },
    {
      id: 'act-pro-3',
      title: 'Work out in an indoor gym or at home instead of outdoor jogging',
      impact: 'Avoids heavy cardiovascular inhalation of roadside micro-particles.',
    },
    {
      id: 'act-pro-4',
      title: 'Turn off vehicle ignition at red light stops lasting longer than 20 seconds',
      impact: 'Stops wasted fuel and prevents toxic localized emissions buildup at junctions.',
    },
    {
      id: 'act-pro-5',
      title: 'Keep an Areca palm or desk plant and take hourly hydration breaks',
      impact: 'Relieves dry eyes and headache caused by stale indoor office air.',
    },
  ],
  elderly: [
    {
      id: 'act-eld-1',
      title: 'Postpone morning walks until after 10:30 AM when sunshine disperses the smog',
      impact: 'Seniors avoid breathing cold ground-trapped smog that triggers chest tightness.',
    },
    {
      id: 'act-eld-2',
      title: 'Practice gentle indoor breathing exercises or yoga in a sealed room',
      impact: 'Maintains lung volume and circulation safely without breathing polluted outdoor air.',
    },
    {
      id: 'act-eld-3',
      title: 'Sip warm water or herbal tea throughout the day',
      impact: 'Keeps throat tissues moist and flushes trapped particulates before they irritate.',
    },
    {
      id: 'act-eld-4',
      title: 'Wear an N95 mask if visiting temples, markets, or hospitals during the day',
      impact: 'Protects fragile respiratory and cardiovascular systems from heavy dust.',
    },
    {
      id: 'act-eld-5',
      title: 'Avoid burning incense sticks or mosquito coils inside the bedroom',
      impact: 'Eliminates dense indoor particulate smoke that triggers nocturnal coughing.',
    },
  ],
};

export const WhatToDoPage = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return user?.userCategory || 'general';
  });

  useEffect(() => {
    if (user?.userCategory) {
      setActiveCategory(user.userCategory);
    }
  }, [user?.userCategory]);

  const [completedActions, setCompletedActions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('clearair_completed_actions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('clearair_completed_actions', JSON.stringify(updated));
      return updated;
    });
  };

  const currentActions = CATEGORY_DAILY_ACTIONS[activeCategory] || CATEGORY_DAILY_ACTIONS.general;

  const categories = [
    { key: 'general', label: 'General Citizens', icon: CheckCircle2 },
    { key: 'student', label: 'Students', icon: GraduationCap },
    { key: 'family', label: 'Family & Children', icon: Users },
    { key: 'working_professional', label: 'Working Professionals', icon: Briefcase },
    { key: 'elderly', label: 'Senior Citizens', icon: HeartPulse },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-sky-500" />
            <span>What To Do</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Simple, practical actions and routines tailored to your lifestyle to protect your health and reduce pollution.
          </p>
        </div>

        {/* Demographic Selector Tabs */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block px-1">
            Choose Your Profile for Tailored Guidance:
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sky-500/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Protect Yourself */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">1. Protect Yourself</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Simple steps to stay safe when air pollution is high in your city.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>When to avoid outdoor activities</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cold winter mornings (6:00 AM to 9:00 AM) and late evenings trap heavy smog near the ground. Shift exercise to afternoons or indoors.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>How to reduce exposure to smog</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                If you must travel in heavy traffic, wear a snug-fitting N95 or well-filtered mask and keep car windows rolled up with air recirculation on.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-sky-500" />
                <span>How to keep indoor air cleaner</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Close doors and windows during smog peaks. Seal door draft gaps with a cloth or draft stopper, and avoid burning incense or mosquito coils inside.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Caring for vulnerable family members</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Children, pregnant women, and senior citizens with respiratory conditions should remain inside when pollution levels indicate High or Very High.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Reduce Pollution */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">2. Reduce Pollution</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ways our daily habits can prevent adding more smoke into the air.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-sky-500" />
                <span>Use public transport & carpool</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Taking the metro or bus instead of solo car trips takes dozens of exhaust pipes off the road.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                <span>Save electricity at home</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Turn off geysers, lights, and appliances when not needed. Saving power directly reduces emissions from thermal power plants.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Never burn garden waste or trash</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Open burning of dry leaves, garbage, or plastics creates toxic ground-level smoke. Compost leaves into soil instead.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Avoid unnecessary idling</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Turn off your vehicle engine at traffic red lights if the wait is over 20 seconds to prevent localized fumes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Simple Daily Actions (Tailored by Role) */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">3. Tailored Daily Checklist</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tap to mark actions you completed today.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              {completedActions.filter((id) => currentActions.some((a) => a.id === id)).length} of {currentActions.length} Done
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {currentActions.map((action) => {
              const isDone = completedActions.includes(action.id);
              return (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isDone
                      ? 'border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-sky-500 border-sky-500 text-white'
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <p
                      className={`font-semibold ${
                        isDone
                          ? 'text-zinc-900 dark:text-white line-through opacity-70'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {action.title}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {action.impact}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
