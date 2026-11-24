import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB, disconnectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import authRoutes from './src/routes/authRoutes';
import forecastRoutes from './src/routes/forecastRoutes';
import airQualityRoutes from './src/routes/airQualityRoutes';

dotenv.config();

async function runModule6Tests() {
  console.log('================================================================');
  console.log('🧪 STARTING MODULE 6: POLLUTION FORECAST & AI PREDICTION ENGINE');
  console.log('   FULL END-TO-END VERIFICATION TEST SUITE');
  console.log('================================================================');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/air-quality', airQualityRoutes);
  app.use('/api/forecast', forecastRoutes);
  app.use(errorHandler);

  const testPort = 5059;
  const server = app.listen(testPort);
  console.log(`[Test Server] Ephemeral server running on port ${testPort}`);

  const baseUrl = `http://localhost:${testPort}/api`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Register User and get JWT
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Registering forecast researcher test user...');
    const userPayload = {
      fullName: 'Aarav Sharma Forecaster',
      email: `aarav_forecast_${Date.now()}@clearair.test`,
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
    // TEST 2: Current Forecast Overview & Telemetry
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Current Forecast Overview & Telemetry...');
    const curRes = await axios.get(`${baseUrl}/forecast/current?lat=28.6139&lon=77.2090&name=Connaught+Place`, {
      headers: authHeaders,
    });
    if (!curRes.data?.success) {
      throw new Error(`Current forecast failed: ${JSON.stringify(curRes.data)}`);
    }
    const curData = curRes.data;
    if (typeof curData.currentAqi !== 'number' || !curData.currentCategory) {
      throw new Error(`Invalid current forecast payload: ${JSON.stringify(curData)}`);
    }
    console.log(`✅ [TEST 2 PASSED] Current Ground AQI: ${curData.currentAqi} (${curData.currentCategory}), Confidence: ${curData.confidenceScore}, Data Source: ${curData.dataSource}`);

    // -------------------------------------------------------------
    // TEST 3: Hourly Forecast Retrieval (1h to 48h)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Hourly Forecast Model (24 hours horizon)...');
    const hourlyRes = await axios.get(`${baseUrl}/forecast/hourly?lat=28.6139&lon=77.2090&hours=24`, {
      headers: authHeaders,
    });
    if (!hourlyRes.data?.success || !Array.isArray(hourlyRes.data.hourlyForecast)) {
      throw new Error(`Hourly forecast failed: ${JSON.stringify(hourlyRes.data)}`);
    }
    const hours = hourlyRes.data.hourlyForecast;
    if (hours.length === 0) {
      throw new Error(`Hourly forecast returned 0 points`);
    }
    const sampleH = hours[0];
    if (sampleH.aqi === undefined || sampleH.pollutants?.pm25 === undefined) {
      throw new Error(`Hourly item missing fields: ${JSON.stringify(sampleH)}`);
    }
    console.log(`✅ [TEST 3 PASSED] Retrieved ${hours.length} hourly prediction points. Next hour: AQI ${sampleH.aqi} (${sampleH.category}), PM2.5: ${sampleH.pollutants.pm25} µg/m³`);

    // -------------------------------------------------------------
    // TEST 4: 7-Day Synoptic Daily Forecast Aggregates
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing 7-Day Synoptic Daily Forecast Aggregates...');
    const dailyRes = await axios.get(`${baseUrl}/forecast/daily?lat=28.6139&lon=77.2090&days=7`, {
      headers: authHeaders,
    });
    if (!dailyRes.data?.success || !Array.isArray(dailyRes.data.dailyForecast)) {
      throw new Error(`Daily forecast failed: ${JSON.stringify(dailyRes.data)}`);
    }
    const days = dailyRes.data.dailyForecast;
    if (days.length === 0) {
      throw new Error(`Daily forecast returned 0 days`);
    }
    const day1 = days[0];
    console.log(`✅ [TEST 4 PASSED] Retrieved ${days.length} daily synoptic forecasts. Day 1: ${day1.dayName} - Avg AQI ${day1.avgAqi} (Range ${day1.minAqi}-${day1.maxAqi}), Precaution: "${day1.healthPrecaution.substring(0, 45)}..."`);

    // -------------------------------------------------------------
    // TEST 5: 6-Pollutant Trajectory Matrix
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Multi-Pollutant Forecast Grid (6 Species)...');
    const polRes = await axios.get(`${baseUrl}/forecast/pollutants?lat=28.6139&lon=77.2090`, {
      headers: authHeaders,
    });
    if (!polRes.data?.success || !Array.isArray(polRes.data.pollutants)) {
      throw new Error(`Pollutants forecast failed: ${JSON.stringify(polRes.data)}`);
    }
    const pollutants = polRes.data.pollutants;
    const pm25 = pollutants.find((p) => p.id === 'pm25');
    const no2 = pollutants.find((p) => p.id === 'no2');
    if (!pm25 || !no2) {
      throw new Error(`Missing expected pollutants PM2.5 or NO2: ${JSON.stringify(pollutants.map((p) => p.id))}`);
    }
    console.log(`✅ [TEST 5 PASSED] Retrieved ${pollutants.length} pollutants. PM2.5: Current ${pm25.currentValue} µg/m³ -> 24h ${pm25.forecast24h} µg/m³ (${pm25.trend}), NO2: Current ${no2.currentValue} -> 24h ${no2.forecast24h}`);

    // -------------------------------------------------------------
    // TEST 6: Historical Analytics & Trend Distribution
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Historical Analytics (7-day range)...');
    const histRes = await axios.get(`${baseUrl}/forecast/history?lat=28.6139&lon=77.2090&range=7d`, {
      headers: authHeaders,
    });
    if (!histRes.data?.success) {
      throw new Error(`Historical analytics failed: ${JSON.stringify(histRes.data)}`);
    }
    console.log(`✅ [TEST 6 PASSED] Range: ${histRes.data.range}, Total Obs: ${histRes.data.totalObservations}, Avg AQI: ${histRes.data.averageAqi}, Max AQI: ${histRes.data.maxRecordedAqi}`);

    // -------------------------------------------------------------
    // TEST 7: Pollution Trend Analysis & Diurnal Patterns
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Testing AI Trend Analysis & Diurnal Cycles...');
    const trendRes = await axios.get(`${baseUrl}/forecast/trends?lat=28.6139&lon=77.2090`, {
      headers: authHeaders,
    });
    if (!trendRes.data?.success || !trendRes.data.trendAnalysis) {
      throw new Error(`Trend analysis failed: ${JSON.stringify(trendRes.data)}`);
    }
    const trend = trendRes.data.trendAnalysis;
    console.log(`✅ [TEST 7 PASSED] Trend: ${trend.currentTrend} (Score: ${trend.trendScore}/100), Peak Hour: ${trend.peakHour?.time || 'N/A'} (AQI ${trend.peakHour?.expectedAqi}), Diurnal Inversion: ${trend.diurnalPattern?.morningInversionRisk ? 'Active' : 'Moderate'}`);

    // -------------------------------------------------------------
    // TEST 8: Statistical Anomaly & Spike Detection (Rolling z-scores)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing Statistical Anomaly & Spike Detection...');
    const anomRes = await axios.get(`${baseUrl}/forecast/anomalies?lat=28.6139&lon=77.2090`, {
      headers: authHeaders,
    });
    if (!anomRes.data?.success) {
      throw new Error(`Anomaly detection failed: ${JSON.stringify(anomRes.data)}`);
    }
    console.log(`✅ [TEST 8 PASSED] Evaluated anomalies. Count: ${anomRes.data.anomalyCount}, Baseline Ground AQI: ${anomRes.data.currentAqi}`);

    // -------------------------------------------------------------
    // TEST 9: Cross-Location Forecast Comparison
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Cross-Location Forecast Comparison...');
    const compRes = await axios.post(`${baseUrl}/forecast/locations/compare`, {}, {
      headers: authHeaders,
    });
    if (!compRes.data?.success || !Array.isArray(compRes.data.comparisons)) {
      throw new Error(`Location comparison failed: ${JSON.stringify(compRes.data)}`);
    }
    console.log(`✅ [TEST 9 PASSED] Compared ${compRes.data.comparisons.length} locations. First: ${compRes.data.comparisons[0]?.name} (AQI: ${compRes.data.comparisons[0]?.currentAqi}, 24h Peak: ${compRes.data.comparisons[0]?.forecast24hPeak})`);

    // -------------------------------------------------------------
    // TEST 10: Early Warning Center & AI Explainability Engine
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing Early Warning Center & AI Explainability Engine...');
    const alertRes = await axios.get(`${baseUrl}/forecast/alerts?lat=28.6139&lon=77.2090`, {
      headers: authHeaders,
    });
    if (!alertRes.data?.success || !Array.isArray(alertRes.data.alerts)) {
      throw new Error(`Early warnings failed: ${JSON.stringify(alertRes.data)}`);
    }

    const explainRes = await axios.post(
      `${baseUrl}/forecast/explain`,
      {
        currentAqi: 284,
        forecastAqi: 310,
        windSpeed: 3.8,
        temperature: 15.2,
        humidity: 82,
        trend: 'rising_slow',
        userCategory: 'student',
      },
      { headers: authHeaders }
    );
    if (!explainRes.data?.success || !explainRes.data.explanation) {
      throw new Error(`Explainability failed: ${JSON.stringify(explainRes.data)}`);
    }
    const exp = explainRes.data.explanation;
    console.log(`✅ [TEST 10 PASSED] Early Warnings: ${alertRes.data.alerts.length} alerts generated.`);
    console.log(`   AI Explainer: "${exp.headline}"`);
    console.log(`   Physical Mechanism: "${exp.scientificExplanation.substring(0, 90)}..."`);
    console.log(`   Source: ${explainRes.data.source}`);

    // Evaluation verification
    const evalRes = await axios.get(`${baseUrl}/forecast/evaluation?lat=28.6139&lon=77.2090`, {
      headers: authHeaders,
    });
    if (evalRes.data?.success) {
      console.log(`   Model Accuracy Tracking: MAE ±${evalRes.data.evaluation.overallMae} AQI points (n=${evalRes.data.evaluation.totalEvaluatedObservations} obs)`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL 10 MODULE 6 END-TO-END VERIFICATION TESTS PASSED!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ MODULE 6 TEST SUITE FAILED:', err.message);
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

runModule6Tests();
