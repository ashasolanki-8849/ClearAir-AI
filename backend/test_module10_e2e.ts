/**
 * ClearAir AI - Module 10: What-if Pollution Simulator
 * Comprehensive In-Memory E2E Test Suite
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

async function runE2ETests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING MODULE 10: WHAT-IF POLLUTION SIMULATOR E2E TEST SUITE');
  console.log('================================================================\n');

  let mongod: MongoMemoryServer | null = null;
  let passedTests = 0;
  const totalTests = 10;
  const testUserId = new mongoose.Types.ObjectId().toString();

  try {
    console.log('Spinning up in-memory MongoDB instance for pristine isolated test harness...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB successfully.\n');

    const {
      runSimulationCalculation,
      getSimulationBaseline,
      calculatePm25SubIndex,
      calculatePm10SubIndex,
      getAqiCategory,
    } = await import('./src/services/simulationEngineService.js');

    const {
      getSimulationPresets,
      getSimulationRecommendations,
      saveSimulationScenario,
      getSavedScenariosByUser,
      getSimulationById,
      updateSavedScenario,
      deleteSavedScenario,
      compareMultipleScenarios,
    } = await import('./src/services/simulationScenarioService.js');

    const { generateAIScenarioAnalysis } = await import('./src/services/simulationAdvisorService.js');

    // -------------------------------------------------------------
    // Test 1: Baseline Telemetry Retrieval
    // -------------------------------------------------------------
    console.log('Test 1: Retrieving Live / Simulated Baseline Environmental Telemetry...');
    const baseline = await getSimulationBaseline(28.6139, 77.2090, 'Delhi');
    if (!baseline || !baseline.currentAqi || baseline.currentPm25 <= 0) {
      throw new Error(`Failed to retrieve baseline telemetry: ${JSON.stringify(baseline)}`);
    }
    console.log(`✅ Test 1 Passed: Retrieved baseline for ${baseline.city} - AQI: ${baseline.currentAqi}, PM2.5: ${baseline.currentPm25} µg/m³, PM10: ${baseline.currentPm10} µg/m³.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 2: Physics-Informed NAAQS Sub-Index Calculation
    // -------------------------------------------------------------
    console.log('Test 2: Validating Indian CPCB NAAQS AQI Sub-Index Piecewise Equations...');
    // PM2.5 breakpoints: 0-30 -> 0-50, 31-60 -> 51-100, 61-90 -> 101-200, 91-120 -> 201-300, 121-250 -> 301-400
    const subIdx30 = calculatePm25SubIndex(30);
    const subIdx60 = calculatePm25SubIndex(60);
    const subIdx120 = calculatePm25SubIndex(120);
    const subIdx250 = calculatePm25SubIndex(250);

    if (Math.round(subIdx30) !== 50 || Math.round(subIdx60) !== 100 || Math.round(subIdx120) !== 300 || Math.round(subIdx250) !== 400) {
      throw new Error(`NAAQS PM2.5 sub-index mismatch: 30->${subIdx30}, 60->${subIdx60}, 120->${subIdx120}, 250->${subIdx250}`);
    }

    const catSevere = getAqiCategory(420);
    const catGood = getAqiCategory(45);
    if (catSevere.category !== 'Severe' || catGood.category !== 'Good') {
      throw new Error(`AQI Category mapping error: 420->${catSevere.category}, 45->${catGood.category}`);
    }
    console.log('✅ Test 2 Passed: CPCB NAAQS breakpoints & categories verified with 100% mathematical fidelity.\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 3: Zero-Lever Null Dispersion Test
    // -------------------------------------------------------------
    console.log('Test 3: Zero-Action Null Dispersion Baseline Test...');
    const zeroParams = {
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

    const nullRun = runSimulationCalculation(baseline, zeroParams);
    if (nullRun.results.aqiChange !== 0 || nullRun.results.pm25ReductionPct !== 0) {
      throw new Error(`Expected zero aqiChange for null levers, got ${nullRun.results.aqiChange}`);
    }
    console.log(`✅ Test 3 Passed: Zero levers yield identical baseline state (Simulated AQI: ${nullRun.results.simulatedAqi}, Change: 0).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 4: Fractional Source Apportionment Verification
    // -------------------------------------------------------------
    console.log('Test 4: Fractional Source Apportionment (Transport, Dust, Waste, Industrial)...');
    // Test pure 50% vehicle reduction
    const transportRun = runSimulationCalculation(baseline, {
      ...zeroParams,
      vehicleReductionPct: 50,
    });
    // Transport share is 28% of PM2.5; combined transport factor for 50% vehicle cut is 50 * 0.70 = 35% reduction in transport sector
    // Expected PM2.5 reduction = 28% * 35% = 9.8% of current PM2.5
    if (transportRun.results.pm25ReductionPct <= 0 || transportRun.results.simulatedPm25 >= baseline.currentPm25) {
      throw new Error('Vehicular reduction did not decrease simulated PM2.5');
    }
    if (transportRun.results.tailpipeEmissionsAvoidedKgCO2e <= 0 || transportRun.results.tailpipePm25AvoidedGrams <= 0) {
      throw new Error('Vehicular reduction did not calculate positive avoided emissions');
    }
    console.log(`✅ Test 4 Passed: 50% vehicle cut yields -${transportRun.results.pm25ReductionPct}% PM2.5 and avoids ${transportRun.results.tailpipeEmissionsAvoidedKgCO2e} kg CO2e / day.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 5: Pulmonary Inhaled Dose Avoidance Modeling
    // -------------------------------------------------------------
    console.log('Test 5: Micro-Environment Pulmonary Dose & Activity Shift Modeling...');
    const inversionRun = runSimulationCalculation(baseline, {
      ...zeroParams,
      peakHourOutdoorAvoidancePct: 80,
      householdsIndoorPurifiedCount: 200,
    });
    if (inversionRun.results.personalInhaledDoseAvoidedGrams <= 0) {
      throw new Error('Personal avoided inhaled dose must be greater than zero when peak outdoor exercise is avoided');
    }
    console.log(`✅ Test 5 Passed: Peak inversion avoidance + indoor filtration saves ${inversionRun.results.personalInhaledDoseAvoidedGrams} g inhaled PM2.5 per commuter.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 6: Presets Library Retrieval
    // -------------------------------------------------------------
    console.log('Test 6: Retrieving Pre-configured Policy Presets...');
    const presets = getSimulationPresets();
    if (!presets || presets.length < 5) {
      throw new Error(`Expected at least 5 presets, got ${presets?.length}`);
    }
    const cleanCommute = presets.find((p) => p.id === 'clean_commute_surge');
    const zeroBurn = presets.find((p) => p.id === 'society_zero_burn_carpool');
    if (!cleanCommute || !zeroBurn) {
      throw new Error('Core presets clean_commute_surge or society_zero_burn_carpool missing');
    }
    console.log(`✅ Test 6 Passed: Retrieved ${presets.length} presets (${presets.map((p) => p.name).join(', ')}).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 7: 4-Tier Recommendation Engine
    // -------------------------------------------------------------
    console.log('Test 7: Evaluating 4-Tier Policy Recommendation Engine...');
    const recommendations = await getSimulationRecommendations(baseline.currentAqi, baseline.city);
    if (
      !recommendations.bestAchievable ||
      !recommendations.mostPractical ||
      !recommendations.lowestEffort ||
      !recommendations.highestHealthBenefit
    ) {
      throw new Error('Recommendation pathways missing required 4-tier structure');
    }
    if (recommendations.bestAchievable.estimatedAqiReduction <= recommendations.lowestEffort.estimatedAqiReduction) {
      throw new Error('Best Achievable reduction must exceed lowest effort reduction');
    }
    console.log(`✅ Test 7 Passed: 4 pathways generated (Best: -${recommendations.bestAchievable.estimatedAqiReduction} AQI, Practical: -${recommendations.mostPractical.estimatedAqiReduction} AQI, Lowest Effort: -${recommendations.lowestEffort.estimatedAqiReduction} AQI, Health: -${recommendations.highestHealthBenefit.estimatedAqiReduction} AQI).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 8: Deterministic Rule Fallback AI Analysis
    // -------------------------------------------------------------
    console.log('Test 8: AI Scenario Analysis (Structured JSON & Fallback Verification)...');
    const aiAnalysis = await generateAIScenarioAnalysis(
      baseline,
      presets[0].parameters,
      transportRun.results
    );
    if (!aiAnalysis || !aiAnalysis.whatChanges || !aiAnalysis.whyPollutionChanges) {
      throw new Error('AI analysis missing fundamental scientific fields');
    }
    if (!Array.isArray(aiAnalysis.pollutantsAffected) || !Array.isArray(aiAnalysis.limitations) || !Array.isArray(aiAnalysis.practicalActions)) {
      throw new Error('AI analysis array fields must be valid arrays');
    }
    console.log(`✅ Test 8 Passed: AI Analysis generated successfully [Confidence: ${aiAnalysis.confidenceLevel}, Affected: ${aiAnalysis.pollutantsAffected.join(', ')}].\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 9: Scenario Persistence (Save, Retrieve, Update)
    // -------------------------------------------------------------
    console.log('Test 9: Scenario Persistence (Saving & Updating in MongoDB)...');
    const saved = await saveSimulationScenario(testUserId, {
      name: 'South Delhi Metro and EV Surge Scenario',
      scenarioType: 'transport_shift',
      description: 'E2E Test scenario modeling aggressive electric transition in South Delhi',
      parameters: presets[0].parameters,
      tags: ['test', 'e2e', 'transport'],
    });

    if (!saved || !saved._id) {
      throw new Error('Failed to save simulation scenario to database');
    }

    const userScenarios = await getSavedScenariosByUser(testUserId);
    if (userScenarios.length !== 1 || userScenarios[0]._id.toString() !== saved._id.toString()) {
      throw new Error('Failed to retrieve saved user scenarios');
    }

    const updated = await updateSavedScenario(saved._id.toString(), testUserId, {
      name: 'South Delhi Metro and EV Surge - Renovated',
      tags: ['test', 'e2e', 'renovated'],
    });
    if (!updated || updated.name !== 'South Delhi Metro and EV Surge - Renovated') {
      throw new Error('Failed to update saved simulation scenario');
    }
    console.log(`✅ Test 9 Passed: Scenario saved (${saved._id}), retrieved, and updated successfully.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 10: Multi-Scenario Comparison & Deletion
    // -------------------------------------------------------------
    console.log('Test 10: Multi-Scenario Comparison & Clean Deletion...');
    const secondScenario = await saveSimulationScenario(testUserId, {
      name: 'RWA Society Zero Waste Burn',
      scenarioType: 'carpooling_society',
      parameters: presets[1].parameters,
      tags: ['rwa', 'compost'],
    });

    const comparisonList = await compareMultipleScenarios([
      saved._id.toString(),
      secondScenario._id.toString(),
    ]);

    if (comparisonList.length !== 2) {
      throw new Error(`Expected 2 scenarios compared, got ${comparisonList.length}`);
    }

    // Delete both scenarios
    const del1 = await deleteSavedScenario(saved._id.toString(), testUserId);
    const del2 = await deleteSavedScenario(secondScenario._id.toString(), testUserId);
    if (!del1 || !del2) {
      throw new Error('Failed to delete scenarios');
    }

    const postDelScenarios = await getSavedScenariosByUser(testUserId);
    if (postDelScenarios.length !== 0) {
      throw new Error('Expected 0 scenarios after deletion');
    }
    console.log('✅ Test 10 Passed: Side-by-side comparison evaluated 2 scenarios and cleaned up successfully.\n');
    passedTests++;

    console.log('================================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} MODULE 10 E2E TESTS PASSED WITH 100% INTEGRITY!`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ E2E TEST FAILED:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runE2ETests();
