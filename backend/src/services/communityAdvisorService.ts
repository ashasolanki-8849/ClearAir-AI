import axios from 'axios';
import Community from '../models/Community.js';
import PollutionReport from '../models/PollutionReport.js';
import { fetchRealtimeAQI } from './aqiService.js';

export interface ICommunityAIResponse {
  summary: string;
  community_context: string;
  identified_concerns: string[];
  recommended_actions: Array<{
    title: string;
    category: string;
    targetGroup: string;
    priority: 'immediate' | 'high' | 'medium';
    description: string;
    expectedOutcome: string;
  }>;
  implementation_steps: string[];
  estimated_resources: string[];
  limitations: string[];
  data_sources: string[];
}

export const getCommunityAIAdvice = async (
  communityId: string,
  userQuery?: string
): Promise<ICommunityAIResponse> => {
  const community = await Community.findById(communityId).lean();
  if (!community) {
    throw new Error('Community not found');
  }

  const { lat, lon } = community.location.coordinates;
  const aqiData = await fetchRealtimeAQI(lat, lon, community.location.city);

  // Retrieve recent incidents to provide localized grounding
  const recentReports = await PollutionReport.find({
    $or: [
      { communityId: community._id },
      { 'location.city': new RegExp(community.location.city, 'i') },
    ],
    status: { $in: ['submitted', 'verified', 'in_progress'] },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const aiResult = await callCommunityGeminiLLM(
        community,
        aqiData,
        recentReports,
        userQuery,
        geminiApiKey
      );
      if (aiResult && aiResult.summary && Array.isArray(aiResult.recommended_actions)) {
        return aiResult;
      }
    } catch (err: any) {
      console.warn(`[Community AI] Gemini call failed: ${err.message}. Using rule-based engine.`);
    }
  }

  // High-fidelity environmental fallback engine tailored to community type & ground-truth AQI
  return generateDeterministicCommunityAdvice(community, aqiData, recentReports, userQuery);
};

const callCommunityGeminiLLM = async (
  community: any,
  aqiData: any,
  recentReports: any[],
  userQuery?: string,
  apiKey?: string
): Promise<ICommunityAIResponse | null> => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are ClearAir AI's "Community Smog Advisor", an expert environmental consultant and public health specialist for collective community air quality action.

COMMUNITY PROFILE:
- Name: "${community.name}"
- Type: ${community.type} (e.g. residential_society, school, college, workplace, neighborhood)
- Location: ${community.location.locality}, ${community.location.city} (Lat: ${community.location.coordinates.lat}, Lon: ${community.location.coordinates.lon})
- Active Members: ${community.membersCount}
- Objectives: ${community.objectives.join(', ')}

REAL-TIME ENVIRONMENTAL DATA (GROUND TRUTH):
- Current Ambient AQI: ${aqiData.aqi} (${aqiData.aqiCategory})
- PM2.5: ${aqiData.pollutants.pm25} µg/m³, PM10: ${aqiData.pollutants.pm10} µg/m³
- Weather: ${aqiData.weather.temperature}°C, Humidity: ${aqiData.weather.humidity}%, Wind: ${aqiData.weather.windSpeed} km/h
- Data Source: ${aqiData.dataSource}

RECENT NEIGHBOURHOOD INCIDENTS:
${
  recentReports.length > 0
    ? recentReports.map((r) => `- [${r.category}] ${r.title}: ${r.severity} severity`).join('\n')
    : '- No unaddressed localized pollution incidents reported.'
}

USER INQUIRY:
${userQuery || 'What collective actions and safeguards should our community prioritize under current winter smog conditions?'}

CRITICAL GUIDELINES:
- Output MUST strictly be valid JSON conforming to the requested schema.
- NEVER fabricate air quality readings or claim community actions single-handedly altered citywide ambient AQI.
- Focus on practical, collective solutions (RWA enforcement, gate wet-sweeping, stopping garbage fires, indoor filtration in common areas, student alerts, carpooling).

