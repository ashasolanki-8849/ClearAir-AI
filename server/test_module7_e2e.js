import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB, disconnectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/authRoutes';
import airQualityRoutes from './src/routes/airQualityRoutes';
import sustainabilityRoutes from './src/routes/sustainabilityRoutes';

dotenv.config();

async function runModule7Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 7: SUSTAINABLE LIVING ADVISOR');
  console.log('   FULL END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/air-quality', airQualityRoutes);
  app.use('/api/sustainability', sustainabilityRoutes);
  app.use(errorHandler);

  const testPort = 5060;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering eco-conscious test user...');
    const userPayload = {
      fullName: 'Aarav Sharma Sustainability',
      email: `aarav_sustain_${Date.now()}@clearair.test`,
      password: 'SecurePassword123!',
      city: 'Delhi',
      role: 'user',
    };

    const regRes = await axios.post(`${baseUrl}/auth/register`, userPayload);
    if (!regRes.data?.success || !regRes.data?.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }
    const token = regRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log(`✅ [TEST 1 PASSED] User registered with token: ${token.substring(0, 16)}...`);

    // -------------------------------------------------------------
    // TEST 2: Sustainability Profile & Transparent Score
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing User Sustainability Profile & Transparent Score...');
    const profRes = await axios.get(`${baseUrl}/sustainability/profile`, { headers: authHeaders });
    if (!profRes.data?.success || !profRes.data.profile) {
      throw new Error(`Get profile failed: ${JSON.stringify(profRes.data)}`);
    }
    const profile = profRes.data.profile;
    const score = profile.sustainabilityScore;
    if (typeof score.overall !== 'number' || score.overall < 0 || score.overall > 100) {
      throw new Error(`Invalid sustainability score: ${JSON.stringify(score)}`);
    }
    console.log(`✅ [TEST 2 PASSED] Sustainability Score: ${score.overall}/100.`);
    console.log(`   Breakdown: Actions=${score.actionCompletionScore}/40, Challenges=${score.challengeScore}/25, Breadth=${score.diversityScore}/20, Household=${score.householdScore}/15`);
    console.log(`   Formula: "${score.calculationExplanation.substring(0, 70)}..."`);

    // -------------------------------------------------------------
    // TEST 3: Prioritized Recommendations Across 7 Categories
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Prioritized Recommendations Across 7 Categories...');
    const recsRes = await axios.get(`${baseUrl}/sustainability/recommendations`, { headers: authHeaders });
    if (!recsRes.data?.success || !Array.isArray(recsRes.data.recommendations)) {
      throw new Error(`Recommendations failed: ${JSON.stringify(recsRes.data)}`);
    }
    const recs = recsRes.data.recommendations;
    if (recs.length === 0) {
      throw new Error('No recommendations generated');
    }
    const sampleRec = recs[0];
    if (!sampleRec.currentHabit || !sampleRec.recommendedAlternative || !sampleRec.personalBenefit || !sampleRec.environmentalBenefit) {
      throw new Error(`Incomplete recommendation structure: ${JSON.stringify(sampleRec)}`);
    }
    console.log(`✅ [TEST 3 PASSED] Retrieved ${recs.length} verified recommendations.`);
    console.log(`   Top Action (${sampleRec.priority.toUpperCase()} - ${sampleRec.category}): "${sampleRec.recommendedAlternative}"`);
    console.log(`   Replaces: "${sampleRec.currentHabit}"`);
    console.log(`   Personal Benefit: "${sampleRec.personalBenefit.substring(0, 50)}..."`);
    console.log(`   Environmental Benefit: "${sampleRec.environmentalBenefit.substring(0, 50)}..."`);

    // -------------------------------------------------------------
    // TEST 4: Action Status Update & Score Recalculation
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Action Status Update & Score Recalculation...');
    const actionRes = await axios.patch(
      `${baseUrl}/sustainability/recommendations/${sampleRec._id}/status`,
      { status: 'completed', notes: 'Adopted in household routine' },
      { headers: authHeaders }
    );
    if (!actionRes.data?.success || !actionRes.data.action) {
      throw new Error(`Action status update failed: ${JSON.stringify(actionRes.data)}`);
    }
    console.log(`✅ [TEST 4 PASSED] Action updated to status: "${actionRes.data.action.status}".`);
    console.log(`   Recalculated Score: ${actionRes.data.sustainabilityScore?.overall}/100`);

    // -------------------------------------------------------------
    // TEST 5: Budget-Based Alternatives Filtering
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Budget-Based Alternatives Filtering...');
    const freeRes = await axios.get(`${baseUrl}/sustainability/alternatives?budget=free`);
    const lowCostRes = await axios.get(`${baseUrl}/sustainability/alternatives?budget=low_cost`);
    if (!freeRes.data?.success || !lowCostRes.data?.success) {
      throw new Error(`Budget alternatives failed: ${JSON.stringify(freeRes.data)}`);
    }
    console.log(`✅ [TEST 5 PASSED] Free Alternatives: ${freeRes.data.count} items, Low-Cost (<₹500): ${lowCostRes.data.count} items.`);
    if (freeRes.data.alternatives.length > 0) {
      const freeItem = freeRes.data.alternatives[0];
      console.log(`   Sample Free: "${freeItem.suggestedReplacement}" (Citation: ${freeItem.citation})`);
    }

    // -------------------------------------------------------------
    // TEST 6: Local Sustainable Solutions ("Solutions Around Me")
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Local Sustainable Solutions ("Solutions Available Around Me")...');
    const localRes = await axios.get(`${baseUrl}/sustainability/local-solutions?lat=28.6139&lon=77.2090`);
    if (!localRes.data?.success || !Array.isArray(localRes.data.facilities)) {
      throw new Error(`Local solutions failed: ${JSON.stringify(localRes.data)}`);
    }
    const facilities = localRes.data.facilities;
    console.log(`✅ [TEST 6 PASSED] Found ${facilities.length} verified environmental facilities.`);
    if (facilities.length > 0) {
      const f1 = facilities[0];
      console.log(`   Closest Hub: "${f1.name}" (${f1.categoryLabel}) - Distance: ~${f1.distanceKm} km`);
      console.log(`   Verification: ${f1.verificationSource}`);
    }

    // -------------------------------------------------------------
    // TEST 7: AI Sustainable Lifestyle Advisor
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing AI Sustainable Lifestyle Advisor (Structured JSON)...');
    const advisorRes = await axios.post(
      `${baseUrl}/sustainability/assistant/chat`,
      {
        message: 'How can I reduce electricity consumption from my air conditioner without losing comfort?',
        context: {
          locationName: 'Delhi',
          currentAqi: 240,
          dominantPollutant: 'PM2.5',
          temperature: 32,
          humidity: 70,
        },
      },
      { headers: authHeaders }
    );
    if (!advisorRes.data?.success || !advisorRes.data.advice) {
      throw new Error(`AI advisor failed: ${JSON.stringify(advisorRes.data)}`);
    }
    const adv = advisorRes.data.advice;
    if (!adv.summary || !adv.recommended_alternative || !adv.personal_benefit || !adv.environmental_benefit) {
      throw new Error(`AI advice missing schema fields: ${JSON.stringify(adv)}`);
    }
    console.log(`✅ [TEST 7 PASSED] AI Advisor Engine: ${advisorRes.data.source}`);
    console.log(`   Summary: "${adv.summary}"`);
    console.log(`   Recommended Alternative: "${adv.recommended_alternative}"`);
    console.log(`   Personal Benefit: "${adv.personal_benefit}"`);
    console.log(`   Cost Category: ${adv.cost_category.toUpperCase()}`);

    // -------------------------------------------------------------
    // TEST 8: Environmental Impact Calculator (CEA / IPCC Factors)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing Environmental Impact Calculator with Documented Conversion Factors...');
    // Electricity saving test: 30 kWh
    const impactRes = await axios.post(
      `${baseUrl}/sustainability/impact/calculate`,
      {
        activityType: 'electricity_saving',
        quantity: 30,
        unit: 'kWh',
        period: 'daily',
        description: 'Set AC thermostat to 24°C',
      },
      { headers: authHeaders }
    );
    if (!impactRes.data?.success || !impactRes.data.impact) {
      throw new Error(`Impact calculation failed: ${JSON.stringify(impactRes.data)}`);
    }
    const imp = impactRes.data.impact;
    // 30 kWh * 0.716 kg CO2e/kWh = 21.48 kg CO2e
    console.log(`✅ [TEST 8 PASSED] Calculated 30 kWh electricity savings:`);
    console.log(`   CO2e Avoided: ${imp.calculatedValues.co2EquivalentKg} kg CO2e`);
    console.log(`   Methodology: "${imp.calculationMethod}"`);
    console.log(`   Emission Factor: ${imp.emissionFactor.factor} ${imp.emissionFactor.unit} (${imp.emissionFactor.citation})`);

    // Insufficient data test
    const missingRes = await axios.post(
      `${baseUrl}/sustainability/impact/calculate`,
      {
        activityType: 'electricity_saving',
        quantity: 0,
        unit: 'kWh',
      },
      { headers: authHeaders }
    );
    if (missingRes.data.impact.dataConfidence !== 'insufficient_data') {
      throw new Error(`Expected insufficient_data status for zero input`);
    }
    console.log(`   Zero input handling verified: "${missingRes.data.impact.insufficientDataReason}"`);

    // Summary test
    const summaryRes = await axios.get(`${baseUrl}/sustainability/impact/summary`, { headers: authHeaders });
    if (!summaryRes.data?.success) {
      throw new Error(`Impact summary failed: ${JSON.stringify(summaryRes.data)}`);
    }
    console.log(`   Total User Avoided CO2e: ${summaryRes.data.summary.totalCo2EquivalentKg} kg (Equivalent trees: ${summaryRes.data.summary.equivalentTreesOffset})`);

    // -------------------------------------------------------------
    // TEST 9: 7-Day Sustainable Living Challenge
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing 7-Day Sustainable Living Challenge...');
    const startChalRes = await axios.post(`${baseUrl}/sustainability/challenges/start`, {}, { headers: authHeaders });
    if (!startChalRes.data?.success || !startChalRes.data.progress) {
      throw new Error(`Start challenge failed: ${JSON.stringify(startChalRes.data)}`);
    }
    const chalProgress = startChalRes.data.progress;
    console.log(`   Challenge Started: "${chalProgress.challengeTitle}" (${chalProgress.totalDays} Days)`);

    // Mark Day 1 complete
    const day1Res = await axios.patch(
      `${baseUrl}/sustainability/challenges/current/progress`,
      { dayNumber: 1, isCompleted: true },
      { headers: authHeaders }
    );
    if (!day1Res.data?.success || day1Res.data.progress.completedDaysCount < 1) {
      throw new Error(`Challenge progress update failed: ${JSON.stringify(day1Res.data)}`);
    }
    console.log(`✅ [TEST 9 PASSED] Day 1 marked complete. Total completed days: ${day1Res.data.progress.completedDaysCount}/7`);

    // -------------------------------------------------------------
    // TEST 10: Household Sustainability & Before-After Comparisons
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Household Sustainability & Lifestyle Comparisons...');
    const houseRes = await axios.get(`${baseUrl}/sustainability/household`, { headers: authHeaders });
    if (!houseRes.data?.success || !houseRes.data.household) {
      throw new Error(`Household data failed: ${JSON.stringify(houseRes.data)}`);
    }
    const house = houseRes.data.household;
    console.log(`   Household: "${house.householdName}" (${house.memberCount} members)`);
    console.log(`   Segregation Rate: ${house.wasteManagement.segregationRatePercentage}%, LED: ${house.energySavingProgress.ledPercentage}%`);

    // Add household goal
    const newGoalRes = await axios.post(
      `${baseUrl}/sustainability/household/goals`,
      {
        title: 'Zero Plastic Vegetable Shopping',
        category: 'shopping',
        targetDescription: 'Carry cotton totes on all neighborhood vegetable runs',
      },
      { headers: authHeaders }
    );
    if (!newGoalRes.data?.success) {
      throw new Error(`Add goal failed: ${JSON.stringify(newGoalRes.data)}`);
    }
    console.log(`   New Household Goal Added. Total Goals: ${newGoalRes.data.household.sharedGoals.length}`);

    // Comparisons
    const compRes = await axios.get(`${baseUrl}/sustainability/comparison`, { headers: authHeaders });
    if (!compRes.data?.success || !Array.isArray(compRes.data.comparisons)) {
      throw new Error(`Comparisons failed: ${JSON.stringify(compRes.data)}`);
    }
    console.log(`✅ [TEST 10 PASSED] Retrieved ${compRes.data.comparisons.length} before-and-after lifestyle models.`);
    console.log(`   Overall Potential Monthly CO2e Avoidance: ~${compRes.data.overallMonthlyCo2SavedKg} kg CO2e / month`);
    console.log(`   Overall Potential Financial Savings: ~₹${compRes.data.overallMonthlyMoneySavedInr} / month`);

    console.log('\n================================================================');
    console.log('🎉 ALL 10 MODULE 7 END-TO-END VERIFICATION TESTS PASSED!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ MODULE 7 TEST SUITE FAILED:', err.message);
    if (err.response?.data) {
      console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
    }
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('[Test Server] Ephemeral test server closed.');
  }
}

runModule7Tests();
