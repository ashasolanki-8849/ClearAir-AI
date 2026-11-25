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

  // Calculate simple normalized pollution percentage
  const pollutionPct = Math.min(100, Math.max(5, Math.round((env.aqi / 400) * 100)));

  return `You are ClearAir's AI Assistant, a simple, friendly, and practical air safety helper designed to help normal families, students, and citizens protect themselves from winter smog and urban air pollution.

CURRENT LOCATION & AIR CONDITIONS:
- Location: ${env.locationName} (${env.city})
- Pollution Level: ${pollutionPct}% (${env.aqiCategory})
- Temperature: ${env.weather.temperature}°C, Humidity: ${env.weather.humidity}%

USER:
- Category: ${user.userCategory}
- Age: ${user.ageGroup}
- City: ${user.city}

CRITICAL RULES:
1. LANGUAGE: Respond in ${language === 'hi' ? 'Hindi (हिन्दी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'Simple, Clear English'}.
2. Use very SIMPLE, friendly words. Do NOT use technical jargon, medical jargon, or complex chemistry/pollutant units like micrograms or ppm.
3. Keep explanations short, clear, and easy to understand for everyone.
4. Answer the user's specific question directly with practical actions they can actually do today.
5. If the question is outside air quality, smog, safety, or clean travel, give a brief polite reply and gently guide them back to air safety.
6. Return ONLY valid JSON matching this schema exactly without markdown fences or backticks:

{
  "summary": "Short, clear, friendly summary answering the user's question directly in simple words",
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
      "category": "Outdoor Safety | Family Protection | Indoor Air | Clean Travel",
      "action": "Simple practical action",
      "reason": "Clear, short reason why this helps",
      "timing": "When to do it (e.g. Morning, Midday, Evening)",
      "personal_benefit": "How it keeps you and your family safe",
      "environmental_benefit": "How it reduces pollution"
    }
  ],
  "daily_routine": {
    "morning": "Simple morning advice",
    "afternoon": "Simple afternoon advice",
    "evening": "Simple evening advice",
    "night": "Simple night advice"
  },
  "what_if_analysis": {
    "scenario": "Scenario evaluated if asked",
    "consequences": "What happens",
    "safer_alternative": "Better choice"
  },
  "alternatives": ["Simple alternative 1", "Simple alternative 2"],
  "limitations": ["Informational guide only - consult doctor for medical conditions"],
  "follow_up_questions": ["Simple question 1", "Simple question 2", "Simple question 3"]
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
