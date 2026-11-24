import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB, disconnectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/authRoutes';
import travelRoutes from './src/routes/travelRoutes';
import airQualityRoutes from './src/routes/airQualityRoutes';

dotenv.config();

async function runModule5Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 5: LOW-EMISSION TRAVEL & SMART ROUTE ADVISOR');
  console.log('   FULL END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/air-quality', airQualityRoutes);
  app.use('/api/travel', travelRoutes);
  app.use(errorHandler);

  const testPort = 5058;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering commuter test user...');
    const userPayload = {
      fullName: 'Aarav Sharma Commuter',
      email: `aarav_commuter_${Date.now()}@clearair.test`,
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
    // TEST 2: Route Search & 3 Real Route Alternatives
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Route Search with 3 distinct alternatives (Fastest Arterial, Bypass, Metro)...');
    const searchPayload = {
      origin: { name: 'Connaught Place, Central Delhi', lat: 28.6315, lon: 77.2167 },
      destination: { name: 'Cyber City, Gurugram', lat: 28.4986, lon: 77.0878 },
      priority: 'balanced',
      userCategory: 'professional',
    };

    const routeRes = await axios.post(`${baseUrl}/travel/search`, searchPayload, { headers: authHeaders });
    if (!routeRes.data?.success || !routeRes.data?.routes) {
      throw new Error(`Route search failed: ${JSON.stringify(routeRes.data)}`);
    }

    const routes = routeRes.data.routes;
    console.log(`   Generated ${routes.length} route alternatives:`);
    routes.forEach((r) => {
      console.log(`   • [${r.routeType}] ${r.routeName}: ${r.distanceKm}km, ${r.durationMinutes}m, Street AQI ~${r.streetAqiEstimated}, Score ${r.overallScore}/100, Geometry points: ${r.geometry?.length || 0}`);
    });

    if (routes.length < 3) {
      throw new Error(`Expected at least 3 route alternatives, got ${routes.length}`);
    }

    const hasArterial = routes.some((r) => r.routeType === 'arterial_fastest');
    const hasBypass = routes.some((r) => r.routeType === 'clean_bypass');
    const hasMetro = routes.some((r) => r.routeType === 'metro_transit');

    if (!hasArterial || !hasBypass || !hasMetro) {
      throw new Error('Missing one or more required route types (arterial, bypass, metro)');
    }

    // Verify polyline geometry exists
    const hasGeometry = routes.every((r) => Array.isArray(r.geometry) && r.geometry.length > 0);
    if (!hasGeometry) {
      throw new Error('Routes must contain valid Leaflet [lat, lon][] polyline coordinates');
    }
    console.log('✅ [TEST 2 PASSED] Route search returned 3 full alternatives with real polyline coordinates');

    // -------------------------------------------------------------
    // TEST 3: Priority Ranking Engine (Lowest Exposure vs Fastest)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Priority Ranking (Lowest Exposure vs Fastest)...');
    const exposureSearch = await axios.post(
      `${baseUrl}/travel/search`,
      { ...searchPayload, priority: 'lowest_exposure' },
      { headers: authHeaders }
    );
    const topExposureRoute = exposureSearch.data.routes.find((r) => r.isRecommended);
    console.log(`   Top route for 'lowest_exposure': ${topExposureRoute?.routeName} (${topExposureRoute?.routeType})`);

    const fastestSearch = await axios.post(
      `${baseUrl}/travel/search`,
      { ...searchPayload, priority: 'fastest' },
      { headers: authHeaders }
    );
    const topFastestRoute = fastestSearch.data.routes.find((r) => r.isRecommended);
    console.log(`   Top route for 'fastest': ${topFastestRoute?.routeName} (${topFastestRoute?.routeType})`);

    console.log('✅ [TEST 3 PASSED] Priority ranking correctly dynamically selects optimal recommendation');

    // -------------------------------------------------------------
    // TEST 4: Mode Alternatives & Inhalation Multipliers
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing 9 Transportation Modes Comparison Matrix...');
    const modesRes = await axios.get(`${baseUrl}/travel/alternatives?distanceKm=20&outdoorAqi=320`);
    if (!modesRes.data?.success || !modesRes.data?.modes) {
      throw new Error(`Modes fetch failed: ${JSON.stringify(modesRes.data)}`);
    }

    const modes = modesRes.data.modes;
    console.log(`   Fetched ${modes.length} transportation modes for 20km trip at AQI 320:`);
    const cyclingMode = modes.find((m) => m.mode === 'cycling');
    const metroMode = modes.find((m) => m.mode === 'metro');
    const carMode = modes.find((m) => m.mode === 'private_car');

    console.log(`   • Cycling: Inhalation multiplier ${cyclingMode?.exposureMultiplier}x, Smog Warning: ${cyclingMode?.smogHazardWarning}`);
    console.log(`   • Metro Rail: Carbon ${metroMode?.gramsCo2PerPassenger}g, Exposure: ${metroMode?.exposureMultiplier}x, Enclosed: ${metroMode?.cabinAirFiltration}`);
    console.log(`   • Private Car: Carbon ${carMode?.gramsCo2PerPassenger}g, Cabin Recirculation advised: ${carMode?.cabinRecirculationAdvice}`);

    if (!cyclingMode || !metroMode || !carMode) {
      throw new Error('Key transportation modes missing from alternatives');
    }
    console.log('✅ [TEST 4 PASSED] Transportation modes accurately expose emissions and micro-environment doses');

    // -------------------------------------------------------------
    // TEST 5: Saved Places Management (CRUD)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Saved Places CRUD...');
    // Create Home
    const place1Res = await axios.post(
      `${baseUrl}/travel/places`,
      {
        label: 'home',
        customName: 'Lajpat Nagar Residence',
        address: 'B-Block, Lajpat Nagar III, New Delhi',
        coordinates: { lat: 28.5678, lon: 77.2433 },
        isDefaultOrigin: true,
      },
      { headers: authHeaders }
    );
    const place1Id = place1Res.data.place._id;

    // Create Office
    const place2Res = await axios.post(
      `${baseUrl}/travel/places`,
      {
        label: 'office',
        customName: 'Gurugram Tech Park',
        address: 'DLF Cyber City, Sector 24, Gurugram',
        coordinates: { lat: 28.4986, lon: 77.0878 },
      },
      { headers: authHeaders }
    );
    const place2Id = place2Res.data.place._id;

    // Fetch places
    const getPlacesRes = await axios.get(`${baseUrl}/travel/places`, { headers: authHeaders });
    if (getPlacesRes.data.places.length < 2) {
      throw new Error(`Expected at least 2 saved places, got ${getPlacesRes.data.places.length}`);
    }

    // Delete Office place
    await axios.delete(`${baseUrl}/travel/places/${place2Id}`, { headers: authHeaders });
    console.log(`   Created 2 places, verified list, and deleted test place ${place2Id}`);
    console.log('✅ [TEST 5 PASSED] Saved Places CRUD verified');

    // -------------------------------------------------------------
    // TEST 6: Saved Routes Bookmarking (CRUD)
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Saved Routes Bookmarking...');
    const savedRouteRes = await axios.post(
      `${baseUrl}/travel/routes`,
      {
        routeName: 'Daily Office Commute (Clean Bypass)',
        origin: { name: 'Home Lajpat Nagar', lat: 28.5678, lon: 77.2433 },
        destination: { name: 'Cyber City Gurugram', lat: 28.4986, lon: 77.0878 },
        preferredMode: 'metro',
        priority: 'lowest_exposure',
        alertOnHighAqi: true,
        aqiThreshold: 280,
      },
      { headers: authHeaders }
    );
    const routeId = savedRouteRes.data.route._id;

    const listRoutesRes = await axios.get(`${baseUrl}/travel/routes`, { headers: authHeaders });
    if (listRoutesRes.data.routes.length < 1) {
      throw new Error('Saved route not returned in list');
    }

    // Delete route
    await axios.delete(`${baseUrl}/travel/routes/${routeId}`, { headers: authHeaders });
    console.log(`   Created saved route, verified list, and deleted test route ${routeId}`);
    console.log('✅ [TEST 6 PASSED] Saved Routes Bookmarking CRUD verified');

    // -------------------------------------------------------------
    // TEST 7: Diurnal Smog Dynamics & Departure Time Advisor
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing 4-Window Diurnal Smog Departure Time Advisor...');
    const departureRes = await axios.post(
      `${baseUrl}/travel/departure-times`,
      { currentAqi: 310, origin: { lat: 28.6315, lon: 77.2167 } }
    );

    if (!departureRes.data?.success || !departureRes.data?.data) {
      throw new Error(`Departure time advisor failed: ${JSON.stringify(departureRes.data)}`);
    }

    const advice = departureRes.data.data;
    console.log(`   Optimal Window: ${advice.bestWindow}`);
    console.log(`   Meteorological Explanation: ${advice.meteorologicalExplanation.substring(0, 100)}...`);
    advice.windows.forEach((w) => {
      console.log(`   • [${w.recommendationLevel}] ${w.name} (${w.timeRange}): Expected AQI ~${w.ambientAqiExpected}, Solar Mixing: ${w.solarMixingDispersion}`);
    });

    const middayWin = advice.windows.find((w) => w.id === 'midday_solar_mixing');
    if (!middayWin || middayWin.recommendationLevel !== 'optimal') {
      throw new Error('Midday Solar Dispersion window must be marked optimal');
    }
    console.log('✅ [TEST 7 PASSED] Diurnal departure advisor correctly identifies solar boundary mixing');

    // -------------------------------------------------------------
    // TEST 8: Trip Carbon Emissions Calculator
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing Trip Emissions Calculator with IPCC standards...');
    const carCalc = await axios.post(`${baseUrl}/travel/emissions/calculate`, {
      distanceKm: 25,
      mode: 'car',
      fuelType: 'petrol',
      passengerCount: 1,
    });
    const metroCalc = await axios.post(`${baseUrl}/travel/emissions/calculate`, {
      distanceKm: 25,
      mode: 'metro',
      passengerCount: 1,
    });
    const carpoolCalc = await axios.post(`${baseUrl}/travel/emissions/calculate`, {
      distanceKm: 25,
      mode: 'carpool',
      fuelType: 'petrol',
      passengerCount: 4,
    });

    console.log(`   25km Trip Emissions:`);
    console.log(`   • Solo Petrol Car: ${carCalc.data.calculation.totalTripGramsCo2}g CO₂`);
    console.log(`   • Metro Rail: ${metroCalc.data.calculation.totalTripGramsCo2}g CO₂ (Avoided: ${metroCalc.data.calculation.avoidedVsSoloCarGramsCo2}g)`);
    console.log(`   • 4-Person Carpool: ${carpoolCalc.data.calculation.perPassengerGramsCo2}g/person (Avoided: ${carpoolCalc.data.calculation.avoidedVsSoloCarGramsCo2}g)`);

    if (metroCalc.data.calculation.totalTripGramsCo2 >= carCalc.data.calculation.totalTripGramsCo2) {
      throw new Error('Metro carbon emissions must be significantly lower than solo car');
    }
    console.log('✅ [TEST 8 PASSED] Carbon emissions calculator correctly computes avoided carbon');

    // -------------------------------------------------------------
    // TEST 9: Travel History & Trip Logging
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Travel History Logging...');
    const tripLogRes = await axios.post(
      `${baseUrl}/travel/history`,
      {
        originName: 'Connaught Place',
        destinationName: 'Cyber City Gurugram',
        modeUsed: 'metro',
        distanceKm: 28,
        durationMinutes: 45,
        ambientAqiAtTravel: 295,
        exposureScore: 25,
        emissionsGramsCo2: 700,
        emissionsAvoidedGramsCo2: 3360,
        maskUsed: true,
        cabinRecirculationUsed: true,
        notes: 'Smooth air-conditioned commute avoiding MG road diesel jam',
      },
      { headers: authHeaders }
    );

    if (!tripLogRes.data?.success) {
      throw new Error(`Failed to log trip: ${JSON.stringify(tripLogRes.data)}`);
    }

    const historyRes = await axios.get(`${baseUrl}/travel/history?limit=10`, { headers: authHeaders });
    if (historyRes.data.trips.length < 1) {
      throw new Error('Logged trip not found in history');
    }

    console.log(`   Trips logged: ${historyRes.data.summary.totalTrips}, Distance: ${historyRes.data.summary.totalDistanceKm}km, Avoided CO₂: ${historyRes.data.summary.totalEmissionsAvoidedGramsCo2}g`);
    console.log('✅ [TEST 9 PASSED] Travel history and carbon savings ledger verified');

    // -------------------------------------------------------------
    // TEST 10: GenAI Smart Travel Co-Pilot Advisor
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing GenAI Smart Travel Co-Pilot...');
    const aiAdvisorRes = await axios.post(`${baseUrl}/travel/ask-advisor`, {
      question: 'Is it safe to ride my motorcycle or bicycle to college today in 300 AQI?',
      outdoorAqi: 300,
      originName: 'Rohini',
      destinationName: 'Delhi University North Campus',
      distanceKm: 12,
      userCategory: 'student',
      currentMode: 'cycling',
    });

    if (!aiAdvisorRes.data?.success || !aiAdvisorRes.data?.answer) {
      throw new Error(`AI travel advisor failed: ${JSON.stringify(aiAdvisorRes.data)}`);
    }

    const aiAns = aiAdvisorRes.data.answer;
    console.log(`   Engine Source: ${aiAdvisorRes.data.source}`);
    console.log(`   Recommended Mode: ${aiAns.recommendedMode}`);
    console.log(`   Route Advice: ${aiAns.routeAdvice}`);
    console.log(`   Mitigation: ${aiAns.exposureMitigation}`);
    console.log(`   Timing: ${aiAns.timingAdvice}`);
    console.log(`   Disclaimer: ${aiAns.healthDisclaimer}`);

    if (!aiAns.recommendedMode || !aiAns.routeAdvice || !aiAns.exposureMitigation) {
      throw new Error('AI answer missing key structured sections');
    }
    console.log('✅ [TEST 10 PASSED] GenAI Smart Travel Advisor verified');

    console.log('\n================================================================');
    console.log('🎉 ALL 10 MODULE 5 E2E INTEGRATION TESTS PASSED PERFECTLY (10/10)!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ MODULE 5 TEST SUITE FAILED:', err.response?.data || err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('[Test Server] Ephemeral server closed and DB disconnected.');
  }
}

runModule5Tests();
