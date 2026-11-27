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

  // 1. Give FULL CONTROL to Gemini AI with full multi-turn conversational history
  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const response = await callGeminiLLM(userMessage, context, language, previousMessages, geminiApiKey.trim());
      if (response && response.summary) {
        // Detect if Gemini explicitly identified the query as completely off-topic
        const isOffTopic =
          response.is_off_topic === true ||
          response.summary.toLowerCase().includes('outside of this scope') ||
          response.summary.toLowerCase().includes('valid question') ||
          response.summary.toLowerCase().includes('only answer questions related to air') ||
          response.summary.toLowerCase().includes('specialise exclusively') ||
          response.summary.toLowerCase().includes('specializes exclusively') ||
          response.summary.toLowerCase().includes('वायु प्रदूषण या सुरक्षा') ||
          response.summary.toLowerCase().includes('માન્ય પ્રશ્ન પૂછો');

        if (isOffTopic) {
          response.is_off_topic = true;
          response.recommendations = [];
          delete response.daily_routine;
          delete response.what_if_analysis;
          if (!response.follow_up_questions || response.follow_up_questions.length === 0) {
            response.follow_up_questions = [
              language === 'hi' ? 'आज गांधीनगर में वायु गुणवत्ता (AQI) कैसी है?' : language === 'gu' ? 'આજે ગાંધીનગરમાં હવાની ગુણવત્તા (AQI) કેવી છે?' : "How is today's air quality in Gandhinagar?",
              language === 'hi' ? 'क्या आज सुबह टहलने जाना सुरक्षित है?' : language === 'gu' ? 'શું આજે સવારે મોર્નિંગ વોક પર જવું સુરક્ષિત છે?' : 'Is it safe to go for a morning walk today?',
              language === 'hi' ? 'स्मॉग से बचने के लिए कौन सा मास्क सबसे अच्छा है?' : language === 'gu' ? 'સ્મોગથી બચવા માટે કયો માસ્ક શ્રેષ્ઠ છે?' : 'Which mask is best for winter smog protection?',
            ];
          }
          return response;
        }

        return response;
      }
    } catch (err: any) {
      console.warn(`[Gemini Assistant] External Gemini API call failed: ${err.message}. Falling back to internal engine.`);
    }
  } else if (openAiApiKey && openAiApiKey.trim().length > 0) {
    try {
      const response = await callOpenAILLM(userMessage, context, language, previousMessages, openAiApiKey.trim());
      if (response && response.summary) {
        return response;
      }
    } catch (err: any) {
      console.warn(`[OpenAI Assistant] External OpenAI API call failed: ${err.message}.`);
    }
  }

  // 2. Built-in Environmental Engine Fallback
  return generateIntelligentRecommendations(userMessage, context, language, previousMessages);
};

