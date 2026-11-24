import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SimulationControlsCard } from '../components/simulator/SimulationControlsCard';
import { ScenarioComparisonView } from '../components/simulator/ScenarioComparisonView';
import { SimulationVisualAnalyticsCard } from '../components/simulator/SimulationVisualAnalyticsCard';
import { AIScenarioAnalysisCard } from '../components/simulator/AIScenarioAnalysisCard';
import { CommunitySimulationCard } from '../components/simulator/CommunitySimulationCard';
import { SimulationRecommendationsCard } from '../components/simulator/SimulationRecommendationsCard';
import { SavedScenariosModal } from '../components/simulator/SavedScenariosModal';
import { ScientificMethodologyModal } from '../components/simulator/ScientificMethodologyModal';

import { simulationService } from '../services/simulationService';
import { useAQI } from '../context/AQIContext';
import {
  SimulationParametersData,
  SimulationBaselineData,
  SimulationResultsData,
  ScenarioPresetData,
  SavedScenarioData,
} from '../types';

import {
  Sliders,
  GitCompare,
  BarChart3,
  Sparkles,
  Building2,
  Bookmark,
  BookOpen,
  RotateCcw,
  RefreshCw,
  Target,
  Layers,
  ArrowRight
} from 'lucide-react';

const DEFAULT_PARAMETERS: SimulationParametersData = {
  vehicleReductionPct: 20,
  publicTransitAdoptionPct: 25,
  evAdoptionPct: 10,
  householdsIndoorPurifiedCount: 100,
  treesPlantedCount: 1000,
  constructionDustMitigationPct: 30,
  industrialEmissionReductionPct: 15,
  wasteBurningBanCompliancePct: 60,
  peakHourOutdoorAvoidancePct: 40,
  carpoolingHouseholdsCount: 150,
};

type SimulatorTab = 'simulation' | 'community' | 'recommendations';

