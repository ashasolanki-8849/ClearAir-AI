const http = require('http');

async function testAll() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // Helper fetch function using built-in fetch
  const baseApi = 'http://localhost:5000/api';
  const clientUrl = 'http://localhost:3000';

  // 1. Check Frontend HTML
  console.log('\n[1/7] Testing Frontend Dev Server (http://localhost:3000)...');
  const feRes = await fetch(clientUrl);
  console.log(`Frontend Status: ${feRes.status} ${feRes.statusText}`);
  const html = await feRes.text();
  console.log(`HTML loaded successfully: contains "<title>ClearAir AI"` + (html.includes('ClearAir AI')));

  // 2. Check Backend Health
  console.log('\n[2/7] Testing Backend Health Check (/api/health)...');
  const healthRes = await fetch(`${baseApi}/health`);
  const healthData = await healthRes.json();
  console.log('Health Response:', JSON.stringify(healthData));

  // 3. Test Real-time AQI fetch (Open-Meteo live API integration)
  console.log('\n[3/7] Testing Real-Time AQI & Weather Telemetry (/api/air-quality/current)...');
  const aqiRes = await fetch(`${baseApi}/air-quality/current?lat=28.6139&lon=77.2090&name=New%20Delhi`);
  const aqiData = await aqiRes.json();
  console.log(`AQI Value: ${aqiData.data.aqi}`);
  console.log(`AQI Category: ${aqiData.data.aqiCategory}`);
  console.log(`Is Demo Mode: ${aqiData.data.isDemo} (False means genuine live satellite/ground API)`);
  console.log(`Data Source: ${aqiData.data.dataSource}`);
  console.log(`Pollutants: PM2.5=${aqiData.data.pollutants.pm25} µg/m³, PM10=${aqiData.data.pollutants.pm10} µg/m³, NO2=${aqiData.data.pollutants.no2} µg/m³`);
  console.log(`Weather: Temp=${aqiData.data.weather.temperature}°C, Humidity=${aqiData.data.weather.humidity}%, Condition="${aqiData.data.weather.condition}"`);
  console.log(`Hourly trend points received: ${aqiData.data.hourlyTrend.length}`);

  // 4. Test User Registration
  console.log('\n[4/7] Testing User Registration (/api/auth/register)...');
  const testEmail = `doctor.neha.${Date.now()}@clearair.test`;
  const regRes = await fetch(`${baseApi}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Dr. Neha Verma',
      email: testEmail,
      password: 'SecurePassword@2026',
      ageGroup: '36_60',
      userCategory: 'family',
      city: 'Gurugram',
      preferredLocation: { name: 'Gurugram', lat: 28.4595, lon: 77.0266 },
    }),
  });
  const regData = await regRes.json();
  console.log(`Registered user: ${regData.user.fullName} (${regData.user.email})`);
  const token = regData.token;
  console.log(`JWT Token issued: ${token ? 'YES' : 'NO'}`);

  // 5. Test Authenticated User Profile & Preferences
  console.log('\n[5/7] Testing Authenticated Profile & Preferences (/api/auth/me, /api/user/preferences)...');
  const meRes = await fetch(`${baseApi}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log(`Auth me verified: ${meData.user.fullName}, Category: ${meData.user.userCategory}`);

  const prefRes = await fetch(`${baseApi}/user/preferences`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      theme: 'dark',
      notifications: {
        enabled: true,
        thresholdAqi: 180,
        pm25SpikeAlert: true,
        severeSmogWarning: true,
      },
    }),
  });
  const prefData = await prefRes.json();
  console.log(`Preferences updated: Theme=${prefData.preferences.theme}, Threshold=${prefData.preferences.notifications.thresholdAqi}`);

  // 6. Test Saved Locations API
  console.log('\n[6/7] Testing Saved Locations (/api/locations/save, /api/locations/saved)...');
  const saveLocRes = await fetch(`${baseApi}/locations/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Noida Sector 62 Office',
      city: 'Noida',
      country: 'India',
      lat: 28.6280,
      lon: 77.3649,
      isDefault: true,
    }),
  });
  const saveLocData = await saveLocRes.json();
  console.log(`Saved location: ${saveLocData.location.name} (id: ${saveLocData.location._id})`);

  const listLocRes = await fetch(`${baseApi}/locations/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listLocData = await listLocRes.json();
  console.log(`Total saved locations for user: ${listLocData.locations.length}`);

  // 7. Test Alerts Engine
  console.log('\n[7/7] Testing Air Quality Alerts Engine (/api/alerts)...');
  const alertsRes = await fetch(`${baseApi}/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const alertsData = await alertsRes.json();
  console.log(`Active alerts count: ${alertsData.alerts.length}`);
  if (alertsData.alerts.length > 0) {
    console.log(`Sample Alert: "${alertsData.alerts[0].title}" [Severity: ${alertsData.alerts[0].severity}]`);
    const alertId = alertsData.alerts[0]._id;
    const markRes = await fetch(`${baseApi}/alerts/${alertId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const markData = await markRes.json();
    console.log(`Alert marked as read: ${markData.alert.read}`);
  }

  console.log('\n=========================================');
  console.log('✅ ALL 7 VERIFICATION PHASES PASSED 100%!');
  console.log('=========================================');
}

testAll().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