Respond ONLY with valid JSON in this format:
{
  "summary": "Concise overview of environmental situation and collective action required",
  "community_context": "Tailored context specific to ${community.type}",
  "identified_concerns": ["list of 3-4 specific concerns"],
  "recommended_actions": [
    {
      "title": "Action title",
      "category": "infrastructure | operational | awareness | policy",
      "targetGroup": "All residents / Administration / Maintenance staff",
      "priority": "immediate | high | medium",
      "description": "Specific actionable steps",
      "expectedOutcome": "Measurable local benefit"
    }
  ],
  "implementation_steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "estimated_resources": ["Water tankers for misting", "N95 masks for security guards", "Notice board signage"],
  "limitations": ["Ambient regional smog cannot be eliminated solely by local community actions"],
  "data_sources": ["CPCB Monitoring Station", "OpenWeather AQI Engine", "ClearAir Citizen Reports"]
}`;

  const response = await axios.post(
    endpoint,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    },
    { timeout: 10000 }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return JSON.parse(text);
};

const generateDeterministicCommunityAdvice = (
  community: any,
  aqiData: any,
  recentReports: any[],
  userQuery?: string
): ICommunityAIResponse => {
  const isSevere = aqiData.aqi >= 300;
  const isPoor = aqiData.aqi >= 200;
  const type = community.type;

  let summary = '';
  const identifiedConcerns: string[] = [];
  const recommendedActions: any[] = [];
  const implementationSteps: string[] = [];
  const estimatedResources: string[] = [];

  if (isSevere) {
    summary = `CRITICAL SMOG ALERT: Ambient AQI in ${community.location.city} is currently ${aqiData.aqi} (${aqiData.aqiCategory}). Immediate community emergency containment and vulnerable group shielding are required.`;
    identifiedConcerns.push(
      `Extreme particulate concentration (PM2.5: ${aqiData.pollutants.pm25} µg/m³) exceeding WHO guidelines by multiple factors`,
      'Outdoor staff and security guards exposed to hazardous air without continuous respiratory protection',
      'Potential unauthorized night-time biomass or garbage burning in nearby vacant plots',
      'Infiltration of fine toxic smog into community common areas, lobbies, and classrooms'
    );
  } else if (isPoor) {
    summary = `ELEVATED POLLUTION WARNING: AQI is ${aqiData.aqi} (${aqiData.aqiCategory}). Active dust mitigation, zero-burning vigilance, and indoor air purification protocols should be deployed.`;
    identifiedConcerns.push(
      'Unpaved road dust resuspension during morning peak movement',
      'Dry sweeping in outdoor corridors scattering fine particles into breathing zones',
      'Uncontrolled diesel generator (DG) usage during power transitions'
    );
  } else {
    summary = `MODERATE CONDITIONS: Current AQI is ${aqiData.aqi} (${aqiData.aqiCategory}). Ideal window for preventive community maintenance, tree canopy washing, and green campaign mobilization.`;
    identifiedConcerns.push(
      'Periodic early morning haze accumulation due to thermal inversion',
      'Need for proactive solid waste segregation to prevent future illegal dumping'
    );
  }

  // Type-specific tailoring
  if (type === 'residential_society') {
    recommendedActions.push(
      {
        title: 'Mandatory Wet-Mopping & Anti-Dust Misting',
        category: 'operational',
        targetGroup: 'Housekeeping & Maintenance Team',
        priority: isSevere ? 'immediate' : 'high',
        description:
          'Prohibit dry broom sweeping in society driveways, podiums, and basements. Transition entirely to wet mopping and water spraying on perimeter trees twice daily.',
        expectedOutcome: 'Reduces resuspended coarse PM10 dust on society grounds by up to 40%.',
      },
      {
        title: 'Thermal Guard Protective Gear & Clean Heated Rooms',
        category: 'welfare',
        targetGroup: 'Security Guards & Gate Staff',
        priority: 'immediate',
        description:
          'Provide N95 masks to outdoor security guards and domestic staff. Strictly prohibit open wood/refuse fires for warmth during night shifts; provide electric fan heaters in guard cabins.',
        expectedOutcome: 'Prevents acute respiratory exposure and eliminates point-source toxic smoke.',
      },
      {
        title: 'Door-to-Door Zero Garbage Burning Patrol',
        category: 'policy',
        targetGroup: 'RWA Committee & Residents',
        priority: 'high',
        description:
          'Establish a volunteer evening patrol to monitor boundary walls and adjacent plots. Ensure horticultural waste is composted on-site and never torched.',
        expectedOutcome: 'Zero illegal burning incidents in the society perimeter.',
      }
    );

    implementationSteps.push(
      '1. Issue official RWA circular via community noticeboard and ClearAir App',
      '2. Equip estate management with wet-cleaning spray nozzles and electric heaters',
      '3. Form a 3-member resident green taskforce to inspect composting pits',
      '4. Monitor local citizen incident reports on the ClearAir Hotspot Map'
    );

    estimatedResources.push(
      '2x Garden hose water-misting attachments',
      'Electric quartz heaters for 4 guard kiosks',
      'Batch of 100 ISI-certified N95 respirators',
      'Designated covered leaf-composting enclosure'
    );
  } else if (type === 'school' || type === 'college') {
    recommendedActions.push(
      {
        title: 'Suspend Outdoor Assemblies & Sports during Peak Smog',
        category: 'operational',
        targetGroup: 'School Administration & Physical Education Dept',
        priority: isSevere ? 'immediate' : 'high',
        description:
          'Relocate morning prayer assemblies and physical education classes indoors whenever ambient AQI exceeds 250. Keep classroom windows and doors sealed during peak traffic hours.',
        expectedOutcome: 'Shields growing children from deep alveolar particulate penetration.',
      },
      {
        title: 'Indoor Air Quality Sanctuaries in Libraries & Computer Labs',
        category: 'infrastructure',
        targetGroup: 'Facility Managers',
        priority: 'high',
        description:
          'Equip high-occupancy central halls and libraries with HEPA filtration units and indoor AQI displays to serve as clean air shelters during severe smog days.',
        expectedOutcome: 'Maintains indoor PM2.5 levels under 35 µg/m³ in study zones.',
      },
      {
        title: 'Student Green Ambassadors Clean Air Audit',
        category: 'awareness',
        targetGroup: 'Students & Eco-Club Volunteers',
        priority: 'medium',
        description:
          'Mobilize students to map car-idling zones outside the school gate at pick-up times and enforce a strict 1-minute engine turn-off rule.',
        expectedOutcome: 'Cuts toxic localized NO2 and VOC emissions outside school gates by 60%.',
      }
    );

    implementationSteps.push(
      '1. Notify parents and teachers of the revised indoor physical activity schedule',
      '2. Inspect and seal classroom window frames against drafts',
      '3. Train security staff to enforce no-idling policies in student pick-up bays',
      '4. Launch weekly eco-club air quality monitoring dashboard'
    );

    estimatedResources.push(
      'Central HEPA air purifiers for assembly / library rooms',
      'No-Idling metal signage for bus drop-off gates',
      'Educational smog infographics for classroom noticeboards'
    );
  } else if (type === 'workplace') {
    recommendedActions.push(
      {
        title: 'Staggered Shifts & Flexible Remote Work Protocol',
        category: 'policy',
        targetGroup: 'Human Resources & Operations',
        priority: isSevere ? 'immediate' : 'high',
        description:
          'Enable work-from-home or staggered 10:30 AM arrival times during severe smog peaks to avoid morning rush-hour smog spikes and reduce fleet vehicular load.',
        expectedOutcome: 'Lowers commuter exposure to peak morning pollution inversion.',
      },
      {
        title: 'HVAC Air Intake Filter Upgrade & Continuous Monitoring',
        category: 'infrastructure',
        targetGroup: 'Building Engineering Team',
        priority: 'high',
        description:
          'Verify MERV 13+ or secondary carbon pre-filters on building fresh-air intake units. Recirculate indoor air with purification when outdoor AQI surpasses 350.',
        expectedOutcome: 'Protects workforce health, reduces sick leave, and sustains cognitive clarity.',
      },
      {
        title: 'Corporate Carpooling & Last-Mile Electric Shuttle Drive',
        category: 'awareness',
        targetGroup: 'All Employees',
        priority: 'medium',
        description:
          'Incentivize shared commuting via reserved carpool parking spots and shuttle service from nearest metro stations.',
        expectedOutcome: 'Direct reduction in single-occupant commuter vehicle miles.',
      }
    );

    implementationSteps.push(
      '1. Issue company-wide health advisory on air quality thresholds',
      '2. Audit building HVAC filtration schedules and CO2 / PM2.5 sensors',
      '3. Activate carpooling coordination board on ClearAir AI Community Hub'
    );

    estimatedResources.push(
      'HVAC MERV-13 filter replacement sets',
      'Reserved carpool bay stencils and signage',
      'Subsidized corporate metro pass credits'
    );
  } else {
    // Neighborhood / Environmental Group
    recommendedActions.push(
      {
        title: 'Neighbourhood Garbage Burning Rapid Response Squad',
        category: 'operational',
        targetGroup: 'Community Volunteers & Ward Marshals',
        priority: 'immediate',
        description:
          'Deploy active citizen reporting using ClearAir AI to document, photograph, and alert municipal authorities to illegal open waste and leaf burning spots.',
        expectedOutcome: 'Rapid dousing of ground fires within 45 minutes of reporting.',
      },
      {
        title: 'Pothole & Road Dust Spraying Campaign',
        category: 'infrastructure',
        targetGroup: 'Municipal Ward Coordinators',
        priority: 'high',
        description:
          'Coordinate with local municipal ward offices for mechanical road sweeper deployments and anti-smog mist cannon runs on arterial neighborhood roads.',
        expectedOutcome: 'Suppression of resuspension dust plumes across public corridors.',
      }
    );

    implementationSteps.push(
      '1. Map chronic local waste dumping and burning points on the ClearAir Hotspot Map',
      '2. Submit consolidated incident dossiers to local municipal authorities',
      '3. Host weekend citizen awareness walk with respiratory protection'
    );

    estimatedResources.push(
      'ClearAir AI Citizen Reporting Map tool',
      'High-visibility volunteer jackets',
      'Direct municipal grievance escalation contact list'
    );
  }

  return {
    summary,
    community_context: `Tailored advisory for ${community.name} (${community.type.replace('_', ' ').toUpperCase()}) located in ${community.location.locality}, ${community.location.city}.`,
    identified_concerns: identifiedConcerns,
    recommended_actions: recommendedActions,
    implementation_steps: implementationSteps,
    estimated_resources: estimatedResources,
    limitations: [
      'Local mitigation reduces immediate exposure but cannot eliminate regional thermal inversion smog without broader macro policy enforcement.',
      'Always refer to official CPCB / IMD bulletins for legally binding GRAP stage restrictions.',
    ],
    data_sources: [
      `${aqiData.dataSource} (Ambient Monitoring Station)`,
      'OpenWeather Air Pollution Engine',
      'CPCB National Air Quality Index Guidelines',
      'ClearAir Verified Community Citizen Reports',
    ],
  };
};
