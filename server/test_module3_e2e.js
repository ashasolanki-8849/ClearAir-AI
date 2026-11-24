import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import airQualityRoutes from './src/routes/airQualityRoutes';
import locationRoutes from './src/routes/locationRoutes';
import alertRoutes from './src/routes/alertRoutes';
import assistantRoutes from './src/routes/assistantRoutes';
import dailyPlannerRoutes from './src/routes/dailyPlannerRoutes';
import { LifestyleProfile } from './src/models/LifestyleProfile';
import { DailyPlan } from './src/models/DailyPlan';
import { FamilyProfile } from './src/models/FamilyProfile';
import { PlannerReminder } from './src/models/PlannerReminder';
import { recalculatePlanWithLiveAQI } from './src/services/scheduleAdjustmentService';

dotenv.config();

async function runModule3Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 3: PERSONALIZED DAILY ACTION PLANNER E2E TESTS');
  console.log('================================================================');

  // 1. Start ephemeral express server
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/air-quality', airQualityRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/planner', dailyPlannerRoutes);
  app.use(errorHandler);

  const testPort = 5056;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering test user with professional persona...');
    const userEmail = `planner.pilot.${Date.now()}@clearair.test`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram Mehta',
        email: userEmail,
        password: 'Password@123',
        ageGroup: '18_35',
        userCategory: 'professional',
        city: 'New Delhi',
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.token;
    console.log(`✅ Registered user: ${regData.user.fullName} (${regData.user.email})`);

    // -------------------------------------------------------------
    // TEST 2: Lifestyle Profile Configuration & Retrieval
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Configuring user lifestyle preferences (/api/planner/lifestyle)...');
    const updateLifestyleRes = await fetch(`${baseUrl}/planner/lifestyle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userCategory: 'professional',
        schedule: {
          wakeUpTime: '06:15',
          sleepTime: '23:00',
          workOrSchoolStart: '09:00',
          workOrSchoolEnd: '18:00',
          exerciseTime: '06:45',
          mealTimings: {
            breakfast: '08:00',
            lunch: '13:00',
            dinner: '20:30',
          },
          travelTimings: {
            commuteStart: '08:15',
            commuteReturn: '18:15',
          },
        },
        activityPreferences: ['morning_walk', 'cycling', 'yoga'],
        transportationPreferences: ['public_transport', 'metro', 'walking'],
        healthVulnerabilities: ['respiratory_sensitivity', 'children_at_home', 'elderly_at_home'],
      }),
    });

    const lifestyleData = await updateLifestyleRes.json();
    if (!lifestyleData.success || !lifestyleData.profile) {
      throw new Error(`Lifestyle update failed: ${JSON.stringify(lifestyleData)}`);
    }
    console.log(`✅ Lifestyle updated: Wake ${lifestyleData.profile.schedule.wakeUpTime}, Category: ${lifestyleData.profile.userCategory}`);

    // Verify GET endpoint
    const getLifestyleRes = await fetch(`${baseUrl}/planner/lifestyle`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchedLifestyle = await getLifestyleRes.json();
    if (!fetchedLifestyle.success || fetchedLifestyle.profile.schedule.wakeUpTime !== '06:15') {
      throw new Error('GET lifestyle verification failed');
    }
    console.log('✅ GET /api/planner/lifestyle verified');

    // -------------------------------------------------------------
    // TEST 3: Generate Today\'s Diurnal 5-Period Schedule
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Generating 5-period diurnal action plan grounded in live CPCB telemetry (/api/planner/today)...');
    const todayPlanRes = await fetch(
      `${baseUrl}/planner/today?lat=28.6139&lon=77.2090&name=Connaught+Place&city=New+Delhi&language=en`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const planData = await todayPlanRes.json();
    if (!planData.success || !planData.plan) {
      throw new Error(`Plan generation failed: ${JSON.stringify(planData)}`);
    }

    const plan = planData.plan;
    console.log(`✅ Today's Plan ID: ${plan._id}, Date: ${plan.date}, Base AQI: ${plan.lastCalculatedAQI}`);
    console.log(`✅ Total Activities: ${plan.activities.length}`);

    // Verify 5 distinct diurnal periods
    const periods = plan.activities.map((a) => a.period);
    console.log(`   Generated Periods: ${periods.join(', ')}`);
    const expectedPeriods = ['early_morning', 'morning', 'afternoon', 'evening', 'night'];
    for (const ep of expectedPeriods) {
      if (!periods.includes(ep)) {
        throw new Error(`Missing expected diurnal period: ${ep}`);
      }
    }
    console.log('✅ All 5 diurnal periods verified: Early Morning, Morning, Afternoon, Evening, Night');

    // Verify Impact Engine presence (Personal vs Environmental impact)
    const firstActivity = plan.activities[0];
    if (!firstActivity.personalBenefit || !firstActivity.environmentalBenefit) {
      throw new Error('Activity missing Impact Engine metrics (benefit vs impact)');
    }
    console.log(`✅ Activity Impact Engine Verified:`);
    console.log(`   - Activity: "${firstActivity.activity}" (${firstActivity.indoorOutdoor})`);
    console.log(`   - Personal Benefit: "${firstActivity.personalBenefit}"`);
    console.log(`   - Environmental Benefit: "${firstActivity.environmentalBenefit}"`);
    console.log(`   - Alternative: "${firstActivity.alternativeActivity}"`);

    // -------------------------------------------------------------
    // TEST 4: Activity Status Toggle & Completion Tracking
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Toggling activity status and verifying completion rate (/api/planner/activity/:id/status)...');
    const toggleRes = await fetch(`${baseUrl}/planner/activity/${firstActivity.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'completed',
        planId: plan._id,
      }),
    });
    const toggleData = await toggleRes.json();
    if (!toggleData.success || toggleData.completionPercentage === 0) {
      throw new Error(`Status toggle failed: ${JSON.stringify(toggleData)}`);
    }
    console.log(`✅ Activity marked completed! New Completion: ${toggleData.completionPercentage}% (${toggleData.plan.completionPercentage}%)`);

    // -------------------------------------------------------------
    // TEST 5: One-Click Alternative Activity Swap
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing one-click alternative activity swap (/api/planner/activity/:id/swap)...');
    const secondActivity = plan.activities[1];
    const originalName = secondActivity.activity;
    const alternativeName = secondActivity.alternativeActivity;

    const swapRes = await fetch(`${baseUrl}/planner/activity/${secondActivity.id}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId: plan._id }),
    });
    const swapData = await swapRes.json();
    if (!swapData.success) {
      throw new Error(`Activity swap failed: ${JSON.stringify(swapData)}`);
    }
    const swappedActivity = swapData.plan.activities.find((a) => a.id === secondActivity.id);
    console.log(`✅ Swapped: "${originalName}" ➔ "${swappedActivity.activity}" (${swappedActivity.indoorOutdoor})`);
    if (swappedActivity.activity !== alternativeName) {
      throw new Error(`Expected activity to become ${alternativeName}, got ${swappedActivity.activity}`);
    }

    // -------------------------------------------------------------
    // TEST 6: Dynamic AQI Adjustment Simulation (Smog Spike Protection)
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing dynamic schedule adjustment engine under severe AQI spike...');
    // Create a mock outdoor activity in the plan
    const mockOutdoorActivity = {
      id: 'mock_outdoor_1',
      period: 'evening',
      periodLabel: 'Evening (16:30 - 20:30)',
      activity: 'Outdoor Jogging at Park',
      recommendedTime: '18:00 - 19:00',
      indoorOutdoor: 'outdoor',
      pollutionRisk: 'moderate',
      reason: 'Evening leisure jog',
      alternativeActivity: 'Indoor Treadmill or Core Workout',
      expectedBenefit: 'Aerobic fitness',
      personalBenefit: 'Standard aerobic activity',
      environmentalBenefit: 'Zero carbon footprint',
      status: 'pending',
      isAlternativeApplied: false,
    };

    const currentPlanDoc = await DailyPlan.findById(plan._id);
    currentPlanDoc.activities.push(mockOutdoorActivity);
    currentPlanDoc.lastCalculatedAqi = 140; // Moderate
    await currentPlanDoc.save();

    // Trigger adjustment with a severe AQI spike: 320 (Very Poor / Severe)
    const mockAqiData = {
      location: { name: 'Connaught Place', city: 'New Delhi', lat: 28.6139, lon: 77.2090 },
      aqi: 320,
      aqiCategory: 'Very Poor',
      pollutants: { pm25: 180, pm10: 290, no2: 60, so2: 20, co: 1.5, o3: 40, nh3: 15 },
      weather: { temperature: 18, humidity: 65, windSpeed: 5, windDirection: 120, condition: 'Smog', code: 71 },
      hourlyTrend: [],
      standard: 'CPCB',
      healthGuidance: {
        category: 'Very Poor',
        color: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeText: '#ef4444',
        healthImplications: 'Respiratory risk',
        vulnerableGroups: ['Elderly', 'Children'],
        precautions: ['Wear N95'],
        disclaimer: 'Advisory only'
      },
      dataSource: 'CPCB',
      isDemo: false,
      lastUpdated: new Date().toISOString()
    };

    const adjustmentResult = recalculatePlanWithLiveAQI(
      currentPlanDoc,
      mockAqiData,
      false
    );

    console.log(`✅ Adjustment Triggered: ${adjustmentResult.updated ? 'YES' : 'NO'}`);
    console.log(`   Message: ${adjustmentResult.reason}`);
    const adjustedMock = adjustmentResult.plan.activities.find((a) => a.id === 'mock_outdoor_1');
    console.log(`   Protected Activity: "${adjustedMock.activity}" (${adjustedMock.indoorOutdoor}, Risk: ${adjustedMock.pollutionRisk})`);
    if (adjustedMock.indoorOutdoor !== 'indoor' || !adjustedMock.isAlternativeApplied) {
      throw new Error('Outdoor activity was not automatically protected/swapped during AQI spike!');
    }
    console.log('✅ Dynamic smog-spike protection verified: outdoor jog successfully swapped to indoor workout.');

    // -------------------------------------------------------------
    // TEST 7: Custom Activity Insertion
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Adding custom activity to schedule (/api/planner/activity/custom)...');
    const customRes = await fetch(`${baseUrl}/planner/activity/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        period: 'afternoon',
        activity: 'HEPA Filter Air Purifier Servicing',
        recommendedTime: '15:00',
        indoorOutdoor: 'indoor',
      }),
    });
    const customData = await customRes.json();
    if (!customData.success) {
      throw new Error(`Custom activity addition failed: ${JSON.stringify(customData)}`);
    }
    const addedCustom = customData.plan.activities.find((a) => a.activity.includes('HEPA'));
    if (!addedCustom) {
      throw new Error('Custom activity not found in updated plan');
    }
    console.log(`✅ Custom activity added: "${addedCustom.activity}" (${addedCustom.recommendedTime})`);

    // -------------------------------------------------------------
    // TEST 8: Multilingual Schedule Generation (Hindi & Gujarati)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing multilingual generation (Hindi & Gujarati)...');
    // Hindi
    const hiRes = await fetch(`${baseUrl}/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: { lat: 28.6139, lon: 77.2090, name: 'Delhi', city: 'Delhi' },
        language: 'hi',
        force: true,
      }),
    });
    const hiData = await hiRes.json();
    if (!hiData.success || !hiData.plan) throw new Error('Hindi generation failed');
    console.log(`✅ Hindi Plan Generated: "${hiData.plan.activities[0].activity}" (Reason: "${hiData.plan.activities[0].reason.substring(0, 30)}...")`);

    // Gujarati
    const guRes = await fetch(`${baseUrl}/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad', city: 'Ahmedabad' },
        language: 'gu',
        force: true,
      }),
    });
    const guData = await guRes.json();
    if (!guData.success || !guData.plan) throw new Error('Gujarati generation failed');
    console.log(`✅ Gujarati Plan Generated: "${guData.plan.activities[0].activity}" (Reason: "${guData.plan.activities[0].reason.substring(0, 30)}...")`);

    // -------------------------------------------------------------
    // TEST 9: Family Demographic Profiles & Tailored Precautions
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Family Profiles and Demographic Vulnerability Guidance (/api/planner/family)...');
    // Add Child
    const childRes = await fetch(`${baseUrl}/planner/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        relationship: 'child',
        category: 'children',
        age: 7,
        healthNotes: 'Developing respiratory system, active outdoors',
      }),
    });
    const childData = await childRes.json();
    if (!childData.success) throw new Error(`Failed to create child profile: ${JSON.stringify(childData)}`);
    console.log(`✅ Created Child Profile: ${childData.member.name} (Age: ${childData.member.age})`);

    // Add Elderly Parent
    const elderRes = await fetch(`${baseUrl}/planner/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Ramesh Mehta',
        relationship: 'parent',
        category: 'elderly',
        age: 74,
        healthNotes: 'History of chronic bronchitis and hypertension',
      }),
    });
    const elderData = await elderRes.json();
    if (!elderData.success) throw new Error(`Failed to create elderly profile: ${JSON.stringify(elderData)}`);
    console.log(`✅ Created Elderly Profile: ${elderData.member.name} (Age: ${elderData.member.age})`);

    // Fetch Family Recommendations
    const recRes = await fetch(
      `${baseUrl}/planner/family/recommendations?lat=28.6139&lon=77.2090&name=New+Delhi&language=en`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const recData = await recRes.json();
    if (!recData.success || !recData.guidance || recData.guidance.length === 0) {
      throw new Error('Failed to retrieve family guidance');
    }
    console.log(`✅ Retrieved Family Guidance for ${recData.guidance.length} demographic segments:`);
    for (const g of recData.guidance) {
      console.log(`   - [${g.name} (${g.category.toUpperCase()}) / Risk: ${g.riskLevel.toUpperCase()}]: ${g.recommendedActions[0] || 'Standard precautions'}`);
    }

    // Delete Child Profile
    const delMemberRes = await fetch(`${baseUrl}/planner/family/${childData.member._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delMemberData = await delMemberRes.json();
    console.log(`✅ Deleted family profile: ${delMemberData.message}`);

    // -------------------------------------------------------------
    // TEST 10: Reminders System
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Reminders System (/api/planner/reminders)...');
    const remindersRes = await fetch(`${baseUrl}/planner/reminders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const remindersData = await remindersRes.json();
    if (!remindersData.success || !remindersData.reminders || remindersData.reminders.length === 0) {
      throw new Error('Failed to list reminders');
    }
    console.log(`✅ Loaded ${remindersData.reminders.length} default smart reminders`);
    const firstReminder = remindersData.reminders[0];

    const toggleRemRes = await fetch(`${baseUrl}/planner/reminders/${firstReminder._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        enabled: !firstReminder.enabled,
        time: '07:00',
      }),
    });
    const toggleRemData = await toggleRemRes.json();
    if (!toggleRemData.success) throw new Error('Failed to toggle reminder');
    console.log(`✅ Toggled reminder "${toggleRemData.reminder.title}": Enabled = ${toggleRemData.reminder.enabled}, Time = ${toggleRemData.reminder.time}`);

    console.log('\n================================================================');
    console.log('🎉 ALL 10 MODULE 3 E2E VERIFICATION SUITES PASSED (100%)!');
    console.log('================================================================');
  } finally {
    server.close();
    await disconnectDB();
    console.log('[Test Server] Ephemeral server closed and database disconnected cleanly.');
  }
}

runModule3Tests().catch((err) => {
  console.error('❌ Module 3 E2E Test Suite Failed:', err);
  process.exit(1);
});
