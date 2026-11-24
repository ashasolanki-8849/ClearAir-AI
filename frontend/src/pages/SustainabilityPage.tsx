import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SustainabilityScoreCard } from '../components/sustainability/SustainabilityScoreCard';
import { RecommendedActionsCard } from '../components/sustainability/RecommendedActionsCard';
import { BudgetSolutionsView } from '../components/sustainability/BudgetSolutionsView';
import { LocalSolutionsFinder } from '../components/sustainability/LocalSolutionsFinder';
import { ImpactCalculatorCard } from '../components/sustainability/ImpactCalculatorCard';
import { GreenChallengeView } from '../components/sustainability/GreenChallengeView';
import { FamilyCommunitySustainabilityCard } from '../components/sustainability/FamilyCommunitySustainabilityCard';
import { BeforeAfterComparisonCard } from '../components/sustainability/BeforeAfterComparisonCard';
import { SustainabilityAssistantModal } from '../components/sustainability/SustainabilityAssistantModal';
import { sustainabilityService } from '../services/sustainabilityService';
import {
  UserSustainabilityProfileData,
  SustainableRecommendationData,
  SustainableActionData,
  BudgetAlternativeData,
  LocalSustainableFacilityData,
  ChallengeProgressData,
  HouseholdSustainabilityData,
  ImpactSummaryData,
  BeforeAfterComparisonItem,
  BudgetPreference,
} from '../types';
import { useAQI } from '../context/AQIContext';
import { useToast } from '../context/ToastContext';
import {
  Leaf,
  Wallet,
  MapPin,
  Flame,
  Calculator,
  Users,
  Sparkles,
  RefreshCw,
  Award,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

type ActiveTab = 'overview' | 'budget' | 'local' | 'challenges' | 'comparison';

export const SustainabilityPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<SustainableRecommendationData[]>([]);
  const [alternatives, setAlternatives] = useState<BudgetAlternativeData[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetPreference>('all');
  const [facilities, setFacilities] = useState<LocalSustainableFacilityData[]>([]);
  const [selectedFacilityCategory, setSelectedFacilityCategory] = useState<string>('all');
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgressData | null>(null);
  const [household, setHousehold] = useState<HouseholdSustainabilityData | null>(null);
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryData | null>(null);
  const [comparisons, setComparisons] = useState<BeforeAfterComparisonItem[]>([]);
  const [dataNotice, setDataNotice] = useState<string>('');
  const [sourceAttribution, setSourceAttribution] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dashRes, altRes, locRes, compRes] = await Promise.all([
        sustainabilityService.getDashboard().catch(() => null),
        sustainabilityService.getAlternatives().catch(() => null),
        sustainabilityService.getLocalSolutions(location.lat, location.lon).catch(() => null),
        sustainabilityService.getComparisons().catch(() => null),
      ]);

      if (dashRes?.data) {
        setDashboardData(dashRes.data);
        setRecommendations(dashRes.data.allRecommendations || []);
        setChallengeProgress(dashRes.data.challengeProgress || null);
        setHousehold(dashRes.data.household || null);
        setImpactSummary(dashRes.data.impactSummary || null);
      }

      if (altRes?.alternatives) {
        setAlternatives(altRes.alternatives);
      }

      if (locRes?.facilities) {
        setFacilities(locRes.facilities);
        if (locRes.dataNotice) setDataNotice(locRes.dataNotice);
        if (locRes.sourceAttribution) setSourceAttribution(locRes.sourceAttribution);
      }

      if (compRes?.comparisons) {
        setComparisons(compRes.comparisons);
      }

      if (isRefresh) {
        showToast('Sustainability metrics and recommendations refreshed', 'success');
      }
    } catch (err: any) {
      console.error('Failed to load sustainability data:', err);
      showToast('Error syncing sustainability advisor data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle action mark complete
  const handleCompleteAction = async (id: string) => {
    try {
      const res = await sustainabilityService.updateRecommendationAction(id, 'completed');
      if (res?.success) {
        showToast('Action recorded! Sustainability score updated', 'success');
        if (res.sustainabilityScore && dashboardData) {
          setDashboardData((prev: any) => ({
            ...prev,
            sustainabilityScore: res.sustainabilityScore,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to update action:', err);
      showToast('Error updating action status', 'error');
    }
  };

  // Handle challenge toggle day
  const handleToggleChallengeDay = async (dayNumber: number, isCompleted: boolean) => {
    try {
      const res = await sustainabilityService.updateChallengeDay(dayNumber, isCompleted);
      if (res?.progress) {
        setChallengeProgress(res.progress);
        showToast(`Day ${dayNumber} ${isCompleted ? 'marked completed!' : 'reset'}`, 'info');
      }
    } catch (err) {
      console.error('Failed to toggle challenge day:', err);
    }
  };

  // Handle add household goal
  const handleAddHouseholdGoal = async (goal: { title: string; category: string; targetDescription: string }) => {
    try {
      const res = await sustainabilityService.addHouseholdGoal(goal);
      if (res?.household) {
        setHousehold(res.household);
        showToast('Household goal added', 'success');
      }
    } catch (err) {
      console.error('Failed to add household goal:', err);
    }
  };

  // Handle toggle household goal
  const handleToggleHouseholdGoal = async (goalId: string, isCompleted: boolean) => {
    try {
      const res = await sustainabilityService.updateHouseholdGoal(goalId, {
        isCompleted,
        progressPercentage: isCompleted ? 100 : 50,
      });
      if (res?.household) {
        setHousehold(res.household);
      }
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <Leaf className="w-6 h-6 text-emerald-500" />
                Sustainable Living Advisor
              </h1>
              <Badge variant="good" className="hidden sm:inline-flex">
                Module 7 Active
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl">
              Practical, budget-aware alternatives across transportation, energy, waste, cooking, and water — reducing urban smog and building household resilience
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Advisor</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar gap-2">
          {(
            [
              { id: 'overview', label: 'Advisor Overview', icon: Layers },
              { id: 'budget', label: 'Budget Solutions', icon: Wallet },
              { id: 'local', label: 'Solutions Around Me', icon: MapPin },
              { id: 'challenges', label: '7-Day Challenge & Impact', icon: Flame },
              { id: 'comparison', label: 'Lifestyle Comparison', icon: ArrowRightLeft },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Sustainability Score */}
            {dashboardData?.sustainabilityScore && (
              <SustainabilityScoreCard score={dashboardData.sustainabilityScore} />
            )}

            {/* Recommended Actions */}
            <RecommendedActionsCard
              recommendations={recommendations}
              onCompleteAction={handleCompleteAction}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Quick Household Snapshot */}
            {household && (
              <FamilyCommunitySustainabilityCard
                household={household}
                onAddGoal={handleAddHouseholdGoal}
                onToggleGoal={handleToggleHouseholdGoal}
              />
            )}
          </div>
        )}

        {/* TAB 2: BUDGET SOLUTIONS */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <BudgetSolutionsView
              alternatives={alternatives}
              selectedBudget={selectedBudget}
              onSelectBudget={(b) => setSelectedBudget(b)}
            />
          </div>
        )}

        {/* TAB 3: LOCAL SOLUTIONS */}
        {activeTab === 'local' && (
          <div className="space-y-6">
            <LocalSolutionsFinder
              facilities={facilities}
              selectedCategory={selectedFacilityCategory}
              onSelectCategory={setSelectedFacilityCategory}
              dataNotice={dataNotice}
              sourceAttribution={sourceAttribution}
            />
          </div>
        )}

        {/* TAB 4: CHALLENGES & IMPACT */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {challengeProgress && (
              <GreenChallengeView
                progress={challengeProgress}
                onToggleDay={handleToggleChallengeDay}
              />
            )}

            <ImpactCalculatorCard
              summary={impactSummary || undefined}
              onImpactCalculated={() => loadData(false)}
            />
          </div>
        )}

        {/* TAB 5: LIFESTYLE COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <BeforeAfterComparisonCard
              comparisons={comparisons}
              disclaimerNotice="Actual recorded lifestyle changes are distinguished from model-estimated environmental benefits. Personal actions reduce local emissions and lung deposition without claiming to single-handedly alter citywide ambient AQI."
            />
          </div>
        )}

        {/* AI Sustainable Lifestyle Advisor Modal */}
        <SustainabilityAssistantModal
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          locationName={location.name}
          currentAqi={aqiData?.aqi || 185}
        />
      </div>
    </DashboardLayout>
  );
};
