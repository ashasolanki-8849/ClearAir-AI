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
import indoorRoutes from './src/routes/indoorRoutes';
import indoorDeviceRoutes from './src/routes/indoorDeviceRoutes';

dotenv.config();

async function runModule4Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 4: INDOOR AIR QUALITY INTELLIGENCE E2E TESTS');
  console.log('================================================================');

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
  app.use('/api/indoor/devices', indoorDeviceRoutes);
  app.use('/api/indoor', indoorRoutes);
  app.use(errorHandler);

  const testPort = 5057;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering test user with residential household profile...');
    const userEmail = `indoor.pilot.${Date.now()}@clearair.test`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Ananya Sharma',
        email: userEmail,
        password: 'Password@123',
        ageGroup: '18_35',
        userCategory: 'family',
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
    // TEST 2: Room Management (CRUD)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Room Management (/api/indoor/rooms)...');
    // GET rooms (auto-seeds defaults)
    const getRoomsRes = await fetch(`${baseUrl}/indoor/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const roomsData = await getRoomsRes.json();
    if (!roomsData.success || !roomsData.rooms || roomsData.rooms.length === 0) {
      throw new Error(`Failed to get default rooms: ${JSON.stringify(roomsData)}`);
    }
    console.log(`✅ Seeded ${roomsData.rooms.length} default rooms: "${roomsData.rooms.map((r) => r.roomName).join('", "')}"`);
    const masterBedroom = roomsData.rooms[0];

    // POST new custom room
    const createRoomRes = await fetch(`${baseUrl}/indoor/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomName: 'Home Study & Library',
        roomType: 'study_room',
        dimensions: { length: 3.8, width: 3.2, height: 2.9, unit: 'meters' },
        ventilation: {
          windowCount: 1,
          hasExhaustFan: false,
          hasAirPurifier: true,
          hasAC: true,
          ventilationType: 'natural',
        },
        occupancyCount: 1,
        hasSmokingExposure: false,
        hasPets: true,
        hasIncenseCandles: false,
      }),
    });
    const createRoomData = await createRoomRes.json();
    if (!createRoomData.success || !createRoomData.room) {
      throw new Error(`Failed to create room: ${JSON.stringify(createRoomData)}`);
    }
    const studyRoomId = createRoomData.room._id;
    console.log(`✅ Created custom room: "${createRoomData.room.roomName}" (ID: ${studyRoomId})`);

    // PUT update room
    const updateRoomRes = await fetch(`${baseUrl}/indoor/rooms/${studyRoomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomName: 'Home Study & Reading Lounge',
        occupancyCount: 2,
      }),
    });
    const updateRoomData = await updateRoomRes.json();
    if (!updateRoomData.success || updateRoomData.room.roomName !== 'Home Study & Reading Lounge') {
      throw new Error(`Failed to update room: ${JSON.stringify(updateRoomData)}`);
    }
    console.log(`✅ Updated room name to: "${updateRoomData.room.roomName}"`);

    // -------------------------------------------------------------
    // TEST 3: Room Air Assessment & Pollution Source Detection
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Room Air Assessment & Source Detection (/api/indoor/assessment)...');
    const assessRes = await fetch(`${baseUrl}/indoor/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId: studyRoomId,
        responses: {
          roomType: 'study_room',
          windowCount: 1,
          ventilationAvailability: 'limited',
          airPurifierStatus: 'none',
          cookingActivities: 'none',
          indoorSmoking: false,
          incenseOrCandles: 'daily_puja',
          dustAccumulation: 'heavy',
          petsInRoom: true,
          cleaningHabits: 'dry_sweeping',
          dampnessOrMold: 'none',
          combustionAppliances: 'none',
        },
        location: { lat: 28.6139, lon: 77.2090, name: 'Delhi' },
        language: 'en',
      }),
    });
    const assessData = await assessRes.json();
    if (!assessData.success || !assessData.assessment) {
      throw new Error(`Assessment failed: ${JSON.stringify(assessData)}`);
    }

    const assessment = assessData.assessment;
    console.log(`✅ Assessment Generated: Risk Level = ${assessment.overallRiskLevel.toUpperCase()}`);
    console.log(`✅ Identified ${assessment.identifiedPollutionSources.length} pollution sources:`);
    for (const src of assessment.identifiedPollutionSources) {
      console.log(`   - [${src.category.toUpperCase()} / ${src.severity.toUpperCase()}]: ${src.sourceName}`);
    }
    if (!assessment.isQuestionnaireBased) {
      throw new Error('Assessment should explicitly be marked as isQuestionnaireBased: true');
    }
    console.log(`✅ Verified empirical estimation flag (isQuestionnaireBased: ${assessment.isQuestionnaireBased})`);

    // Verify GET room assessment
    const getAssessRes = await fetch(`${baseUrl}/indoor/assessment/${studyRoomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getAssessData = await getAssessRes.json();
    if (!getAssessData.success || !getAssessData.assessment) {
      throw new Error('Failed to retrieve saved room assessment');
    }
    console.log(`✅ Verified GET /api/indoor/assessment/:roomId (ID: ${getAssessData.assessment._id})`);

    // -------------------------------------------------------------
    // TEST 4: Smart Ventilation Advisor
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Smart Ventilation Advisor (/api/indoor/ventilation-advice)...');
    // Sub-test A: Normal living area during high outdoor smog
    const ventRes = await fetch(`${baseUrl}/indoor/ventilation-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
        roomId: studyRoomId,
        isCookingActive: false,
        language: 'en',
      }),
    });
    const ventData = await ventRes.json();
    if (!ventData.success || !ventData.advice) {
      throw new Error(`Ventilation advice failed: ${JSON.stringify(ventData)}`);
    }
    console.log(`✅ Standard Ventilation Strategy: "${ventData.advice.headline}"`);
    console.log(`   - Status: ${ventData.advice.ventilationStatus}`);
    console.log(`   - Optimal Window: ${ventData.advice.bestTimeWindow}`);
    console.log(`   - Duration: ${ventData.advice.durationMinutes} min pulse`);

    // Sub-test B: Active kitchen cooking override
    const cookVentRes = await fetch(`${baseUrl}/indoor/ventilation-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { lat: 28.6139, lon: 77.2090, name: 'New Delhi' },
        roomId: studyRoomId,
        isCookingActive: true, // Cooking active!
        language: 'en',
      }),
    });
    const cookVentData = await cookVentRes.json();
    if (!cookVentData.success || !cookVentData.advice.headline.includes('Kitchen')) {
      throw new Error('Active cooking did not trigger kitchen plume extraction override!');
    }
    console.log(`✅ Active Cooking Plume Extraction Triggered: "${cookVentData.advice.headline}"`);

    // -------------------------------------------------------------
    // TEST 5: Purifier CADR Sizing & Safety Calculator
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Purifier CADR Sizing & Prohibited Tech Rules (/api/indoor/purifier-advice)...');
    const purifierRes = await fetch(`${baseUrl}/indoor/purifier-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        length: 5,
        width: 4,
        height: 3,
        unit: 'meters',
        budget: 'mid_range',
        primaryConcern: 'smog_pm25',
      }),
    });
    const purifierData = await purifierRes.json();
    if (!purifierData.success || !purifierData.advice) {
      throw new Error(`Purifier advice failed: ${JSON.stringify(purifierData)}`);
    }
    const advice = purifierData.advice;
    console.log(`✅ Room Volume: ${advice.roomVolume.cubicMeters} m³ (${advice.roomVolume.cubicFeet} ft³)`);
    console.log(`✅ Calculated CADR (5 ACH): ${advice.recommendedCADR.smokeCfm} CFM (${advice.recommendedCADR.smokeM3h} m³/h)`);
    console.log(`✅ Filter Grade: ${advice.filterTechRequired.hepaGrade}`);

    // Verify Ozone prohibition & Carbon Monoxide limitation
    if (!advice.filterTechRequired.forbiddenTechWarning.includes('ozone') && !advice.filterTechRequired.forbiddenTechWarning.includes('Ozone')) {
      throw new Error('Missing ozone-generator prohibition warning!');
    }
    const hasCoNotice = advice.criticalLimitations.some((lim) => lim.includes('Carbon Monoxide'));
    if (!hasCoNotice) {
      throw new Error('Missing Carbon Monoxide limitation notice in purifier guidance!');
    }
    console.log('✅ Safety verification passed: Ozone generators strictly rejected & CO detector limitation documented.');

    // -------------------------------------------------------------
    // TEST 6: Connected Devices & Sensor Integration
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Connected Sensor Integration & Ingestion (/api/indoor/devices)...');
    // Register physical hardware device
    const regDevRes = await fetch(`${baseUrl}/indoor/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceName: 'Bedroom Laser IAQ Monitor',
        deviceType: 'physical_sensor',
        deviceIdentifier: 'AQ-SENSOR-98X2',
        roomId: masterBedroom._id,
      }),
    });
    const regDevData = await regDevRes.json();
    if (!regDevData.success || !regDevData.device) {
      throw new Error(`Device registration failed: ${JSON.stringify(regDevData)}`);
    }
    const deviceId = regDevData.device._id;
    console.log(`✅ Registered physical hardware device: "${regDevData.device.deviceName}" (ID: ${deviceId})`);

    // Ingest High PM2.5 & High CO2 Telemetry Reading
    const ingestRes = await fetch(`${baseUrl}/indoor/devices/${deviceId}/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pm25: 145, // Spike!
        pm10: 220,
        co2: 1950, // Critical CO2 stuffiness!
        humidity: 68,
        temperature: 21.5,
        voc: 280,
      }),
    });
    const ingestData = await ingestRes.json();
    if (!ingestData.success || !ingestData.reading) {
      throw new Error(`Reading ingestion failed: ${JSON.stringify(ingestData)}`);
    }
    console.log(`✅ Telemetry Ingested: PM2.5 = ${ingestData.reading.pm25} µg/m³, CO2 = ${ingestData.reading.co2} ppm`);
    console.log(`✅ Automated Threshold Alerts Triggered: ${ingestData.triggeredAlerts.length} alert(s)`);

    // Verify Reading History
    const historyRes = await fetch(`${baseUrl}/indoor/devices/${deviceId}/readings?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    if (!historyData.success || historyData.readings.length === 0) {
      throw new Error('Failed to retrieve device reading history');
    }
    console.log(`✅ Loaded ${historyData.readings.length} historical reading points for device`);

    // Activate Demo Simulator Device
    const demoRes = await fetch(`${baseUrl}/indoor/devices/demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomName: 'Living Room' }),
    });
    const demoData = await demoRes.json();
    if (!demoData.success || !demoData.device.isDemo) {
      throw new Error('Failed to activate demo device');
    }
    console.log(`✅ Activated Demo Simulator: "${demoData.device.deviceName}" (isDemo: ${demoData.device.isDemo})`);

    // -------------------------------------------------------------
    // TEST 7: Indoor Alerts Verification & Read Status
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing Smart Indoor Alerts System (/api/indoor/alerts)...');
    const alertsRes = await fetch(`${baseUrl}/indoor/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const alertsData = await alertsRes.json();
    if (!alertsData.success || !alertsData.alerts || alertsData.alerts.length === 0) {
      throw new Error('No alerts found after high-reading ingestion');
    }
    console.log(`✅ Retrieved ${alertsData.alerts.length} active indoor alerts:`);
    for (const alt of alertsData.alerts.slice(0, 3)) {
      console.log(`   - [${alt.severity.toUpperCase()} / ${alt.alertCategory}]: ${alt.message}`);
    }

    // Mark first alert as read
    const firstAlert = alertsData.alerts[0];
    const markReadRes = await fetch(`${baseUrl}/indoor/alerts/${firstAlert._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const markReadData = await markReadRes.json();
    if (!markReadData.success || !markReadData.alert.read) {
      throw new Error('Failed to mark alert as read');
    }
    console.log(`✅ Alert marked as read (read: ${markReadData.alert.read})`);

    // -------------------------------------------------------------
    // TEST 8: AI Indoor Advisor Queries
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing GenAI Indoor Air Advisor (/api/indoor/ask-advisor)...');
    // Query A: Houseplants myth debunking
    const plantQueryRes = await fetch(`${baseUrl}/indoor/ask-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Are indoor plants enough to clean the air in my bedroom?',
        roomId: studyRoomId,
        language: 'en',
      }),
    });
    const plantQueryData = await plantQueryRes.json();
    if (!plantQueryData.success || !plantQueryData.answer) {
      throw new Error('Plant query failed');
    }
    console.log(`✅ AI Advisor [Plants Question]:`);
    console.log(`   - Problem: "${plantQueryData.answer.identifiedProblem}"`);
    console.log(`   - Action: "${plantQueryData.answer.recommendedAction}"`);
    console.log(`   - Cost Category: "${plantQueryData.answer.costCategory}"`);

    // Query B: Cooking smoke question
    const smokeQueryRes = await fetch(`${baseUrl}/indoor/ask-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'How do I reduce cooking smoke from deep frying?',
        roomId: studyRoomId,
        language: 'en',
      }),
    });
    const smokeQueryData = await smokeQueryRes.json();
    if (!smokeQueryData.success || !smokeQueryData.answer.recommendedAction.includes('exhaust')) {
      throw new Error('Cooking smoke query did not recommend exhaust extraction!');
    }
    console.log(`✅ AI Advisor [Cooking Smoke]: "${smokeQueryData.answer.recommendedAction.substring(0, 60)}..."`);

    // -------------------------------------------------------------
    // TEST 9: Multilingual Support (Hindi & Gujarati)
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Multilingual Assessment (Hindi & Gujarati)...');
    // Hindi
    const hiAssessRes = await fetch(`${baseUrl}/indoor/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId: studyRoomId,
        responses: {
          roomType: 'kitchen',
          windowCount: 1,
          ventilationAvailability: 'adequate',
          airPurifierStatus: 'none',
          cookingActivities: 'heavy_frying_tadka',
          indoorSmoking: false,
          incenseOrCandles: 'never',
          dustAccumulation: 'low',
          petsInRoom: false,
          cleaningHabits: 'wet_mopping',
          dampnessOrMold: 'none',
        },
        language: 'hi',
      }),
    });
    const hiAssessData = await hiAssessRes.json();
    if (!hiAssessData.success || !hiAssessData.assessment) throw new Error('Hindi assessment failed');
    console.log(`✅ Hindi Assessment Generated: "${hiAssessData.assessment.identifiedPollutionSources[0].sourceName}"`);

    // Gujarati
    const guAssessRes = await fetch(`${baseUrl}/indoor/assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId: studyRoomId,
        responses: {
          roomType: 'kitchen',
          windowCount: 1,
          ventilationAvailability: 'adequate',
          airPurifierStatus: 'none',
          cookingActivities: 'heavy_frying_tadka',
          indoorSmoking: false,
          incenseOrCandles: 'never',
          dustAccumulation: 'low',
          petsInRoom: false,
          cleaningHabits: 'wet_mopping',
          dampnessOrMold: 'none',
        },
        language: 'gu',
      }),
    });
    const guAssessData = await guAssessRes.json();
    if (!guAssessData.success || !guAssessData.assessment) throw new Error('Gujarati assessment failed');
    console.log(`✅ Gujarati Assessment Generated: "${guAssessData.assessment.identifiedPollutionSources[0].sourceName}"`);

    // -------------------------------------------------------------
    // TEST 10: Clean Room Deletion
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Room Deletion & Cascade Clean-up (/api/indoor/rooms/:id)...');
    const delRoomRes = await fetch(`${baseUrl}/indoor/rooms/${studyRoomId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delRoomData = await delRoomRes.json();
    if (!delRoomData.success) throw new Error('Failed to delete room');
    console.log(`✅ Cleanly deleted custom room: ${delRoomData.message}`);

    console.log('\n================================================================');
    console.log('🎉 ALL 10 MODULE 4 E2E VERIFICATION SUITES PASSED (100%)!');
    console.log('================================================================');
  } finally {
    server.close();
    await disconnectDB();
    console.log('[Test Server] Ephemeral server closed and database disconnected cleanly.');
  }
}

runModule4Tests().catch((err) => {
  console.error('❌ Module 4 E2E Test Suite Failed:', err);
  process.exit(1);
});
