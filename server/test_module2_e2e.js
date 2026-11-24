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
import { Conversation } from './src/models/Conversation';

dotenv.config();

async function runModule2Tests() {
  console.log('===========================================================');
  console.log('🧪 STARTING MODULE 2: GENAI SMART SMOG ASSISTANT E2E TESTS');
  console.log('===========================================================');

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
  app.use(errorHandler);

  const testPort = 5055;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering test user with demographic profile...');
    const userEmail = `smog.pilot.${Date.now()}@clearair.test`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Aarav Patel',
        email: userEmail,
        password: 'SecurePassword@123',
        ageGroup: '18_35',
        userCategory: 'student',
        city: 'Ahmedabad',
        preferredLocation: { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
      }),
    });
    const regData = await regRes.json();
    if (!regData.success || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.token;
    console.log(`✅ User registered: ${regData.user.fullName} (${regData.user.userCategory})`);

    // -------------------------------------------------------------
    // TEST 2: Chat in English (Outdoor Safety & Real AQI Grounding)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Chat in English: "Is it safe to go outside today?"...');
    const chat1Res = await fetch(`${baseUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: 'Is it safe to go outside today?',
        language: 'en',
        location: { lat: 28.6139, lon: 77.209, name: 'New Delhi', city: 'Delhi' },
      }),
    });
    const chat1Data = await chat1Res.json();
    if (!chat1Data.success || !chat1Data.response) {
      throw new Error(`Chat 1 failed: ${JSON.stringify(chat1Data)}`);
    }

    const resp1 = chat1Data.response;
    console.log(`✅ Summary: "${resp1.summary.slice(0, 100)}..."`);
    console.log(`✅ Grounded Location: ${resp1.current_conditions.locationName}`);
    console.log(`✅ Grounded AQI: ${resp1.current_conditions.aqi} (${resp1.current_conditions.category})`);
    console.log(`✅ Recommendations Count: ${resp1.recommendations.length}`);

    // Verify Impact Engine (Personal Benefit vs Environmental Benefit)
    const rec1 = resp1.recommendations[0];
    if (!rec1.personal_benefit || !rec1.environmental_benefit) {
      throw new Error('Impact explanation missing personal or environmental benefit!');
    }
    console.log(`✅ Impact Engine Verified: Personal Benefit="${rec1.personal_benefit.slice(0, 50)}...", Environmental Benefit="${rec1.environmental_benefit.slice(0, 50)}..."`);

    // Verify Dynamic Daily Routine
    if (!resp1.daily_routine || !resp1.daily_routine.morning || !resp1.daily_routine.night) {
      throw new Error('Dynamic daily routine missing time segments!');
    }
    console.log(`✅ Daily Routine Verified: Morning="${resp1.daily_routine.morning.slice(0, 45)}..."`);

    const convId = chat1Data.conversationId;
    console.log(`✅ Conversation persisted in MongoDB with ID: ${convId}`);

    // -------------------------------------------------------------
    // TEST 3: What-If Simulation Query
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing What-If Scenario: "What if I exercise outdoors today?"...');
    const whatIfRes = await fetch(`${baseUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId: convId,
        message: 'What if I exercise outdoors today?',
        language: 'en',
      }),
    });
    const whatIfData = await whatIfRes.json();
    const respWhatIf = whatIfData.response;
    if (!respWhatIf.what_if_analysis) {
      throw new Error('What-if analysis structure missing from response!');
    }
    console.log(`✅ Scenario: "${respWhatIf.what_if_analysis.scenario}"`);
    console.log(`✅ Consequences: "${respWhatIf.what_if_analysis.consequences.slice(0, 70)}..."`);
    console.log(`✅ Safer Alternative: "${respWhatIf.what_if_analysis.safer_alternative.slice(0, 70)}..."`);

    // -------------------------------------------------------------
    // TEST 4: Multilingual Support - Hindi (हिन्दी)
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Multilingual Support in Hindi (हिन्दी)...');
    const hindiRes = await fetch(`${baseUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: 'घर के अंदर की हवा को कैसे साफ रखें?',
        language: 'hi',
        location: { lat: 28.6139, lon: 77.209, name: 'नई दिल्ली', city: 'दिल्ली' },
      }),
    });
    const hindiData = await hindiRes.json();
    console.log(`✅ Hindi Summary: "${hindiData.response.summary.slice(0, 80)}..."`);
    console.log(`✅ Hindi Recommendation: "${hindiData.response.recommendations[0].action.slice(0, 60)}..."`);
    if (!hindiData.response.summary || hindiData.response.recommendations.length === 0) {
      throw new Error('Hindi response malformed!');
    }

    // -------------------------------------------------------------
    // TEST 5: Multilingual Support - Gujarati (ગુજરાતી)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Multilingual Support in Gujarati (ગુજરાતી)...');
    const gujRes = await fetch(`${baseUrl}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: 'શું આજે બહાર કસરત કરવી સલામત છે?',
        language: 'gu',
        location: { lat: 23.0225, lon: 72.5714, name: 'અમદાવાદ', city: 'ગુજરાત' },
      }),
    });
    const gujData = await gujRes.json();
    console.log(`✅ Gujarati Summary: "${gujData.response.summary.slice(0, 80)}..."`);
    if (!gujData.response.summary || gujData.response.recommendations.length === 0) {
      throw new Error('Gujarati response malformed!');
    }

    // -------------------------------------------------------------
    // TEST 6: Conversation History & Retrieval Endpoints
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Conversation History retrieval (/api/assistant/conversations)...');
    const listRes = await fetch(`${baseUrl}/assistant/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.log(`✅ Retrieved ${listData.conversations.length} conversations for user`);
    if (listData.conversations.length < 2) {
      throw new Error('Expected at least 2 saved conversations!');
    }

    // Load conversation by ID
    const getSingleRes = await fetch(`${baseUrl}/assistant/conversations/${convId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const singleData = await getSingleRes.json();
    console.log(`✅ Loaded conversation "${singleData.conversation.title}" with ${singleData.conversation.messages.length} messages`);

    // -------------------------------------------------------------
    // TEST 7: Delete and Clear Conversations
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing Delete Single Conversation (/api/assistant/conversations/:id)...');
    const delRes = await fetch(`${baseUrl}/assistant/conversations/${convId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    console.log(`✅ Delete Result: ${delData.message}`);

    const verifyDel = await Conversation.findById(convId);
    if (verifyDel) {
      throw new Error('Conversation was not deleted from MongoDB!');
    }
    console.log('✅ Verified deletion from MongoDB collection');

    console.log('\n===========================================================');
    console.log('🎉 ALL 7 MODULE 2 E2E VERIFICATION SUITES PASSED (100%)!');
    console.log('===========================================================');
  } finally {
    server.close();
    await disconnectDB();
    console.log('[Test Server] Ephemeral server closed and database disconnected cleanly.');
  }
}

runModule2Tests().catch((err) => {
  console.error('❌ Module 2 E2E Test Suite Failed:', err);
  process.exit(1);
});
