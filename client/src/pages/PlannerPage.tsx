import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PlannerTimeline } from '../components/planner/PlannerTimeline';
import { LifestyleSetupModal } from '../components/planner/LifestyleSetupModal';
import { FamilyPlannerModal } from '../components/planner/FamilyPlannerModal';
import { RemindersModal } from '../components/planner/RemindersModal';
import { AddActivityModal } from '../components/planner/AddActivityModal';
import { plannerService } from '../services/plannerService';
import {
  DailyPlanData,
  LifestyleProfileData,
  SupportedLanguage,
} from '../types';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAQIConfig } from '../utils/aqiHelper';
import {
  Compass,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Sliders,
  Users,
  Bell,
  Shield,
  CheckCircle2,
  TrendingDown,
  Leaf,
  Globe,
  Info,
  Layers,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { location, aqiData, refreshAQI, isLoading: aqiLoading } = useAQI();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('clearair_planner_lang') as SupportedLanguage) || 'en';
  });

  const [plan, setPlan] = useState<DailyPlanData | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modals
  const [showLifestyleModal, setShowLifestyleModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  const aqiConfig = getAQIConfig(aqiData?.aqiCategory || 'Moderate');

  const getCategoryBadgeVariant = (cat?: string): 'good' | 'satisfactory' | 'moderate' | 'poor' | 'verypoor' | 'severe' | 'default' => {
    switch (cat) {
      case 'Good': return 'good';
      case 'Satisfactory': return 'satisfactory';
      case 'Moderate': return 'moderate';
      case 'Poor': return 'poor';
      case 'Very Poor': return 'verypoor';
      case 'Severe': return 'severe';
      default: return 'moderate';
    }
  };

  // Load lifestyle & today's plan
  const loadPlanAndLifestyle = useCallback(async (isRefresh = false) => {
    if (isRefresh) setReEvaluating(true);
    else setLoading(true);

    try {
      // 1. Fetch lifestyle
      const lifestyleRes = await plannerService.getLifestyle().catch(() => null);
      if (lifestyleRes?.success && lifestyleRes.profile) {
        setLifestyle(lifestyleRes.profile);
      }

      // 2. Fetch or generate today's plan
      const planRes = isRefresh
        ? await plannerService.generatePlan(
            {
              lat: location.lat,
              lon: location.lon,
              name: location.name,
              city: location.city || location.name,
            },
            language,
            true
          )
        : await plannerService.getTodayPlan(
            {
              lat: location.lat,
              lon: location.lon,
              name: location.name,
              city: location.city || location.name,
            },
            language
          );

      if (planRes?.success && planRes.plan) {
        setPlan(planRes.plan);
        if (isRefresh) {
          showToast('Schedule re-evaluated against live ambient AQI!', 'success');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to initialize daily plan.', 'error');
    } finally {
      setLoading(false);
      setReEvaluating(false);
    }
  }, [location, language, showToast]);

  useEffect(() => {
    loadPlanAndLifestyle();
  }, [loadPlanAndLifestyle]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('clearair_planner_lang', newLang);
    showToast(`Switched plan language to ${newLang.toUpperCase()}`, 'info');
  };

  const handleToggleStatus = async (activityId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await plannerService.updateActivityStatus(activityId, nextStatus, plan?._id);
      if (res.success && res.plan) {
        setPlan(res.plan);
        if (nextStatus === 'completed') {
          showToast('Activity completed! Exposure reduction recorded.', 'success');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update activity status.', 'error');
    }
  };

  const handleSwapAlternative = async (activityId: string) => {
    try {
      const res = await plannerService.swapActivityWithAlternative(activityId, plan?._id);
      if (res.success && res.plan) {
        setPlan(res.plan);
        showToast('Substituted with indoor air-safe alternative!', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to swap activity.', 'error');
    }
  };

  const handleAddCustomActivity = async (activityData: {
    period: string;
    activity: string;
    recommendedTime: string;
    indoorOutdoor: string;
  }) => {
    try {
      const res = await plannerService.addCustomActivity(activityData);
      if (res.success && res.plan) {
        setPlan(res.plan);
        showToast('Custom activity added to today\'s schedule.', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to add activity.', 'error');
    }
  };

  const handleSaveLifestyle = async (updated: Partial<LifestyleProfileData>) => {
    try {
      const res = await plannerService.updateLifestyle(updated);
      if (res.success && res.profile) {
        setLifestyle(res.profile);
        showToast('Lifestyle preferences saved. Re-evaluating schedule...', 'success');
        // Regenerate plan with updated lifestyle
        await loadPlanAndLifestyle(true);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update lifestyle.', 'error');
    }
  };

  // Calculations for stats
  const totalActivities = plan?.activities?.length || 0;
  const completedActivities =
    plan?.activities?.filter((a) => a.status === 'completed').length || 0;
  const completionPercentage =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

  const indoorProtectedCount =
    plan?.activities?.filter((a) => a.indoorOutdoor === 'indoor').length || 0;

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                MODULE 3: ACTIVE
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {plan?.date || 'Today'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              My Daily Action Planner
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Personalized diurnal smog schedule grounded in real-time CPCB telemetry for{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{location.name}</strong>.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707]">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {/* Re-evaluate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshAQI();
                loadPlanAndLifestyle(true);
              }}
              disabled={loading || reEvaluating || aqiLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${reEvaluating || aqiLoading ? 'animate-spin text-emerald-500' : ''}`}
              />
              <span className="hidden sm:inline">Re-evaluate with Live AQI</span>
              <span className="sm:hidden">Refresh</span>
            </Button>

            {/* Modals Triggers */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLifestyleModal(true)}
              className="gap-1.5 text-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>Lifestyle</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFamilyModal(true)}
              className="gap-1.5 text-xs"
            >
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span>Family</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRemindersModal(true)}
              className="gap-1.5 text-xs"
            >
              <Bell className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reminders</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddActivityModal(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </Button>
          </div>
        </div>

        {/* Top 4 Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Live Environmental Context */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Current AQI & Smog Window
              </span>
              <Badge variant={getCategoryBadgeVariant(aqiData?.aqiCategory)}>
                {aqiData?.aqiCategory || aqiConfig.category}
              </Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {aqiData?.aqi || '--'}
                </span>
                <span className="text-xs text-zinc-400">AQI (US/CPCB)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
                {aqiData && aqiData.aqi > 200
                  ? 'Severe morning & late evening surface smog inversion. Shift workouts indoors.'
                  : aqiData && aqiData.aqi > 100
                  ? 'Moderate particulate concentration. Afternoon offers optimal dispersion.'
                  : 'Favorable air quality conditions for outdoor routines.'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {aqiData?.lastUpdated ? new Date(aqiData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
              </span>
              <span>{location.name}</span>
            </div>
          </Card>

          {/* Card 2: Today's Completion Progress */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Daily Plan Progress
              </span>
              <span className="text-xs font-mono font-bold text-emerald-500">
                {completionPercentage}%
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  {completedActivities} / {totalActivities}
                </span>
                <span className="text-xs text-zinc-400">Activities Done</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{totalActivities - completedActivities} activities remaining</span>
              <span className="text-emerald-500 font-medium">
                {completionPercentage === 100 ? 'Day Complete' : 'Active'}
              </span>
            </div>
          </Card>

          {/* Card 3: Exposure Mitigation Benefit */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Exposure Mitigation
              </span>
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {indoorProtectedCount}
                </span>
                <span className="text-xs text-zinc-400">Safe Indoor Windows</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Protected against peak diurnal surface ozone and particulate spikes during vulnerable morning hours.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-500">
                <TrendingDown className="w-3 h-3" />
                -38% estimated PM2.5 inhalation
              </span>
            </div>
          </Card>

          {/* Card 4: Demographic Profile */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Active Persona
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize">
                {lifestyle?.userCategory || user?.userCategory || 'Professional'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {user?.fullName ? `Hello, ${user.fullName.split(' ')[0]}` : 'Welcome, Guest'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Schedule: Wake {lifestyle?.schedule?.wakeUpTime || '06:30'} • Work{' '}
                {lifestyle?.schedule?.workOrSchoolStart || '09:00'} -{' '}
                {lifestyle?.schedule?.workOrSchoolEnd || '17:30'} • Sleep{' '}
                {lifestyle?.schedule?.sleepTime || '22:30'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{todayDateFormatted}</span>
              <button
                onClick={() => setShowLifestyleModal(true)}
                className="text-emerald-500 hover:underline"
              >
                Edit Schedule
              </button>
            </div>
          </Card>
        </div>

        {/* Timeline Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Diurnal Action Timeline (5 Periods)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Each activity evaluates ambient particulate load, personal inhalation risk, and environmental emission impact.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#070707] self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All ({totalActivities})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Pending ({totalActivities - completedActivities})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === 'completed'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Completed ({completedActivities})
            </button>
          </div>
        </div>

        {/* Interactive Timeline */}
        {loading ? (
          <div className="py-20 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Generating your personalized smog-adapted action plan...
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Synchronizing with real-time CPCB telemetry and meteorological inversion curves.
            </p>
          </div>
        ) : (
          <PlannerTimeline
            activities={plan?.activities || []}
            onToggleStatus={handleToggleStatus}
            onSwapAlternative={handleSwapAlternative}
            filter={filter}
          />
        )}

        {/* Scientific Basis & Public Health Disclaimer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#070707] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                Atmospheric Physics & Ground-Level Inversion Notice
              </p>
              <p>
                During northern winter months, radiation inversion traps fine particulate matter (PM2.5) near the ground between <strong>06:00 and 09:30</strong> and after <strong>20:30</strong>. Solar heating peaks vertical mixing around <strong>12:00 to 15:30</strong>, creating the cleanest ventilation and outdoor exercise window of the day.
              </p>
              <p className="text-[11px] text-zinc-500">
                * ClearAir AI provides public-health risk mitigation and exposure reduction planning based on official CPCB & WHO guidelines. This schedule does not replace clinical medical advice. Individuals with chronic cardiovascular or respiratory conditions should consult their healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LifestyleSetupModal
        isOpen={showLifestyleModal}
        onClose={() => setShowLifestyleModal(false)}
        profile={lifestyle}
        onSave={handleSaveLifestyle}
      />

      <FamilyPlannerModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        location={{
          lat: location.lat,
          lon: location.lon,
          name: location.name,
        }}
        language={language}
      />

      <RemindersModal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
      />

      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        onAdd={handleAddCustomActivity}
      />
    </DashboardLayout>
  );
};
