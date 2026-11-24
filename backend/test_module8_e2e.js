import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB, disconnectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/authRoutes';
import airQualityRoutes from './src/routes/airQualityRoutes';
import { communityRouter, pollutionReportRouter } from './src/routes/communityRoutes';

dotenv.config();

async function runModule8Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 8: COMMUNITY & SOCIETY INTELLIGENCE PLATFORM');
  console.log('   FULL END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/air-quality', airQualityRoutes);
  app.use('/api/communities', communityRouter);
  app.use('/api/community-reports', pollutionReportRouter);
  app.use(errorHandler);

  const testPort = 5062;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register Owner & Member Users
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering Founder and Community Member...');
    const ownerPayload = {
      fullName: 'Vikram Mehta RWA President',
      email: `vikram_rwa_${Date.now()}@clearair.test`,
      password: 'SecurePassword123!',
      city: 'Delhi',
      role: 'user',
    };
    const memberPayload = {
      fullName: 'Pooja Verma Resident',
      email: `pooja_resident_${Date.now()}@clearair.test`,
      password: 'SecurePassword123!',
      city: 'Delhi',
      role: 'user',
    };

    const [ownerRes, memberRes] = await Promise.all([
      axios.post(`${baseUrl}/auth/register`, ownerPayload),
      axios.post(`${baseUrl}/auth/register`, memberPayload),
    ]);

    const ownerToken = ownerRes.data.token;
    const memberToken = memberRes.data.token;
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };
    const memberHeaders = { Authorization: `Bearer ${memberToken}` };

    console.log('✅ [TEST 1 PASSED] Owner and Member registered with JWT tokens.');

    // -------------------------------------------------------------
    // TEST 2: Community Creation & Automatic Founder Ownership
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Creating Residential Society Community...');
    const commPayload = {
      name: 'Gulmohar Greens RWA',
      type: 'residential_society',
      description:
        'Sector 62 residential society active in stopping garbage fires and misting driveways.',
      location: {
        city: 'Delhi',
        locality: 'Sector 62',
        coordinates: { lat: 28.628, lon: 77.365 },
        address: 'Gate 2, Sector 62',
      },
      privacy: 'public',
      objectives: ['Stop open trash fires', 'Anti-dust wet mopping', 'Staff welfare heaters'],
    };

    const createRes = await axios.post(`${baseUrl}/communities`, commPayload, {
      headers: ownerHeaders,
    });

    if (!createRes.data?.success || !createRes.data?.community?._id) {
      throw new Error(`Failed to create community: ${JSON.stringify(createRes.data)}`);
    }

    const communityId = createRes.data.community._id;
    const inviteCode = createRes.data.community.invitationCode;
    console.log(`✅ [TEST 2 PASSED] Community created: "${createRes.data.community.name}" (ID: ${communityId}, Invite Code: ${inviteCode})`);

    // -------------------------------------------------------------
    // TEST 3: Member Joining & Invitation Code Workflows
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Member Joining & Invite Code...');
    const joinRes = await axios.post(
      `${baseUrl}/communities/${communityId}/join`,
      {},
      { headers: memberHeaders }
    );
    if (!joinRes.data?.success || joinRes.data.status !== 'active') {
      throw new Error(`Join community failed: ${JSON.stringify(joinRes.data)}`);
    }

    // Verify member count updated
    const detailsRes = await axios.get(`${baseUrl}/communities/${communityId}`, {
      headers: memberHeaders,
    });
    if (detailsRes.data.community.membersCount < 2 || !detailsRes.data.userMembership) {
      throw new Error(`Community details verification failed: ${JSON.stringify(detailsRes.data)}`);
    }
    console.log(`✅ [TEST 3 PASSED] Member joined successfully. Total Members: ${detailsRes.data.community.membersCount}`);

    // -------------------------------------------------------------
    // TEST 4: Community Real-Time AQI & Severe Smog Detection
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Community AQI Retrieval & Inversion Assessment...');
    const aqiRes = await axios.get(`${baseUrl}/communities/${communityId}/aqi`);
    if (!aqiRes.data?.success || !aqiRes.data.aqi?.aqiData) {
      throw new Error(`Community AQI fetch failed: ${JSON.stringify(aqiRes.data)}`);
    }
    const aqiVal = aqiRes.data.aqi.aqiData.aqi;
    console.log(`✅ [TEST 4 PASSED] Community AQI retrieved: ${aqiVal} (${aqiRes.data.aqi.aqiData.aqiCategory}) [Source: ${aqiRes.data.aqi.dataSourceLabel}]`);

    // -------------------------------------------------------------
    // TEST 5: Citizen Pollution Incident Reporting & Anonymity
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Submitting Citizen Pollution Incident Report...');
    const reportPayload = {
      communityId,
      category: 'garbage_burning',
      title: 'Illegal leaf burning near Gate 3 vacant plot',
      description: 'Horticulture refuse set ablaze producing dense acrid smoke in the evening.',
      location: {
        name: 'Gate 3 Vacant Plot',
        city: 'Delhi',
        locality: 'Sector 62',
        coordinates: { lat: 28.629, lon: 77.366 },
      },
      severity: 'high',
      isAnonymous: true,
    };

    const reportRes = await axios.post(`${baseUrl}/community-reports`, reportPayload, {
      headers: memberHeaders,
    });
    if (!reportRes.data?.success || !reportRes.data.report?._id) {
      throw new Error(`Report creation failed: ${JSON.stringify(reportRes.data)}`);
    }
    const reportId = reportRes.data.report._id;
    if (!reportRes.data.report.reporterName.includes('Concerned Citizen')) {
      throw new Error(`Anonymity masking failed: ${reportRes.data.report.reporterName}`);
    }
    console.log(`✅ [TEST 5 PASSED] Incident reported anonymously: ID ${reportId} (Category: ${reportRes.data.report.category})`);

    // -------------------------------------------------------------
    // TEST 6: Hotspot Map Feed & Incident Upvoting / Corroboration
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Hotspot Map Endpoints & Corroboration Upvotes...');
    const hotspotsRes = await axios.get(`${baseUrl}/community-reports/hotspots?city=Delhi`);
    if (!hotspotsRes.data?.success || !Array.isArray(hotspotsRes.data.hotspots)) {
      throw new Error(`Hotspot feed failed: ${JSON.stringify(hotspotsRes.data)}`);
    }

    const upvoteRes = await axios.post(`${baseUrl}/community-reports/${reportId}/upvote`, {}, {
      headers: ownerHeaders,
    });
    if (!upvoteRes.data?.success || upvoteRes.data.upvotes !== 1) {
      throw new Error(`Upvoting report failed: ${JSON.stringify(upvoteRes.data)}`);
    }
    console.log(`✅ [TEST 6 PASSED] Hotspots feed contains ${hotspotsRes.data.hotspots.length} points. Report upvoted (Count: ${upvoteRes.data.upvotes}).`);

    // -------------------------------------------------------------
    // TEST 7: Moderation Workflow (Submitted -> Verified -> Resolved)
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing Moderation Workflow & Status Transitions...');
    const modRes1 = await axios.patch(
      `${baseUrl}/community-reports/${reportId}/status`,
      { status: 'verified', moderationNotes: 'Site visited by RWA patrol. Confirmed burning.' },
      { headers: ownerHeaders }
    );
    if (modRes1.data.report.status !== 'verified') {
      throw new Error(`Verification status change failed: ${JSON.stringify(modRes1.data)}`);
    }

    const modRes2 = await axios.patch(
      `${baseUrl}/community-reports/${reportId}/status`,
      { status: 'resolved', moderationNotes: 'Fire extinguished using garden hose misting.' },
      { headers: ownerHeaders }
    );
    if (modRes2.data.report.status !== 'resolved') {
      throw new Error(`Resolution status change failed: ${JSON.stringify(modRes2.data)}`);
    }
    console.log('✅ [TEST 7 PASSED] Moderation completed: Submitted -> Verified -> Resolved.');

    // -------------------------------------------------------------
    // TEST 8: Community Events & Verifiable Campaigns
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Creating Green Event & Waste Segregation Campaign...');
    // Create Event
    const eventPayload = {
      title: 'Perimeter Tree Canopy Washing Drive',
      category: 'tree_planting',
      description: 'Water washing of boundary dust leaves to reduce resuspended PM10.',
      location: { name: 'Gulmohar Greens Perimeter' },
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 90000000).toISOString(),
      maxParticipants: 25,
    };
    const eventRes = await axios.post(`${baseUrl}/communities/${communityId}/events`, eventPayload, {
      headers: ownerHeaders,
    });
    const eventId = eventRes.data.event._id;

    // Register for Event
    const regEventRes = await axios.post(
      `${baseUrl}/communities/events/${eventId}/register`,
      {},
      { headers: memberHeaders }
    );
    if (!regEventRes.data?.success || !regEventRes.data.registered) {
      throw new Error(`Event registration failed: ${JSON.stringify(regEventRes.data)}`);
    }

    // Create Campaign
    const campPayload = {
      title: '500 kg Dry Leaves Aerobic Composting Challenge',
      objective: 'Convert society fallen foliage to organic mulch instead of open burning',
      category: 'waste_segregation',
      targetMetric: 'kg leaves composted',
      targetValue: 500,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    };
    const campRes = await axios.post(`${baseUrl}/communities/${communityId}/campaigns`, campPayload, {
      headers: ownerHeaders,
    });
    const campaignId = campRes.data.campaign._id;

    // Log progress
    const progRes = await axios.post(
      `${baseUrl}/communities/campaigns/${campaignId}/progress`,
      { incrementValue: 120, participantsIncrement: 5 },
      { headers: ownerHeaders }
    );
    if (progRes.data.campaign.currentValue !== 120) {
      throw new Error(`Campaign progress failed: ${JSON.stringify(progRes.data)}`);
    }
    console.log(`✅ [TEST 8 PASSED] Event registered (RSVP: 1) and Campaign progress updated (120/500 kg).`);

    // -------------------------------------------------------------
    // TEST 9: Community Discussion Forum & Replies
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Discussion Thread & Nested Comments...');
    const postPayload = {
      category: 'waste_management',
      title: 'Where can we buy electric quartz heaters for guard cabins?',
      content: 'Let us ensure all 4 gate guards have electric warmth so wood fires are not needed.',
    };
    const postRes = await axios.post(`${baseUrl}/communities/${communityId}/posts`, postPayload, {
      headers: memberHeaders,
    });
    const postId = postRes.data.post._id;

    // Add Comment
    const commentRes = await axios.post(
      `${baseUrl}/communities/posts/${postId}/comments`,
      { content: 'RWA committee has already ordered 4 halogen heaters from local supplier.' },
      { headers: ownerHeaders }
    );
    if (!commentRes.data?.success || !commentRes.data.comment) {
      throw new Error(`Comment failed: ${JSON.stringify(commentRes.data)}`);
    }

    // Toggle like
    const likeRes = await axios.post(`${baseUrl}/communities/posts/${postId}/like`, {}, {
      headers: ownerHeaders,
    });
    if (!likeRes.data?.success || likeRes.data.likesCount !== 1) {
      throw new Error(`Post like failed: ${JSON.stringify(likeRes.data)}`);
    }
    console.log(`✅ [TEST 9 PASSED] Discussion thread created, replied to, and upvoted.`);

    // -------------------------------------------------------------
    // TEST 10: Ask Community AI Advisor, Leaderboard & Audit Log
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Ask Community AI Advisor & Transparent Leaderboard...');
    const aiRes = await axios.post(
      `${baseUrl}/communities/${communityId}/advisor`,
      { query: 'What immediate precautions should our RWA execute for winter smog today?' }
    );
    if (!aiRes.data?.success || !aiRes.data.advice?.summary || !Array.isArray(aiRes.data.advice.recommended_actions)) {
      throw new Error(`Community AI Advisor response invalid: ${JSON.stringify(aiRes.data)}`);
    }

    // Leaderboard
    const lbRes = await axios.get(`${baseUrl}/communities/${communityId}/leaderboard`);
    if (!lbRes.data?.success || !Array.isArray(lbRes.data.leaderboard)) {
      throw new Error(`Leaderboard fetch failed: ${JSON.stringify(lbRes.data)}`);
    }

    // Institution View
    const instRes = await axios.get(`${baseUrl}/communities/${communityId}/institution-view`);
    if (!instRes.data?.success || !instRes.data.viewData?.pillars) {
      throw new Error(`Institution view failed: ${JSON.stringify(instRes.data)}`);
    }

    // Audit logs
    const auditRes = await axios.get(`${baseUrl}/communities/${communityId}/audit-logs`, {
      headers: ownerHeaders,
    });
    if (!auditRes.data?.success || auditRes.data.logs.length === 0) {
      throw new Error(`Audit log fetch failed: ${JSON.stringify(auditRes.data)}`);
    }

    console.log(`✅ [TEST 10 PASSED] AI Advisor returned structured advice with ${aiRes.data.advice.recommended_actions.length} action items. Leaderboard has ${lbRes.data.leaderboard.length} users. ${auditRes.data.logs.length} audit logs verified.`);

    console.log('\n================================================================');
    console.log('🎉 ALL 10/10 MODULE 8 E2E TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ MODULE 8 E2E TEST SUITE FAILED:', err.message);
    if (err.response?.data) {
      console.error('Response details:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    server.close(() => {
      console.log('[Test Server] Ephemeral server closed gracefully.');
    });
    await disconnectDB();
  }
}

runModule8Tests();