const buildSystemPrompt = (context: FullAssistantContext, language: SupportedLanguage): string => {
  const { environmental: env, user } = context;

  // Calculate simple normalized pollution percentage
  const pollutionPct = Math.min(100, Math.max(5, Math.round((env.aqi / 400) * 100)));

  return `You are ClearAir's dedicated Winter Smog & Air Safety AI Assistant.
You have FULL CONTROL over all conversational answers for the ClearAir application.

CURRENT LOCATION & AIR TELEMETRY:
- Location: ${env.locationName} (${env.city})
- Real-Time Pollution Level: ${pollutionPct}% (${env.aqiCategory})
- Temperature: ${env.weather.temperature}°C, Humidity: ${env.weather.humidity}%
- Dominant Pollutant: ${env.dominantPollutant || 'PM2.5'}

USER PROFILE:
- Category: ${user.userCategory} (student | family | working_professional | elderly | general)
- Age Group: ${user.ageGroup}
- City: ${user.city}

CRITICAL INTELLIGENCE & CONVERSATION RULES:
1. FULL CONVERSATIONAL FREEDOM: The user is free to ask ANY question they want — both from suggested questions AND any custom question outside suggestions!
2. MULTI-TURN & FOLLOW-UP CONTINUITY: If the user asks a follow-up question (e.g., "why?", "tell me more", "how can I do that?", "what should I do?", "is it safe for my child?", "what about tomorrow?", "give remedies", "what does this mean?"), DO NOT call it invalid or off-topic! Seamlessly use the previous conversation history to understand context and deliver a brilliant, cohesive follow-up response!
3. DYNAMIC & DIVERSE ANSWERS (NO REPETITION): NEVER give the same generic answer or boilerplate text for different questions! Tailor every answer specifically and distinctly to what was asked:
   - If asking "why?": explain the underlying environmental meteorology (temperature inversion, morning cold layer trapping vehicle exhaust and particulate matter).
   - If asking about remedies/health: explain steam inhalation, hydration, indoor air moisture, Vitamin C, avoiding early morning exercise.
   - If asking about outdoor activities/jogging: give precise safe hours (after 10:00 AM when sunlight disperses smog).
   - If asking about masks: compare N95/FFP2 vs surgical/cloth masks.
   - If asking about travel: advise AC recirculation in cars, avoiding open auto-rickshaws during peak hours.
4. POLITE REFUSAL ONLY FOR COMPLETELY UNRELATED TOPICS:
   If and ONLY if the user asks something completely outside of air quality, smog, respiratory health, safe travel, environmental conditions, or the ClearAir application (such as "who is modi", political parties, writing computer code, cricket scores, movie actors, baking recipes, mathematics, trivia):
   - Set "is_off_topic": true
   - Set "summary": "I am ClearAir's dedicated Air Safety Assistant. I specialize in air pollution, winter smog, health protection, safe travel, and low-emission routines. Please ask an air quality or smog-related question!" (translated into the requested language).
   - Set "recommendations": []
   - Set "daily_routine": null
   - Set "what_if_analysis": null
   - Set "follow_up_questions": ["How is today's air quality in ${env.locationName}?", "Is it safe to go for a morning walk today?", "What mask is best for smog protection?"]
5. LANGUAGE: Respond in ${language === 'hi' ? 'Hindi (हिन्दी)' : language === 'gu' ? 'Gujarati (ગુજરાતી)' : 'Simple, Clear English'}.
6. TONE: Simple, friendly, practical. Do NOT use scientific microgram units (µg/m³) or confusing chemical formulas.
7. Return ONLY valid JSON matching this schema exactly:

{
  "summary": "Direct, helpful, unique answer in simple words",
  "is_off_topic": false,
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
      "action": "Specific practical action answering their need",
      "reason": "Why this helps them stay safe",
      "timing": "When to do it (e.g. Morning, Afternoon, Evening)",
      "personal_benefit": "How it protects lungs and health",
      "environmental_benefit": "How it reduces emissions"
    }
  ],
  "daily_routine": {
    "morning": "Morning smog advice",
    "afternoon": "Afternoon advice",
    "evening": "Evening advice",
    "night": "Night advice"
  },
  "what_if_analysis": {
    "scenario": "Scenario evaluated if applicable",
    "consequences": "What happens",
    "safer_alternative": "Better choice"
  },
  "alternatives": ["Simple alternative 1", "Simple alternative 2"],
  "limitations": ["Informational guide only - consult doctor for medical conditions"],
  "follow_up_questions": ["Relevant question 1", "Relevant question 2", "Relevant question 3"]
}`;
};

const sanitizeContentsForGemini = (
  previousMessages: IMessage[],
  currentUserMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> => {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  const recentHistory = previousMessages.slice(-6);

  for (const msg of recentHistory) {
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    const text = (msg.content || '').trim();
    if (!text) continue;

    // Merge consecutive messages with identical role to adhere strictly to Gemini API alternating format
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  // Ensure first message role is 'user'
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  // Append current user message
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${currentUserMessage.trim()}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: currentUserMessage.trim() }] });
  }

  return contents;
};

const callGeminiLLM = async (
  userMessage: string,
  context: FullAssistantContext,
  language: SupportedLanguage,
  previousMessages: IMessage[],
  apiKey: string
): Promise<IStructuredAIResponse | null> => {
  const systemPrompt = buildSystemPrompt(context, language);
  const contents = sanitizeContentsForGemini(previousMessages, userMessage);

  // Prioritize modern, ultra-low latency & high stability Gemini models on Google AI Studio
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await axios.post(
        url,
        {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.35,
          },
        },
        { timeout: 8000 }
      );

      const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && (parsed.summary || parsed.recommendations)) {
            return parsed;
          }
        }
      }
    } catch (e: any) {
      console.warn(`[Gemini API] Model ${model} attempt error: ${e.response?.data?.error?.message || e.message}`);
      continue;
    }
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
      temperature: 0.2,
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
