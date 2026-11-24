import axios from 'axios';
import { UserSustainabilityProfile } from '../models/UserSustainabilityProfile.js';

export interface SustainabilityAIResponse {
  summary: string;
  priority: 'high' | 'recommended' | 'optional';
  current_habit: string;
  recommended_alternative: string;
  reason: string;
  implementation_steps: string[];
  personal_benefit: string;
  environmental_benefit: string;
  cost_category: 'free' | 'low_cost' | 'medium_budget' | 'high_investment';
  estimated_savings: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  } | null;
  limitations: string[];
  data_sources: string[];
}

export const generateSustainabilityAdvice = async (
  userMessage: string,
  userId: string,
  contextData: {
    locationName?: string;
    currentAqi?: number;
    dominantPollutant?: string;
    temperature?: number;
    humidity?: number;
    userCategory?: string;
  }
): Promise<{ success: boolean; advice: SustainabilityAIResponse; source: string }> => {
  const profile = await UserSustainabilityProfile.findOne({ userId }).lean();
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const response = await callGeminiSustainabilityAdvisor(userMessage, profile, contextData, geminiApiKey);
      if (response && response.summary && response.recommended_alternative) {
        return { success: true, advice: response, source: 'Gemini Generative Environmental AI' };
      }
    } catch (err: any) {
      console.warn(`[Sustainability AI Advisor] External Gemini call failed: ${err.message}. Using built-in Sustainable Lifestyle Engine.`);
    }
  }

  // Built-in intelligent deterministic sustainability engine fallback
  const fallbackAdvice = buildRuleBasedSustainabilityAdvice(userMessage, contextData);
  return { success: true, advice: fallbackAdvice, source: 'Intelligent Sustainable Lifestyle Engine' };
};

