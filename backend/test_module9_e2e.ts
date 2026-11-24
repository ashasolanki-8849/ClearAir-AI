/**
 * ClearAir AI - Module 9: Environmental Impact Tracker & Intelligence
 * Comprehensive In-Memory E2E Test Suite
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

async function runE2ETests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING MODULE 9: ENVIRONMENTAL IMPACT TRACKER E2E');
  console.log('======================================================\n');

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

    // -------------------------------------------------------------
    // Test 1: Emission Factors Seeding & Verification
    // -------------------------------------------------------------
    console.log('Test 1: Seeding & Retrieving Official Authority Emission Factors...');
    const { seedEmissionFactors, getEmissionFactors } = await import('./src/services/emissionFactorService.js');
    await seedEmissionFactors();
    const factors = await getEmissionFactors();
    
    const electricityFactor = factors.find(f => f.category === 'electricity');
    const metroFactor = factors.find(f => f.category === 'transportation' && f.name.toLowerCase().includes('metro'));
    const petrolCarFactor = factors.find(f => f.category === 'transportation' && f.name.toLowerCase().includes('petrol'));
    const compostFactor = factors.find(f => f.category === 'waste' && f.name.toLowerCase().includes('composting'));

    if (!electricityFactor || electricityFactor.value !== 0.716) {
      throw new Error(`Expected CEA grid factor 0.716, got ${electricityFactor?.value}`);
    }
    if (!metroFactor || metroFactor.value !== 0.028) {
      throw new Error(`Expected DMRC metro factor 0.028, got ${metroFactor?.value}`);
    }
    if (!petrolCarFactor || petrolCarFactor.value !== 0.192) {
      throw new Error(`Expected Petrol Car factor 0.192, got ${petrolCarFactor?.value}`);
    }
    if (!compostFactor || compostFactor.value !== 0.52) {
      throw new Error(`Expected Composting factor 0.52, got ${compostFactor?.value}`);
    }
    console.log('✅ Test 1 Passed: Verified CEA v19 grid factor (0.716), DMRC (0.028), Petrol Car (0.192), Compost (0.52).\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 2: Transport Calculation & Disaggregated Criteria Pollutants
    // -------------------------------------------------------------
    console.log('Test 2: Transport Carbon & Tailpipe Criteria Pollutant Calculation...');
    const { calculateTransportFootprint, recordFootprintActivity } = await import('./src/services/carbonFootprintService.js');
    
    // 20 km solo car drive
    const carRes = await calculateTransportFootprint({
      transportMode: 'car',
      fuelType: 'petrol',
      distanceKm: 20,
      passengers: 1
    });

    const expectedCarCO2 = +(20 * 0.192).toFixed(3);
    if (Math.abs(carRes.calculatedEmissionsKgCO2e - expectedCarCO2) > 0.01) {
      throw new Error(`Expected Car CO2e ${expectedCarCO2}, got ${carRes.calculatedEmissionsKgCO2e}`);
    }
    if (!carRes.criteriaPollutantsGrams || carRes.criteriaPollutantsGrams.pm25 <= 0) {
      throw new Error('Expected positive criteria tailpipe PM2.5 in grams for petrol car');
    }
    await recordFootprintActivity(testUserId, carRes);

    // 20 km Metro ride
    const metroRes = await calculateTransportFootprint({
      transportMode: 'metro',
      distanceKm: 20,
      passengers: 1
    });
    const expectedMetroCO2 = +(20 * 0.028).toFixed(3);
    if (Math.abs(metroRes.calculatedEmissionsKgCO2e - expectedMetroCO2) > 0.01) {
      throw new Error(`Expected Metro CO2e ${expectedMetroCO2}, got ${metroRes.calculatedEmissionsKgCO2e}`);
    }
    await recordFootprintActivity(testUserId, metroRes);
    console.log(`✅ Test 2 Passed: 20km Car = ${carRes.calculatedEmissionsKgCO2e} kg CO2e, Metro = ${metroRes.calculatedEmissionsKgCO2e} kg CO2e (Saved ${(carRes.calculatedEmissionsKgCO2e - metroRes.calculatedEmissionsKgCO2e).toFixed(2)} kg CO2e).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 3: Electricity Grid Calculations (CEA v19 & Renewable Offset)
    // -------------------------------------------------------------
    console.log('Test 3: Grid Electricity Calculation (CEA Baseline Database v19)...');
    const { calculateElectricityFootprint } = await import('./src/services/carbonFootprintService.js');

    // 100 kWh with 0% renewable
    const gridRes = await calculateElectricityFootprint({
      kwh: 100,
      renewableShare: 0
    });
    if (Math.abs(gridRes.calculatedEmissionsKgCO2e - 71.6) > 0.1) {
      throw new Error(`Expected 71.6 kg CO2e for 100 kWh grid power, got ${gridRes.calculatedEmissionsKgCO2e}`);
    }
    await recordFootprintActivity(testUserId, gridRes);

    // 100 kWh with 40% rooftop solar
    const solarRes = await calculateElectricityFootprint({
      kwh: 100,
      renewableShare: 40
    });
    const expectedSolarCO2 = +(60 * 0.716).toFixed(3);
    if (Math.abs(solarRes.calculatedEmissionsKgCO2e - expectedSolarCO2) > 0.1) {
      throw new Error(`Expected ${expectedSolarCO2} kg CO2e with 40% solar, got ${solarRes.calculatedEmissionsKgCO2e}`);
    }
    console.log(`✅ Test 3 Passed: 100 kWh Grid = 71.6 kg CO2e; with 40% Solar = ${solarRes.calculatedEmissionsKgCO2e} kg CO2e.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 4: Waste Diversion & Avoided Emissions Calculation
    // -------------------------------------------------------------
    console.log('Test 4: Waste Diversion Ledger & Methane Avoidance...');
    const { calculateWasteFootprint } = await import('./src/services/carbonFootprintService.js');

    // 10 kg unsegregated landfill waste
    const landfillRes = await calculateWasteFootprint({
      wasteType: 'mixed_unsegregated',
      quantityKg: 10
    });
    if (Math.abs(landfillRes.calculatedEmissionsKgCO2e - 14.5) > 0.1) {
      throw new Error(`Expected 14.5 kg CO2e for 10kg landfill, got ${landfillRes.calculatedEmissionsKgCO2e}`);
    }
    await recordFootprintActivity(testUserId, landfillRes);

    // 10 kg organic composting (negative/avoided emissions)
    const compostRes = await calculateWasteFootprint({
      wasteType: 'organic_composted',
      quantityKg: 10
    });
    if (compostRes.calculatedEmissionsKgCO2e > 0 || Math.abs(compostRes.calculatedEmissionsKgCO2e - (-5.2)) > 0.1) {
      throw new Error(`Expected -5.2 kg CO2e for 10kg composting, got ${compostRes.calculatedEmissionsKgCO2e}`);
    }
    await recordFootprintActivity(testUserId, compostRes);
    console.log(`✅ Test 4 Passed: 10kg Landfill = +14.5 kg CO2e; 10kg Composting = ${compostRes.calculatedEmissionsKgCO2e} kg CO2e (Avoided Methane).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 5: Water Pumping Footprint
    // -------------------------------------------------------------
    console.log('Test 5: Water Supply Pumping Footprint...');
    const { calculateWaterFootprint } = await import('./src/services/carbonFootprintService.js');
    const waterRes = await calculateWaterFootprint({
      liters: 2000
    });
    if (Math.abs(waterRes.calculatedEmissionsKgCO2e - 0.70) > 0.05) {
      throw new Error(`Expected 0.70 kg CO2e for 2000 L, got ${waterRes.calculatedEmissionsKgCO2e}`);
    }
    await recordFootprintActivity(testUserId, waterRes);
    console.log(`✅ Test 5 Passed: 2000 L municipal water pumping = ${waterRes.calculatedEmissionsKgCO2e} kg CO2e.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 6: Environmental Activity Logger CRUD
    // -------------------------------------------------------------
    console.log('Test 6: Daily Environmental Activity Logger CRUD...');
    const { EnvironmentalActivity } = await import('./src/models/EnvironmentalActivity.js');
    const newAct = await EnvironmentalActivity.create({
      userId: new mongoose.Types.ObjectId(testUserId),
      activityName: 'Carpool with 3 colleagues',
      category: 'transportation',
      date: new Date(),
      quantity: 15,
      unit: 'km',
      isCompleted: true,
      dataQuality: {
        status: 'User Entered',
        source: 'ClearAir AI Logger'
      }
    });

    if (!newAct._id) throw new Error('Failed to create environmental activity');
    const fetchedAct = await EnvironmentalActivity.findById(newAct._id);
    if (!fetchedAct || fetchedAct.activityName !== 'Carpool with 3 colleagues') {
      throw new Error('Activity record retrieval failed');
    }
    console.log('✅ Test 6 Passed: Activity logged, validated, and persisted in database.\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 7: Period-over-Period Environmental Comparison
    // -------------------------------------------------------------
    console.log('Test 7: Period Comparison Analytics...');
    const { getComparisonAnalytics } = await import('./src/services/environmentalAnalyticsService.js');
    const now = new Date();
    const period1 = {
      start: new Date(now.getTime() - 30 * 86400000).toISOString(),
      end: new Date(now.getTime() - 15 * 86400000).toISOString(),
      label: 'Prior Period'
    };
    const period2 = {
      start: new Date(now.getTime() - 14 * 86400000).toISOString(),
      end: now.toISOString(),
      label: 'Current Period'
    };

    const comparison = await getComparisonAnalytics(testUserId, period1, period2);
    if (!comparison.period1 || !comparison.period2 || !comparison.differences) {
      throw new Error('Comparison analytics structure incomplete');
    }
    console.log(`✅ Test 7 Passed: Comparison generated. Differences tracked for total, transport, energy, waste.\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 8: Environmental Goals Benchmark & Progress Tracking
    // -------------------------------------------------------------
    console.log('Test 8: Environmental Goals Benchmark Tracking...');
    const { createGoal, updateGoalProgress } = await import('./src/services/environmentalGoalService.js');
    const goal = await createGoal(testUserId, {
      title: 'Reduce monthly commute emissions',
      category: 'transportation',
      targetValue: 50,
      unit: 'km',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      notes: 'Focus on taking metro during high AQI mornings'
    });

    const updatedGoal = await updateGoalProgress(goal._id.toString(), 20);
    if (!updatedGoal || updatedGoal.currentValue !== 20) {
      throw new Error(`Expected goal currentValue 20, got ${updatedGoal?.currentValue}`);
    }
    console.log(`✅ Test 8 Passed: Goal created, progress incremented (20 / 50 km).\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 9: Environmental Audit Report & CSV Compilation
    // -------------------------------------------------------------
    console.log('Test 9: Environmental Audit Statement & CSV Export...');
    const { generateEnvironmentalReport, generateCsvExport } = await import('./src/services/environmentalReportService.js');
    const report = await generateEnvironmentalReport(testUserId, 'comprehensive_audit', 'this_month');

    if (!report._id || !report.reportData) {
      throw new Error('Audit report failed to generate structured document');
    }

    const csvContent = generateCsvExport(report);
    if (!csvContent || !csvContent.includes('Category') || !csvContent.includes('CO2e')) {
      throw new Error('CSV export did not generate valid RFC-compliant tabular output');
    }
    console.log('✅ Test 9 Passed: Environmental statement and CSV ledger compiled successfully.\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 10: Scientific Boundary Distinction & AI Advisor Co-Pilot
    // -------------------------------------------------------------
    console.log('Test 10: Scientific Boundary Checks & AI Advisor...');
    const { getLocalAirPollutionAwareness } = await import('./src/services/environmentalAnalyticsService.js');
    const { getImpactAIAdvice } = await import('./src/services/environmentalAdvisorService.js');

    const awareness = await getLocalAirPollutionAwareness(28.6139, 77.2090, 'Delhi');
    if (!awareness.scientificBoundaryNote || !awareness.currentAqi) {
      throw new Error('Local pollution awareness did not include required scientific boundary note');
    }

    const advice = await getImpactAIAdvice(testUserId, 'How does Metro reduce tailpipe PM2.5 compared to a car in winter smog?');
    if (!advice.summary || !advice.key_findings || advice.key_findings.length === 0) {
      throw new Error('AI Advisor failed to generate structured response schema');
    }
    console.log('✅ Test 10 Passed: Scientific boundary distinction confirmed & AI co-pilot schema validated.\n');
    passedTests++;

    console.log('======================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED FOR MODULE 9`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
      console.log('Stopped in-memory MongoDB instance.');
    }
  }
}

runE2ETests();
