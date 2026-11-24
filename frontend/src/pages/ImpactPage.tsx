import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ImpactOverviewCard } from '../components/impact/ImpactOverviewCard';
import { CarbonFootprintCalculatorModal } from '../components/impact/CarbonFootprintCalculatorModal';
import { DailyActivityLoggerCard } from '../components/impact/DailyActivityLoggerCard';
import { BeforeAfterComparisonView } from '../components/impact/BeforeAfterComparisonView';
import { LocalAirPollutionTrackerCard } from '../components/impact/LocalAirPollutionTrackerCard';
import { EnvironmentalGoalsCard } from '../components/impact/EnvironmentalGoalsCard';
import { FamilyCommunityImpactCard } from '../components/impact/FamilyCommunityImpactCard';
import { SmartEnvironmentalInsightsCard } from '../components/impact/SmartEnvironmentalInsightsCard';
import { AskImpactAdvisorModal } from '../components/impact/AskImpactAdvisorModal';
import { EnvironmentalReportGeneratorModal } from '../components/impact/EnvironmentalReportGeneratorModal';
import { DataSourcesMethodologyModal } from '../components/impact/DataSourcesMethodologyModal';

import { impactService } from '../services/impactService';
import {
  DashboardImpactData,
  EnvironmentalActivityData,
  ActivityCategory,
} from '../types';

import {
  BarChart3,
  Calculator,
  PlusCircle,
  GitCompare,
  Wind,
  Target,
  Users,
  Sparkles,
  FileText,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

type TabType = 'overview' | 'actions' | 'compare' | 'pollution' | 'goals' | 'collective';

export const ImpactPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [filter, setFilter] = useState<string>('this_month');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardImpactData | null>(null);
  const [activities, setActivities] = useState<EnvironmentalActivityData[]>([]);

  // Modals state
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [advisorOpen, setAdvisorOpen] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);

  const fetchDashboardAndActivities = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, actRes] = await Promise.all([
        impactService.getDashboard(filter),
        impactService.getActivities({ limit: 20 }),
      ]);

      if (dashRes.success && dashRes.dashboard) {
        setDashboardData(dashRes.dashboard);
      }
      if (actRes.success && actRes.activities) {
        setActivities(actRes.activities);
      }
    } catch (err) {
      console.error('Error fetching impact dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDashboardAndActivities();
  }, [fetchDashboardAndActivities, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogActivity = async (data: {
    activityName: string;
    category: ActivityCategory;
    date?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => {
    const res = await impactService.logActivity(data);
    if (res.success) {
      handleRefresh();
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const res = await impactService.deleteActivity(id);
    if (res.success) {
      handleRefresh();
    }
  };

  const handleCalculateTransport = async (data: any) => {
    return impactService.calculateTransport(data);
  };

  const handleCalculateEnergy = async (data: any) => {
    return impactService.calculateEnergy(data);
  };

  const handleCalculateWaste = async (data: any) => {
    return impactService.calculateWaste(data);
  };

  const handleCalculateWater = async (data: any) => {
    return impactService.calculateWater(data);
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Ledger', icon: BarChart3 },
    { id: 'actions', label: 'Log Green Actions', icon: PlusCircle },
    { id: 'compare', label: 'Period Comparison', icon: GitCompare },
    { id: 'pollution', label: 'Local AQI vs CO₂e', icon: Wind },
    { id: 'goals', label: 'Reduction Goals', icon: Target },
    { id: 'collective', label: 'Family & Community', icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                MODULE 9: LIVE & AUDITABLE
              </span>
              <span className="text-xs text-zinc-400 font-mono">CEA v19 • IPCC AR6 Compliant</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <BarChart3 className="w-8 h-8 text-emerald-500" />
              Environmental Impact Tracker & Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Transparently track your personal carbon footprint, measure avoided criteria pollutants, compare verifiable periods, and disaggregate greenhouse gases from ambient urban smog.
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setCalculatorOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/30"
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculate Footprint
            </button>

            <button
              onClick={() => setAdvisorOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI Advisor
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Audit Report
            </button>

            <button
              onClick={() => setMethodologyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 text-xs font-medium transition-all"
              title="View verified emission factors and citations"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              Methodology
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
              title="Refresh ledger data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800/80 scrollbar-none">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:text-zinc-400 border border-transparent dark:border-zinc-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {dashboardData ? (
                <ImpactOverviewCard
                  data={dashboardData}
                  filter={filter}
                  onFilterChange={(newFilter) => setFilter(newFilter)}
                  onOpenCalculator={() => setCalculatorOpen(true)}
                  onOpenInsights={() => setActiveTab('overview')}
                />
              ) : loading ? (
                <div className="py-16 text-center text-zinc-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-2" />
                  <p className="text-xs">Loading auditable footprint ledger...</p>
                </div>
              ) : null}

              <SmartEnvironmentalInsightsCard
                onOpenAdvisor={() => setAdvisorOpen(true)}
                onOpenCalculator={() => setCalculatorOpen(true)}
              />
            </div>
          )}

          {activeTab === 'actions' && (
            <DailyActivityLoggerCard
              activities={activities}
              onLogActivity={handleLogActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {activeTab === 'compare' && (
            <BeforeAfterComparisonView onRefreshNeeded={handleRefresh} />
          )}

          {activeTab === 'pollution' && <LocalAirPollutionTrackerCard />}

          {activeTab === 'goals' && (
            <EnvironmentalGoalsCard onGoalUpdated={handleRefresh} />
          )}

          {activeTab === 'collective' && <FamilyCommunityImpactCard />}
        </div>
      </div>

      {/* Global Modals */}
      <CarbonFootprintCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onCalculateTransport={handleCalculateTransport}
        onCalculateEnergy={handleCalculateEnergy}
        onCalculateWaste={handleCalculateWaste}
        onCalculateWater={handleCalculateWater}
        onCalculationSaved={handleRefresh}
      />

      <AskImpactAdvisorModal
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
      />

      <EnvironmentalReportGeneratorModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <DataSourcesMethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </DashboardLayout>
  );
};
export default ImpactPage;