export const SimulatorPage: React.FC = () => {
  const { location, aqiData } = useAQI();

  const [activeTab, setActiveTab] = useState<SimulatorTab>('simulation');
  const [parameters, setParameters] = useState<SimulationParametersData>(DEFAULT_PARAMETERS);
  const [baseline, setBaseline] = useState<SimulationBaselineData | null>(null);
  const [results, setResults] = useState<SimulationResultsData | null>(null);
  const [presets, setPresets] = useState<ScenarioPresetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);

  // Modals state
  const [savedModalOpen, setSavedModalOpen] = useState<boolean>(false);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState<boolean>(false);

  const debounceTimerRef = useRef<any>(null);

  // 1. Initial Load: Presets & Baseline
  useEffect(() => {
    const initializeSimulator = async () => {
      try {
        setLoading(true);
        const [presetsRes, baselineRes] = await Promise.all([
          simulationService.getPresets(),
          simulationService.getBaseline(location.lat, location.lon, location.city),
        ]);

        if (presetsRes.success && presetsRes.presets) {
          setPresets(presetsRes.presets);
        }

        let baseData = baselineRes.baseline;
        if (!baseData && aqiData) {
          baseData = {
            city: location.city || 'Delhi',
            stationName: aqiData.location.name || location.name,
            coordinates: { lat: location.lat, lon: location.lon },
            currentAqi: aqiData.aqi,
            currentPm25: aqiData.pollutants.pm25,
            currentPm10: aqiData.pollutants.pm10,
            temperature: aqiData.weather.temperature,
            humidity: aqiData.weather.humidity,
            windSpeed: aqiData.weather.windSpeed,
            timestamp: new Date().toISOString(),
          };
        }
        setBaseline(baseData);

        // Initial calculation
        if (baseData) {
          const calcRes = await simulationService.calculateSimulation({
            parameters: DEFAULT_PARAMETERS,
            baseline: baseData,
          });
          if (calcRes.success && calcRes.results) {
            setResults(calcRes.results);
          }
        }
      } catch (err) {
        console.error('Error initializing simulator:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSimulator();
  }, [location]);

  // 2. Debounced Recalculation on Parameter Shifts
  const runCalculation = useCallback(
    async (newParams: SimulationParametersData) => {
      if (!baseline) return;
      try {
        setCalculating(true);
        const res = await simulationService.calculateSimulation({
          parameters: newParams,
          baseline,
        });
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Simulation calculation failed:', err);
      } finally {
        setCalculating(false);
      }
    },
    [baseline]
  );

  const handleParametersChange = (newParams: SimulationParametersData) => {
    setParameters(newParams);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      runCalculation(newParams);
    }, 250);
  };

  const handleApplyPreset = (preset: ScenarioPresetData) => {
    setParameters(preset.parameters);
    runCalculation(preset.parameters);
  };

  const handleReset = () => {
    const zeroParams: SimulationParametersData = {
      vehicleReductionPct: 0,
      publicTransitAdoptionPct: 0,
      evAdoptionPct: 0,
      householdsIndoorPurifiedCount: 0,
      treesPlantedCount: 0,
      constructionDustMitigationPct: 0,
      industrialEmissionReductionPct: 0,
      wasteBurningBanCompliancePct: 0,
      peakHourOutdoorAvoidancePct: 0,
      carpoolingHouseholdsCount: 0,
    };
    setParameters(zeroParams);
    runCalculation(zeroParams);
  };

  const handleApplyCommunityParams = (communityParams: Partial<SimulationParametersData>) => {
    const updated = {
      ...parameters,
      ...communityParams,
    };
    setParameters(updated);
    runCalculation(updated);
    setActiveTab('simulation');
  };

  const handleLoadSavedScenario = (saved: SavedScenarioData) => {
    setParameters(saved.parameters);
    runCalculation(saved.parameters);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                MODULE 10: WHAT-IF SIMULATOR
              </span>
              <span className="text-xs text-zinc-400 font-mono">TERI & CPCB Apportionment Grounded</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Sliders className="w-8 h-8 text-emerald-500" />
              What-if Air Pollution Simulator
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Explore hypothetical interventions in vehicle usage, public transit, dust mitigation, and community carpooling to forecast air quality shifts and personal pulmonary protection.
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setSavedModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved Scenarios
            </button>

            <button
              onClick={() => setMethodologyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              Physics Methodology
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
              title="Reset parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:text-zinc-400 border border-transparent dark:border-zinc-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Interactive Controls & Comparison
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:text-zinc-400 border border-transparent dark:border-zinc-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Community & Society Scale
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:text-zinc-400 border border-transparent dark:border-zinc-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            System Recommendations
          </button>
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-3" />
            <p className="text-sm">Connecting to atmospheric dispersion model & telemetry...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'simulation' && baseline && results && (
              <>
                <SimulationControlsCard
                  parameters={parameters}
                  presets={presets}
                  onParametersChange={handleParametersChange}
                  onApplyPreset={handleApplyPreset}
                  onReset={handleReset}
                  onSaveScenario={() => setSavedModalOpen(true)}
                  isCalculating={calculating}
                />

                <ScenarioComparisonView
                  baseline={baseline}
                  results={results}
                />

                <SimulationVisualAnalyticsCard
                  baseline={baseline}
                  results={results}
                />

                <AIScenarioAnalysisCard
                  baseline={baseline}
                  parameters={parameters}
                  results={results}
                />
              </>
            )}

            {activeTab === 'community' && (
              <CommunitySimulationCard
                onApplyCommunityParams={handleApplyCommunityParams}
              />
            )}

            {activeTab === 'recommendations' && baseline && (
              <SimulationRecommendationsCard
                baselineAqi={baseline.currentAqi}
                city={baseline.city}
                onApplyRecommendation={(recs) => {
                  const updated = { ...parameters, ...recs };
                  setParameters(updated);
                  runCalculation(updated);
                  setActiveTab('simulation');
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <SavedScenariosModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        currentParameters={parameters}
        onLoadScenario={handleLoadSavedScenario}
      />

      <ScientificMethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />
    </DashboardLayout>
  );
};
export default SimulatorPage;