const callGeminiSustainabilityAdvisor = async (
  userMessage: string,
  profile: any,
  context: any,
  apiKey: string
): Promise<SustainabilityAIResponse | null> => {
  const prompt = `You are ClearAir AI's "Sustainable Lifestyle Advisor", helping Indian urban households, students, and professionals transition to practical, low-pollution daily habits.

USER CONTEXT:
- Location: ${context.locationName || 'Urban India'}
- Ambient AQI: ${context.currentAqi || 185} (Dominant: ${context.dominantPollutant || 'PM2.5'})
- Weather: ${context.temperature || 24}°C, Humidity: ${context.humidity || 65}%
- User Category: ${context.userCategory || 'general'}
- User Budget Preference: ${profile?.budgetPreference || 'all'}
- Focus Categories: ${profile?.focusCategories?.join(', ') || 'transportation, energy, waste, water'}

USER QUERY: "${userMessage}"

CRITICAL RULES:
1. Return ONLY valid JSON adhering strictly to this schema:
{
  "summary": "Short 1-2 sentence executive overview",
  "priority": "high" | "recommended" | "optional",
  "current_habit": "Specific unsustainable or high-pollution current practice",
  "recommended_alternative": "Clear, practical, sustainable replacement",
  "reason": "Scientific and environmental rationale",
  "implementation_steps": ["Step 1", "Step 2", "Step 3"],
  "personal_benefit": "Personal health, convenience, or lung protection benefit",
  "environmental_benefit": "Quantified or verifiable environmental conservation benefit",
  "cost_category": "free" | "low_cost" | "medium_budget" | "high_investment",
  "estimated_savings": { "amount": number, "unit": "INR", "period": "monthly", "description": "text" } or null,
  "limitations": ["Limitation or constraint 1"],
  "data_sources": ["Documented source citation, e.g. BEE India, CPCB, MoEFCC"]
}
2. DO NOT claim that houseplants can substitute for certified mechanical HEPA air filtration.
3. DO NOT fabricate prices or impossible emission reductions.
4. Output JSON ONLY.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
  );

  const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;
  return JSON.parse(rawText) as SustainabilityAIResponse;
};

const buildRuleBasedSustainabilityAdvice = (
  userMessage: string,
  context: any
): SustainabilityAIResponse => {
  const lower = userMessage.toLowerCase();

  if (lower.includes('electricity') || lower.includes('power') || lower.includes('energy') || lower.includes('ac')) {
    return {
      summary: 'Setting air conditioning to 24°C and cutting vampire standby power delivers immediate monthly savings and cuts grid coal emissions.',
      priority: 'high',
      current_habit: 'Running AC at 18°C–20°C and leaving devices plugged into active sockets 24/7.',
      recommended_alternative: 'Maintain AC at 24°C with a slow ceiling fan and unplug chargers/consoles before sleep.',
      reason: 'BEE research shows each 1°C temperature increase saves 6% compressor electrical load. The Indian regional grid emits 0.716 kg CO2e per kWh consumed.',
      implementation_steps: [
        'Adjust the thermostat to 24°C; clean nylon dust filters every 15 days.',
        'Use switchable power strips for television, audio consoles, and laptop adapters.',
      ],
      personal_benefit: 'Avoids sudden cold-shock respiratory drying and thermal discomfort.',
      environmental_benefit: 'Avoids approximately 2.0 kg CO2e daily per 1.5-ton split AC.',
      cost_category: 'free',
      estimated_savings: {
        amount: 750,
        unit: 'INR',
        period: 'monthly',
        description: 'Estimated residential power bill savings.',
      },
      limitations: ['Cooling efficiency depends on ceiling insulation and room sealing.'],
      data_sources: ['Bureau of Energy Efficiency (BEE) India / CEA CO2 Baseline Database'],
    };
  }

  if (lower.includes('waste') || lower.includes('plastic') || lower.includes('segregat') || lower.includes('garbage')) {
    return {
      summary: 'Source segregation into wet organic and dry recyclable fractions eliminates toxic open landfill fires and enables 100% dry polymer recovery.',
      priority: 'high',
      current_habit: 'Dumping vegetable peels, food scraps, and plastic wrappers together into a single garbage bag.',
      recommended_alternative: 'Two-bin domestic segregation: Green for organic wet waste, Blue for clean dry recyclables.',
      reason: 'Organic waste rotting anaerobically in unsegregated landfills generates methane (28x more potent than CO2) and causes surface landfill fires.',
      implementation_steps: [
        'Place a green pedal bin in the kitchen for food peels, leftover rice, and tea leaves.',
        'Rinse dry milk packets, containers, and paper packaging before placing them into the dry bin.',
        'Hand over segregated waste directly to authorized municipal door-to-door sanitation staff.',
      ],
      personal_benefit: 'Eliminates household foul odor, fruit flies, and bin leachate.',
      environmental_benefit: 'Diverts ~0.8 kg waste daily from municipal dump yards; avoids landfill methane generation.',
      cost_category: 'low_cost',
      estimated_savings: null,
      limitations: ['Requires neighborhood municipal infrastructure that supports segregated transport.'],
      data_sources: ['Solid Waste Management Rules (SWM 2016) / CPCB guidelines'],
    };
  }

  if (lower.includes('water') || lower.includes('ro') || lower.includes('tap')) {
    return {
      summary: 'Reusing RO reject water and adding low-flow faucet aerators conserves hundreds of liters of treated municipal groundwater monthly.',
      priority: 'high',
      current_habit: 'Allowing domestic RO filter reject water to drain directly down the sink pipe.',
      recommended_alternative: 'Direct RO reject hose into a 20-liter bucket for wet-mopping, utensil pre-rinsing, and flushing.',
      reason: 'Standard home RO systems discard 65% to 75% of input feed water. 10L of pure drinking water discards 20–30L of brine water.',
      implementation_steps: [
        'Position a 20-liter container beneath the RO drainage hose.',
        'Use the collected reject water for daily floor cleaning (wet pocha) and bathroom cleaning.',
      ],
      personal_benefit: 'Provides an emergency water buffer during municipal supply interruptions.',
      environmental_benefit: 'Saves 400 to 750 liters of treated municipal water monthly per household.',
      cost_category: 'free',
      estimated_savings: null,
      limitations: ['Reject water has high Total Dissolved Solids (TDS); avoid using for drinking or salt-sensitive delicate potted plants.'],
      data_sources: ['Central Ground Water Board (CGWB) & Bureau of Indian Standards (BIS)'],
    };
  }

  // Default balanced lifestyle recommendation
  return {
    summary: 'Prioritizing public transit, source waste segregation, and 24°C AC thermostat operation delivers the largest combined reduction in household pollution.',
    priority: 'high',
    current_habit: 'Unsegregated domestic waste and reliance on solo vehicular commuting during peak smog hours.',
    recommended_alternative: 'Combine mass transit (Metro) commuting with two-bin domestic waste segregation and AC thermostat optimization.',
    reason: 'These three habitual adjustments eliminate direct street-level PM2.5 inhalation, curb toxic landfill methane fires, and reduce coal grid load.',
    implementation_steps: [
      'Switch one weekly solo vehicle trip to Metro mass transit.',
      'Set home AC to 24°C and turn off phantom power strips.',
      'Segregate kitchen vegetable peels from clean dry recyclables.',
    ],
    personal_benefit: 'Reduces toxic vehicular PM2.5 inhalation by 50% and lowers domestic utility bills.',
    environmental_benefit: 'Prevents ~45 kg CO2e and 24 kg landfill waste diversion monthly.',
    cost_category: 'free',
    estimated_savings: {
      amount: 1500,
      unit: 'INR',
      period: 'monthly',
      description: 'Combined fuel, parking, and electricity savings.',
    },
    limitations: ['Requires mass transit feeder availability within 1.5 km of origin.'],
    data_sources: ['Bureau of Energy Efficiency (BEE) / CPCB / DMRC Environmental Studies'],
  };
};
