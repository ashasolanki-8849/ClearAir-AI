import axios from 'axios';
import { FullAssistantContext } from './contextBuilderService.js';
import { generateIntelligentRecommendations } from './recommendationService.js';
import { IStructuredAIResponse, SupportedLanguage, IMessage } from '../models/Conversation.js';

export const generateAssistantReply = async (
  userMessage: string,
  context: FullAssistantContext,
  language: SupportedLanguage = 'en',
  previousMessages: IMessage[] = []
): Promise<IStructuredAIResponse> => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  // If an external LLM key is configured, attempt calling the API with strict JSON schema
  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const response = await callGeminiLLM(userMessage, context, language, previousMessages, geminiApiKey);
      if (response && response.summary && Array.isArray(response.recommendations)) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[GenAI Assistant] External Gemini API call failed: ${err.message}. Falling back to intelligent environmental engine.`);
    }
  } else if (openAiApiKey && openAiApiKey.trim().length > 0) {
    try {
      const response = await callOpenAILLM(userMessage, context, language, previousMessages, openAiApiKey);
      if (response && response.summary && Array.isArray(response.recommendations)) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[GenAI Assistant] External OpenAI API call failed: ${err.message}. Falling back to intelligent environmental engine.`);
    }
  }

  // Use the built-in Intelligent Environmental Engine (always reliable, ground-truth data, multilingual)
  return generateIntelligentRecommendations(userMessage, context, language);
};

const buildSystemPrompt = (context: FullAssistantContext, language: SupportedLanguage): string => {
  const { environmental: env, user } = context;

  return `You are ClearAir AI's "Smart Smog Assistant", an intelligent environmental and public health AI co-pilot designed to help people navigate severe winter smog and urban air pollution.

STRICT GROUND TRUTH ENVIRONMENTAL CONTEXT (DO NOT FABRICATE OR GUESS):
- Location: ${env.locationName} (${env.city}), Coordinates: ${env.lat.toFixed(2)}, ${env.lon.toFixed(2)}
- Current AQI: ${env.aqi} (${env.aqiCategory}) [Standard: ${env.standard}]
- Primary Pollutant: ${env.dominantPollutant}
- Particulate Readings: PM2.5 = ${env.pollutants.pm25} µg/m³, PM10 = ${env.pollutants.pm10} µg/m³
- Gaseous Readings: NO2 = ${env.pollutants.no2} µg/m³, SO2 = ${env.pollutants.so2} µg/m³, CO = ${env.pollutants.co} mg/m³, O3 = ${env.pollutants.o3} µg/m³
- Weather: Temperature = ${env.weather.temperature}°C, Humidity = ${env.weather.humidity}%, Wind Speed = ${env.weather.windSpeed} km/h, Condition = "${env.weather.condition}"
- Data Source: ${env.dataSource} (Timestamp: ${env.lastUpdated}, Live Feed: ${!env.isDemo})

USER PROFILE:
- Category: ${user.userCategory} (student, professional, family, elderly, community)
- Age Bracket: ${user.ageGroup}
- City: ${user.city}

CRITICAL RULES:
1. RESPONSE LANGUAGE: You MUST respond in ${language === 'hi' ? 'Hindi (हिन्दी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'English'}.
2. Use real ambient readings provided above. Never invent higher or lower numbers.
3. Distinguish clearly between:
   - "Personal Benefit" (how the action reduces personal inhalation/exposure)
   - "Environmental Benefit" (how the action reduces external community emissions)
4. For indoor air quality: Explain affordable methods (wet mopping, sealing window gaps). Debunk the myth that houseplants can replace mechanical HEPA filters for heavy PM2.5 smog.
5. Provide a dynamic 4-part Daily Routine (morning, afternoon, evening, night) appropriate for the current AQI.
6. Provide medical disclaimer: This is environmental informational guidance, not a medical diagnosis or prescription.
7. Return ONLY valid JSON matching this schema exactly without markdown fences or backticks:

{
  "summary": "Short explanation in requested language",
  "current_conditions": {
    "locationName": "${env.locationName}",
    "aqi": ${env.aqi},
    "category": "${env.aqiCategory}",
    "dominant_pollutant": "${env.dominantPollutant}",
    "pm25": ${env.pollutants.pm25},
    "pm10": ${env.pollutants.pm10},
    "temperature": ${env.weather.temperature},
    "data_timestamp": "${env.lastUpdated}",
    "is_live": ${!env.isDemo}
  },
  "risk_level": "${env.aqiCategory}",
  "recommendations": [
    {
      "category": "Outdoor Safety | Family Protection | Student Guidance | Working Professionals | Fitness & Exercise | Community | Indoor Air Quality | Low-Emission Alternatives",
      "action": "Concrete recommended action",
      "reason": "Scientific justification referencing current pollution",
      "timing": "Specific diurnal window",
      "personal_benefit": "Exposure reduction benefit",
      "environmental_benefit": "Emission reduction impact"
    }
  ],
  "daily_routine": {
    "morning": "Morning schedule and precautions",
    "afternoon": "Afternoon window suggestions",
    "evening": "Evening commute/protection advice",
    "night": "Nighttime indoor air quality measures"
  },
  "what_if_analysis": {
    "scenario": "Scenario evaluated if user asked a what-if question",
    "consequences": "Health & exposure consequences",
    "safer_alternative": "Recommended safer substitute"
  },
  "alternatives": ["Alternative 1", "Alternative 2"],
  "limitations": ["Environmental informational guidance disclaimer", "Sensor data freshness disclaimer"],
  "follow_up_questions": ["Question 1", "Question 2", "Question 3"]
}`;
};

const callGeminiLLM = async (
  userMessage: string,
  context: FullAssistantContext,
  language: SupportedLanguage,
  previousMessages: IMessage[],
  apiKey: string
): Promise<IStructuredAIResponse | null> => {
  const systemPrompt = buildSystemPrompt(context, language);

  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUSER QUESTION:\n${userMessage}` }],
    },
  ];

  // Try gemini-1.5-flash or gemini-2.0-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await axios.post(
    url,
    {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    },
    { timeout: 10000 }
  );

  const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (rawText) {
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }
  return null;
};

const callOpenAILLM = async (
  userMessage: string,
  context: FullAssistantContext,
  language: SupportedLanguage,
  previousMessages: IMessage[],
  apiKey: string
): Promise<IStructuredAIResponse | null> => {
  const systemPrompt = buildSystemPrompt(context, language);

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  const rawText = res.data?.choices?.[0]?.message?.content;
  if (rawText) {
    return JSON.parse(rawText);
  }
  return null;
};
