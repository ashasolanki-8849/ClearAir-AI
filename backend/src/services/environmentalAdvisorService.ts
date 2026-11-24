import axios from 'axios';
import { getDashboardAnalytics } from './environmentalAnalyticsService.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';
import { User } from '../models/User.js';

export interface IImpactAIAdvisorResponse {
  summary: string;
  key_findings: string[];
  main_impact_categories: Array<{
    category: string;
    emissionsKgCO2e: number;
    sharePercentage: number;
  }>;
  period_comparison: Record<string, any>;
  recommended_actions: Array<{
    title: string;
    category: string;
    expectedReductionKgCO2e: number;
    priority: 'immediate' | 'high' | 'medium';
    description: string;
  }>;
  calculation_explanations: string[];
  data_limitations: string[];
  data_sources: string[];
}

export const getImpactAIAdvice = async (
  userId: string,
  userMessage?: string
): Promise<IImpactAIAdvisorResponse> => {
  const summary = await getDashboardAnalytics(userId, 'this_month');
  const goals = await EnvironmentalGoal.find({ userId, status: 'active' }).lean();

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const response = await callImpactGeminiLLM(summary, goals, userMessage, geminiApiKey);
      if (response && response.summary && Array.isArray(response.recommended_actions)) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[Impact AI] Gemini call failed: ${err.message}. Using rule-based calculation advisor.`);
    }
  }

  return generateDeterministicImpactAdvice(summary, goals, userMessage);
};

const callImpactGeminiLLM = async (
  summary: any,
  goals: any[],
  userMessage?: string,
  apiKey?: string
): Promise<IImpactAIAdvisorResponse | null> => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are ClearAir AI's "Environmental Impact Advisor", an expert climate data scientist and public health environmental consultant.

ACTUAL RECORDED USER DATA (STRICT GROUND TRUTH - DO NOT INVENT NUMBERS):
- Total Recorded Carbon Footprint: ${summary.totalCarbonFootprintKgCO2e} kg CO2e
- Transportation: ${summary.breakdown.transportationKgCO2e} kg CO2e (${summary.sharesPercentage.transportation}%)
- Electricity: ${summary.breakdown.electricityKgCO2e} kg CO2e (${summary.sharesPercentage.electricity}%)
- Household Fuel: ${summary.breakdown.householdFuelKgCO2e} kg CO2e (${summary.sharesPercentage.householdFuel}%)
- Waste Impact: ${summary.breakdown.wasteKgCO2e} kg CO2e (${summary.sharesPercentage.waste}%)
- Total Logged Distance: ${summary.resourceMetrics.totalDistanceKm} km
- Total Logged Electricity: ${summary.resourceMetrics.electricityKwh} kWh
- Active Environmental Goals: ${goals.map((g) => `${g.title} (${g.currentValue}/${g.targetValue} ${g.unit})`).join(', ') || 'None set'}

USER INQUIRY:
${userMessage || 'How can I most effectively reduce my recorded carbon footprint this month?'}

CRITICAL GUIDELINES:
1. Output strictly valid JSON.
2. NEVER confuse carbon footprint (CO2-equivalent greenhouse gases) with ambient AQI (PM2.5 particulate matter).
3. Base all explanations directly on the user's recorded input numbers above.

Respond ONLY with JSON matching this structure:
{
  "summary": "Concise analytical summary of user's environmental footprint",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "main_impact_categories": [
    { "category": "transportation", "emissionsKgCO2e": ${summary.breakdown.transportationKgCO2e}, "sharePercentage": ${summary.sharesPercentage.transportation} },
    { "category": "electricity", "emissionsKgCO2e": ${summary.breakdown.electricityKgCO2e}, "sharePercentage": ${summary.sharesPercentage.electricity} }
  ],
  "period_comparison": { "currentPeriod": "${summary.periodLabel}", "status": "Evaluated against baseline" },
  "recommended_actions": [
    {
      "title": "Action title",
      "category": "transportation | energy | waste | water",
      "expectedReductionKgCO2e": 15.5,
      "priority": "immediate | high | medium",
      "description": "Specific action"
    }
  ],
  "calculation_explanations": ["Explained using CEA 0.716 kg/kWh and BEE transport factors"],
  "data_limitations": ["Only includes activities entered by user"],
  "data_sources": ["Central Electricity Authority (CEA)", "IPCC 2006 Mobile Combustion", "CPCB Waste Guidelines"]
}`;

  const res = await axios.post(
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

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return JSON.parse(text);
};

const generateDeterministicImpactAdvice = (
  summary: any,
  goals: any[],
  userMessage?: string
): IImpactAIAdvisorResponse => {
  const total = summary.totalCarbonFootprintKgCO2e;
  const trans = summary.breakdown.transportationKgCO2e;
  const elec = summary.breakdown.electricityKgCO2e;

  const keyFindings: string[] = [];
  const recommendedActions: any[] = [];

  if (total === 0) {
    keyFindings.push(
      'No greenhouse gas emissions have been logged for this period yet.',
      'Enter your commute distance or monthly electricity bill to calculate your empirical baseline.'
    );
    recommendedActions.push({
      title: 'Log Morning Commute',
      category: 'transportation',
      expectedReductionKgCO2e: 4.2,
      priority: 'high',
      description: 'Enter your daily travel distance and mode in the Carbon Footprint calculator.',
    });
  } else {
    keyFindings.push(
      `Your total recorded carbon footprint for ${summary.periodLabel} is ${total} kg CO2e.`,
      trans > elec
        ? `Transportation represents your largest recorded carbon emission source at ${summary.sharesPercentage.transportation}% (${trans} kg CO2e).`
        : `Electricity consumption is your primary recorded emission source at ${summary.sharesPercentage.electricity}% (${elec} kg CO2e).`,
      summary.resourceMetrics.wasteDivertedKg > 0
        ? `You successfully diverted ${summary.resourceMetrics.wasteDivertedKg} kg of waste from open burning and landfills.`
        : 'Solid waste records are not yet logged for this billing period.'
    );

    if (trans > 0) {
      recommendedActions.push({
        title: 'Transition 2 Weekly Car Trips to Metro / Bus',
        category: 'transportation',
        expectedReductionKgCO2e: Number((trans * 0.35).toFixed(1)),
        priority: 'high',
        description:
          'Metro rail electric traction emits only 0.028 kg CO2e/pkm compared with 0.192 kg CO2e/km for petrol cars, cutting transit footprint by up to 85% per trip.',
      });
    }

    if (elec > 0) {
      recommendedActions.push({
        title: 'Set AC Temperature to BEE-Recommended 24°C',
        category: 'energy',
        expectedReductionKgCO2e: Number((elec * 0.12).toFixed(1)),
        priority: 'immediate',
        description:
          'Every 1°C increase in thermostat setting reduces continuous compressor load by ~6%, saving ~1.2 kWh daily.',
      });
    }

    recommendedActions.push({
      title: 'Maintain Two-Bin Domestic Waste Segregation',
      category: 'waste',
      expectedReductionKgCO2e: 8.5,
      priority: 'medium',
      description:
        'Prevents mixed garbage dumping and eliminates toxic open burning in vacant neighbourhood plots.',
    });
  }

  return {
    summary:
      total > 0
        ? `Your evaluated carbon footprint is ${total} kg CO2e for ${summary.periodLabel}. Transportation and electricity form your primary target intervention areas.`
        : 'Your environmental impact profile is awaiting activity inputs. Log your commute or energy consumption to receive continuous analytics.',
    key_findings: keyFindings,
    main_impact_categories: [
      { category: 'Transportation', emissionsKgCO2e: trans, sharePercentage: summary.sharesPercentage.transportation },
      { category: 'Electricity', emissionsKgCO2e: elec, sharePercentage: summary.sharesPercentage.electricity },
      { category: 'Household Fuel', emissionsKgCO2e: summary.breakdown.householdFuelKgCO2e, sharePercentage: summary.sharesPercentage.householdFuel },
      { category: 'Waste', emissionsKgCO2e: summary.breakdown.wasteKgCO2e, sharePercentage: summary.sharesPercentage.waste },
    ],
    period_comparison: {
      period: summary.periodLabel,
      dataSufficient: summary.hasSufficientData,
    },
    recommended_actions: recommendedActions,
    calculation_explanations: [
      'Electricity calculated via Central Electricity Authority (CEA) India grid factor (0.716 kg CO2e/kWh).',
      'Vehicle emissions calculated from Bureau of Energy Efficiency (BEE) fuel efficiency baselines.',
      'Waste diversion emissions calculated using CPCB anaerobic decay avoidance factors.',
    ],
    data_limitations: [
      'Calculations reflect only activities manually entered or connected via previous modules.',
      'Atmospheric winter smog (PM2.5) is tracked separately and does not correlate 1:1 with personal carbon footprint.',
    ],
    data_sources: [
      'Central Electricity Authority (CEA) Baseline Database v19',
      'Bureau of Energy Efficiency (BEE) Fleet Inventory',
      'IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
      'CPCB Solid Waste Management Guidelines',
    ],
  };
};
