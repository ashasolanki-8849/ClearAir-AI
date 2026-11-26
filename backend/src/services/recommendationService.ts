import { FullAssistantContext } from './contextBuilderService.js';
import { IStructuredAIResponse, IAIRecommendation, SupportedLanguage, IMessage } from '../models/Conversation.js';

/**
 * Validates whether a user's question is relevant to the ClearAir problem statement:
 * Winter smog, urban air pollution, family health safety, safe travel, indoor air quality,
 * low-emission daily routines, or today's air conditions.
 */
export const isRelevantAirSafetyQuestion = (query: string): boolean => {
  if (!query || query.trim().length === 0) return true;
  const q = query.trim().toLowerCase();

  // Common friendly greetings, conversational continuity and follow-ups are acceptable
  const conversationalStarters = [
    'hi', 'hello', 'hey', 'namaste', 'kem cho', 'good morning', 'good afternoon', 'good evening',
    'help', 'start', 'who are you', 'what can you do', 'what do you do', 'guide me',
    'why', 'why is it', 'how', 'how so', 'tell me more', 'more', 'details', 'explain', 'explain more',
    'what else', 'remedies', 'symptoms', 'precautions', 'tips', 'guide', 'yes', 'okay', 'sure'
  ];
  if (conversationalStarters.some((g) => q === g || q.startsWith(g + ' ') || q.endsWith(' ' + g))) {
    return true;
  }

  // Explicit off-topic triggers (names, politics, programming, sports, movies, general trivia, etc.)
  const offTopicTriggers = [
    'modi', 'narendra modi', 'rahul gandhi', 'amit shah', 'kejrwal', 'bjp', 'congress', 'aap',
    'minister', 'prime minister', 'president', 'chief minister', 'politician', 'election', 'party',
    'who is', 'who was', 'biography of',
    'code', 'coding', 'python', 'javascript', 'typescript', 'java', 'c++', 'html', 'css', 'react', 'sql', 'database', 'github', 'function',
    'cricket', 'ipl', 'football', 'fifa', 'world cup', 'match score', 'messi', 'ronaldo', 'kohli', 'dhoni', 'rohit',
    'cinema', 'bollywood', 'hollywood', 'movie', 'song', 'lyrics', 'actor', 'actress', 'film',
    'recipe', 'cooking', 'bake', 'cake', 'pizza', 'burger', 'food recipe',
    'capital of', 'math', 'algebra', 'solve equation', 'joke', 'tell me a joke', 'story', 'poem', 'game', 'gaming', 'bitcoin', 'crypto', 'stock market'
  ];

  // Specific air safety / ClearAir domain keywords
  const airSafetyKeywords = [
    'air', 'quality', 'aqi', 'smog', 'pollution', 'polluted', 'smoke', 'haze', 'dust', 'fog', 'inversion',
    'pm2.5', 'pm10', 'pm', 'co2', 'no2', 'so2', 'ozone', 'particulate',
    'breath', 'breathing', 'lung', 'lungs', 'throat', 'cough', 'asthma', 'heart', 'headache', 'chest', 'eye', 'eyes', 'irritat', 'allergy', 'sick', 'health', 'safe', 'safety', 'danger', 'risk',
    'mask', 'n95', 'ffp2', 'purifier', 'hepa', 'plant', 'plants', 'window', 'windows', 'door', 'indoor', 'inside', 'outdoor', 'outside', 'home', 'house', 'room', 'ventilate', 'ventilation',
    'walk', 'jog', 'run', 'exercise', 'gym', 'workout', 'cycling', 'cycle', 'play', 'sports', 'morning walk', 'evening walk',
    'travel', 'route', 'commute', 'traffic', 'car', 'bus', 'metro', 'train', 'vehicle', 'ev', 'bike', 'scooter', 'cab', 'auto',
    'student', 'school', 'college', 'exam', 'class', 'campus', 'child', 'children', 'kid', 'kids', 'baby', 'babies', 'elder', 'elderly', 'senior', 'parent', 'family', 'pregnant',
    'routine', 'low-emission', 'sustainable', 'emission', 'clean', 'eco', 'winter', 'temperature', 'weather', 'wind', 'humidity',
    'what should i do', 'what to do', 'how is the air', 'is it safe', 'can i go', 'today', 'forecast', 'advice', 'tips', 'recommend', 'protect',
    'gandhinagar', 'ahmedabad', 'delhi', 'mumbai', 'india'
  ];

  const hasOffTopic = offTopicTriggers.some((t) => {
    if (t.includes(' ')) {
      return q.includes(t);
    }
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(q);
  });

  const hasAirSafety = airSafetyKeywords.some((k) => {
    if (k.includes(' ') || k.includes('.')) {
      return q.includes(k);
    }
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(q);
  });

  if (hasOffTopic && !hasAirSafety) {
    return false;
  }

  if (!hasAirSafety) {
    return false;
  }

  return true;
};

export const generateIntelligentRecommendations = (
  userMessage: string,
  context: FullAssistantContext,
  language: SupportedLanguage = 'en',
  previousMessages: IMessage[] = []
): IStructuredAIResponse => {
  const { environmental: env, user } = context;
  const aqi = env.aqi;
  const aqiCat = env.aqiCategory;
  const pm25 = env.pollutants.pm25;
  const location = env.locationName;
  const userCat = user.userCategory;
  const isSevere = aqi >= 400 || aqiCat === 'Severe';
  const isVeryPoor = (aqi >= 301 && aqi < 400) || aqiCat === 'Very Poor';
  const isPoor = (aqi >= 201 && aqi <= 300) || aqiCat === 'Poor';
  const isModerate = (aqi >= 101 && aqi <= 200) || aqiCat === 'Moderate';
  const isUnhealthy = aqi > 200;

  // 1. Check domain relevance: if query is a follow-up in an ongoing conversation, accept it
  const isFollowUp = previousMessages && previousMessages.length > 0;
  if (!isFollowUp && !isRelevantAirSafetyQuestion(userMessage)) {
    return {
      is_off_topic: true,
      summary:
        language === 'hi'
          ? 'मैं केवल वायु प्रदूषण, सर्दियों के स्मॉग, वायु गुणवत्ता और स्वास्थ्य सुरक्षा से जुड़े प्रश्नों का उत्तर दे सकता हूँ। आपका प्रश्न इस विषय से बाहर है। कृपया वायु प्रदूषण या सुरक्षा से संबंधित कोई मान्य प्रश्न पूछें!'
          : language === 'gu'
          ? 'હું માત્ર વાયુ પ્રદૂષણ, શિયાળાના સ્મોગ, હવાની ગુણવત્તા અને સ્વાસ્થ્ય સુરક્ષા સંબંધિત પ્રશ્નોના જવાબો આપું છું. તમારો પ્રશ્ન આ વિષય બહારનો છે. કૃપા કરીને વાયુ પ્રદૂષણ કે વાયુ સુરક્ષાને લગતો કોઈ માન્ય પ્રશ્ન પૂછો!'
          : 'I am ClearAir\'s dedicated Air Safety Assistant. I specialize exclusively in urban air pollution, winter smog, family health safety, safe travel, and low-emission daily routines. Your question appears to be outside of this scope.\n\nPlease ask a valid questionnaire or inquiry related to today\'s air quality, smog protection, indoor air hacks, or safe outdoor routines!',
      current_conditions: {
        locationName: location,
        aqi,
        category: aqiCat,
        dominant_pollutant: env.dominantPollutant,
        pm25,
        pm10: env.pollutants.pm10,
        temperature: env.weather.temperature,
        data_timestamp: env.lastUpdated,
        is_live: !env.isDemo,
      },
      risk_level: aqiCat,
      user_context_applied: {
        category: userCat,
        age_group: user.ageGroup,
      },
      recommendations: [],
      alternatives: [],
      limitations: [
        'ClearAir AI Assistant operates exclusively within urban air quality, winter smog, and health safety.',
      ],
      follow_up_questions: [
        language === 'hi' ? 'आज गांधीनगर में वायु गुणवत्ता (AQI) कैसी है?' : language === 'gu' ? 'આજે ગાંધીનગરમાં હવાની ગુણવત્તા (AQI) કેવી છે?' : "How is today's air quality in Gandhinagar?",
        language === 'hi' ? 'क्या आज सुबह टहलने जाना सुरक्षित है?' : language === 'gu' ? 'શું આજે સવારે મોર્નિંગ વોક પર જવું સુરક્ષિત છે?' : 'Is it safe to go for a morning walk today?',
        language === 'hi' ? 'घर की हवा को साफ रखने के आसान उपाय क्या हैं?' : language === 'gu' ? 'ઘરની હવાને સ્વચ્છ રાખવા માટેના સરળ ઉપાયો શું છે?' : 'What are simple hacks to keep indoor air clean?',
        language === 'hi' ? 'स्मॉग से बचने के लिए कौन सा मास्क सबसे अच्छा है?' : language === 'gu' ? 'સ્મોગથી બચવા માટે કયો માસ્ક શ્રેષ્ઠ છે?' : 'Which mask is best for winter smog protection?',
      ],
    };
  }

  const lowerMsg = userMessage.toLowerCase();

  // Determine intent
  const isWhatIf = lowerMsg.includes('what if') || lowerMsg.includes('क्या होगा') || lowerMsg.includes('જો હું') || lowerMsg.includes('શું થશે');
  const isExercise = lowerMsg.includes('exercise') || lowerMsg.includes('run') || lowerMsg.includes('gym') || lowerMsg.includes('workout') || lowerMsg.includes('व्यायाम') || lowerMsg.includes('કસરત');
  const isIndoor = lowerMsg.includes('indoor') || lowerMsg.includes('window') || lowerMsg.includes('purifier') || lowerMsg.includes('plant') || lowerMsg.includes('घर') || lowerMsg.includes('ઘર');
  const isTravel = lowerMsg.includes('travel') || lowerMsg.includes('commute') || lowerMsg.includes('traffic') || lowerMsg.includes('bus') || lowerMsg.includes('car') || lowerMsg.includes('यात्रा') || lowerMsg.includes('મુસાફરી');
  const isFamily = lowerMsg.includes('family') || lowerMsg.includes('child') || lowerMsg.includes('kid') || lowerMsg.includes('elder') || lowerMsg.includes('baby') || lowerMsg.includes('परिवार') || lowerMsg.includes('બાળકો');

  // Build What-If Analysis if applicable
  let whatIfAnalysis: IStructuredAIResponse['what_if_analysis'] | undefined = undefined;

  if (isWhatIf || isExercise || isTravel || isIndoor) {
    if (isExercise) {
      whatIfAnalysis = {
        scenario: language === 'hi' ? 'यदि आप आज बाहर व्यायाम करते हैं' : language === 'gu' ? 'જો તમે આજે બહાર કસરત કરો છો' : 'If you exercise or jog outdoors today',
        consequences:
          isUnhealthy
            ? language === 'hi'
              ? `गहरे सांस लेने से फेफड़ों में सामान्य से 4-5 गुना अधिक PM2.5 (${pm25} µg/m³) प्रवेश करेगा, जिससे वायुमार्ग में सूजन और सीने में जकड़न हो सकती है।`
              : language === 'gu'
              ? `ઊંડા શ્વાસ લેવાથી ફેફસામાં સામાન્ય કરતાં 4-5 ગણું વધુ PM2.5 (${pm25} µg/m³) પ્રવેશ કરશે, જેનાથી શ્વાસનળીમાં બળતરા થઈ શકે છે.`
              : `High-intensity breathing forces 4x–5x more particulate volume deep into alveolar capillaries under current PM2.5 of ${pm25} µg/m³, increasing cardiac strain.`
            : language === 'hi'
            ? 'वर्तमान एक्यूआई स्वीकार्य है, लेकिन दोपहर 12 बजे से शाम 4 बजे के बीच व्यायाम करना सबसे सुरक्षित है।'
            : language === 'gu'
            ? 'હાલનો AQI સ્વીકાર્ય છે, પરંતુ બપોરે 12 થી સાંજે 4 ની વચ્ચે કસરત કરવી વધુ સલામત છે.'
            : 'Current conditions are acceptable; however, schedule workouts between midday and early afternoon when night inversion has fully cleared.',
        safer_alternative:
          language === 'hi'
            ? 'घर के अंदर योग, स्ट्रेचिंग या रेजिस्टेंस बैंड का उपयोग करें। यदि एयर प्यूरीफायर है तो उसे चालू रखें।'
            : language === 'gu'
            ? 'ઘરની અંદર યોગ અથવા હળવી કસરત કરો. જો એર પ્યુરિફાયર હોય તો તેને ચાલુ રાખો.'
            : 'Shift cardiovascular workout indoors into a closed room with an active HEPA air purifier or practice stretching/yoga.',
      };
    } else if (isIndoor || lowerMsg.includes('window')) {
      whatIfAnalysis = {
        scenario: language === 'hi' ? 'यदि आप खिड़कियां खुली रखते हैं' : language === 'gu' ? 'જો તમે બારીઓ ખુલ્લી રાખો છો' : 'If you keep your home windows open today',
        consequences:
          isUnhealthy
            ? language === 'hi'
              ? `सर्दियों के स्मॉग और भारी पार्टिकुलेट घर के अंदर प्रवेश करेंगे और इनडोर PM2.5 स्तर 30 मिनट में आउटडोर के 85% तक पहुंच सकता है।`
              : language === 'gu'
              ? `શિયાળાનો સ્મોગ અને ભારે પ્રદૂષણ ઘરની અંદર પ્રવેશ કરશે અને 30 મિનિટમાં ઇન્ડોર PM2.5 સ્તર આઉટડોરના 85% સુધી પહોંચી શકે છે.`
              : `Outdoor smog and micro-particulates rapidly equilibrate indoors, elevating domestic PM2.5 to within 80-90% of hazardous outdoor concentrations within 40 minutes.`
            : language === 'hi'
            ? 'दोपहर के समय हल्की वेंटिलेशन सुरक्षित है, परंतु सुबह के व्यस्त ट्रैफिक के दौरान खिड़कियां बंद रखें।'
            : language === 'gu'
            ? 'બપોરે થોડી વાર બારી ખોલવી સલામત છે, પરંતુ સવારના ટ્રાફિક સમયે બંધ રાખો.'
            : 'Midday ventilation (12:00–15:00) is reasonable when ground inversion thins, but keep windows sealed during peak early morning and late evening rush hours.',
        safer_alternative:
          language === 'hi'
            ? 'खिड़कियों को बंद रखें, दरवाजों के नीचे गीला तौलिया लगाएं और सूखे झाड़ू के बजाय गीला पोछा लगाएं।'
            : language === 'gu'
            ? 'બારીઓ બંધ રાખો, દરવાજાની નીચે ભીનો ટુવાલ મૂકો અને સૂકી સાવરણીને બદલે ભીનું પોતું કરો.'
            : 'Keep windows securely sealed, place door sweep drafts, and wet-mop floors rather than dry sweeping to trap settled dust without resuspension.',
      };
    } else if (isTravel || lowerMsg.includes('traffic')) {
      whatIfAnalysis = {
        scenario: language === 'hi' ? 'यदि आप पीक ट्रैफिक घंटों में यात्रा करते हैं' : language === 'gu' ? 'જો તમે પીક ટ્રાફિકના કલાકો દરમિયાન મુસાફરી કરો છો' : 'If you commute during peak congested traffic hours',
        consequences:
          language === 'hi'
            ? `वाहनों के टेलपाइप से निकलने वाले NO2 और ताजे PM2.5 के संपर्क में आने से सिरदर्द, आंखों में जलन और श्वसन तंत्र पर अत्यधिक दबाव पड़ता है।`
            : language === 'gu'
            ? `વાહનોના એક્ઝોસ્ટમાંથી નીકળતા NO2 અને તાજા PM2.5 ના સંપર્કમાં આવવાથી માથાનો દુખાવો અને આંખોમાં બળતરા થાય છે.`
            : `Idling tailpipes concentrate acute localized NO2 and black carbon spikes up to 3x higher than regional ambient background levels.`,
        safer_alternative:
          language === 'hi'
            ? 'मेट्रो या वातानुकूलित बस का उपयोग करें, कार में एयर री-सर्कुलेशन मोड ऑन करें और N95 मास्क पहनें।'
            : language === 'gu'
            ? 'મેટ્રો અથવા પબ્લિક ટ્રાન્સપોર્ટનો ઉપયોગ કરો, કારમાં રી-સર્ક્યુલેશન મોડ ઓન કરો અને N95 માસ્ક પહેરો.'
            : 'Utilize electric rapid rail / metro where available, seal automobile ventilation to internal recirculation mode, and seal an N95 respirator snugly over nose and mouth.',
      };
    }
  }

  // Build Personalized Recommendations
  const recommendations: IAIRecommendation[] = [];

  // Rec 1: Outdoor Safety
  if (isSevere || isVeryPoor) {
    recommendations.push({
      category: language === 'hi' ? 'बाहरी सुरक्षा' : language === 'gu' ? 'બહારની સુરક્ષા' : 'Outdoor Safety',
      action:
        language === 'hi'
          ? 'अनावश्यक बाहरी गतिविधियों को पूरी तरह टालें और यदि बाहर जाना अनिवार्य हो तो फिटेड N95/FFP2 मास्क पहनें।'
          : language === 'gu'
          ? 'બિનજરૂરી બહાર જવાનું ટાળો અને જો બહાર જવું જરૂરી હોય તો ફિટેડ N95/FFP2 માસ્ક પહેરો.'
          : `Strictly avoid non-essential outdoor transit and wear a certified, tight-sealing N95/FFP2 mask if stepping outside in ${location}.`,
      reason:
        language === 'hi'
          ? `वर्तमान AQI ${aqi} (${aqiCat}) फेफड़ों और हृदय पर गंभीर दबाव डालता है।`
          : language === 'gu'
          ? `હાલનો AQI ${aqi} (${aqiCat}) ફેફસાં અને હૃદય પર ગંભીર દબાણ લાવે છે.`
          : `Current AQI of ${aqi} (${aqiCat}) contains hazardous PM2.5 levels of ${pm25} µg/m³, which directly irritate bronchial mucosal tissues.`,
      timing:
        language === 'hi'
          ? 'विशेष रूप से सुबह 06:00 से 10:00 और रात के समय'
          : language === 'gu'
          ? 'ખાસ કરીને સવારે 06:00 થી 10:00 અને રાત્રિ દરમિયાન'
          : 'Especially between 06:00–10:00 and 19:00–22:00 during low boundary thermal inversion',
      personal_benefit:
        language === 'hi'
          ? 'हवा में मौजूद 95% जहरीले कणों को फेफड़ों में जाने से रोकता है।'
          : language === 'gu'
          ? 'હવામાં રહેલા 95% ઝેરી કણોને ફેફસાંમાં જતાં અટકાવે છે.'
          : 'Eliminates up to 95% of inhaled fine particulates, minimizing acute airway constriction and headaches.',
      environmental_benefit:
        language === 'hi'
          ? 'गैर-जरूरी यात्राएं कम करने से सड़कों पर वाहनों का धुआं घटता है।'
          : language === 'gu'
          ? 'બિનજરૂરી મુસાફરી ઘટાડવાથી વાહનોનું પ્રદૂષણ ઘટે છે.'
          : 'Trip cancellation reduces on-road vehicular congestion and direct tailpipe exhaust emissions.',
    });
  } else if (isPoor || isModerate) {
    recommendations.push({
      category: language === 'hi' ? 'बाहरी सुरक्षा' : language === 'gu' ? 'બહારની સુરક્ષા' : 'Outdoor Safety',
      action:
        language === 'hi'
          ? 'सुबह और देर शाम के समय लंबी बाहरी वॉक कम करें; दोपहर के समय आवश्यक काम पूरे करें।'
          : language === 'gu'
          ? 'સવારે અને મોડી સાંજે લાંબા સમય સુધી બહાર રહેવાનું ટાળો; બપોરના સમયે જરૂરી કામ પતાવો.'
          : 'Reschedule extended outdoor errands to midday hours (12:00–15:00) when solar warming dissipates ground-level smog pockets.',
      reason:
        language === 'hi'
          ? `AQI ${aqi} पर संवेदनशील समूहों (बच्चे, बुजुर्ग, अस्थमा रोगी) को सांस लेने में कठिनाई हो सकती है।`
          : language === 'gu'
          ? `AQI ${aqi} પર સંવેદનશીલ જૂથો (બાળકો, વડીલો, અસ્થમાના દર્દીઓ) માટે શ્વાસ લેવામાં તકલીફ થઈ શકે છે.`
          : `Current moderate pollution (${aqiCat}, AQI ${aqi}) can trigger bronchial irritation in sensitive individuals.`,
      timing:
        language === 'hi' ? 'दोपहर 12:00 से शाम 03:30 के बीच' : language === 'gu' ? 'બપોરે 12:00 થી 03:30 ની વચ્ચે' : 'Midday hours (12:00–15:30)',
      personal_benefit:
        language === 'hi' ? 'सुबह के घने प्रदूषक जमाव के संपर्क से बचाता है।' : language === 'gu' ? 'સવારના પ્રદૂષણથી બચાવે છે.' : 'Lowers cumulative daytime particulate exposure by avoiding peak vehicular congestion spikes.',
      environmental_benefit:
        language === 'hi' ? 'ऑफ-पीक समय में यात्रा से ट्रैफिक जाम कम होता है।' : language === 'gu' ? 'ઓફ-પીક સમયે મુસાફરી કરવાથી ટ્રાફિક ઘટે છે.' : 'Off-peak transit reduces stop-and-go idle fuel wastage across arterial roads.',
    });
  } else {
    recommendations.push({
      category: language === 'hi' ? 'बाहरी सुरक्षा' : language === 'gu' ? 'બહારની સુરક્ષા' : 'Outdoor Safety',
      action:
        language === 'hi'
          ? 'हवा की स्थिति संतोषजनक है; सामान्य बाहरी गतिविधियां और खिड़कियां खोलकर वेंटिलेशन किया जा सकता है।'
          : language === 'gu'
          ? 'હવાની ગુણવત્તા સંતોષકારક છે; સામાન્ય બહારની પ્રવૃત્તિઓ અને બારીઓ ખોલીને વેન્ટિલેશન કરી શકાય છે.'
          : 'Ambient air is in the acceptable range. Outdoor physical activities and room ventilation can proceed safely.',
      reason:
        language === 'hi' ? `AQI ${aqi} (${aqiCat}) न्यूनतम स्वास्थ्य जोखिम दर्शाता है।` : language === 'gu' ? `AQI ${aqi} (${aqiCat}) ન્યૂનતમ આરોગ્ય જોખમ દર્શાવે છે.` : `Current AQI of ${aqi} (${aqiCat}) presents minimal health concerns for general demographics.`,
      timing: language === 'hi' ? 'दिन भर' : language === 'gu' ? 'દિવસ દરમિયાન' : 'Throughout daytime hours',
      personal_benefit:
        language === 'hi' ? 'ताजी हवा श्वसन स्वास्थ्य और मानसिक ताजगी बढ़ाती है।' : language === 'gu' ? 'તાજી હવા શ્વસન સ્વાસ્થ્ય વધારે છે.' : 'Fresh air circulation reduces stale indoor carbon dioxide buildup and promotes respiratory wellness.',
      environmental_benefit:
        language === 'hi' ? 'पैदल या साइकिल का उपयोग करने का आदर्श समय है।' : language === 'gu' ? 'ચાલવા અથવા સાયકલ ચલાવવા માટે આદર્શ સમય છે.' : 'Favorable conditions encourage zero-emission active mobility (walking/cycling).',
    });
  }

  // Rec 2: Demographic-Specific Guidance
  if (userCat === 'student') {
    recommendations.push({
      category: language === 'hi' ? 'विद्यार्थी मार्गदर्शन' : language === 'gu' ? 'વિદ્યાર્થી માર્ગદર્શન' : 'Student Guidance',
      action:
        isUnhealthy
          ? language === 'hi'
            ? 'स्कूल/कॉलेज जाते समय बस या वैन की खिड़कियां बंद रखें और N95 मास्क पहनें; खुले मैदान में शारीरिक खेलकूद से बचें।'
            : language === 'gu'
            ? 'સ્કૂલ/કોલેજ જતી વખતે બારીઓ બંધ રાખો અને N95 માસ્ક પહેરો; ખુલ્લા મેદાનમાં રમતો રમવાનું ટાળો.'
            : 'Wear a fitted N95 respirator during school commute, keep transit windows closed, and request indoor library/gymnasium recreation.'
          : language === 'hi'
          ? 'साइकिल चलाते समय व्यस्त राजमार्गों के बजाय शांत आवासीय गलियों का चयन करें।'
          : language === 'gu'
          ? 'સાયકલ ચલાવતી વખતે ટ્રાફિક વાળા રસ્તાઓને બદલે શાંત શેરીઓ પસંદ કરો.'
          : 'Commute along segregated residential streets rather than heavy diesel trucking corridors.',
      reason:
        language === 'hi'
          ? 'छात्रों के फेफड़े अभी विकसित हो रहे होते हैं, जिससे वे स्मॉग के प्रति अधिक संवेदनशील होते हैं।'
          : language === 'gu'
          ? 'વિદ્યાર્થીઓના ફેફસાં હજુ વિકસિત થઈ રહ્યા હોય છે, તેથી તેઓ સ્મોગ પ્રત્યે વધુ સંવેદનશીલ હોય છે.'
          : 'Developing respiratory systems in students have higher ventilation rates per kilogram of body weight.',
      timing: language === 'hi' ? 'सुबह के स्कूल आने-जाने के समय' : language === 'gu' ? 'સવારના સ્કૂલ જવાના સમયે' : 'Morning and afternoon transit hours',
      personal_benefit:
        language === 'hi' ? 'खांसी, गले में खराश और ध्यान भटकने से सुरक्षा।' : language === 'gu' ? 'ખાંસી અને ગળામાં બળતરાથી રક્ષણ.' : 'Protects against acute cough, throat scratchiness, and cognitive fatigue caused by carbon monoxide.',
      environmental_benefit:
        language === 'hi' ? 'स्कूल बस या सार्वजनिक परिवहन का उपयोग निजी कार उत्सर्जन को घटाता है।' : language === 'gu' ? 'સ્કૂલ બસનો ઉપયોગ પ્રદૂષણ ઘટાડે છે.' : 'School bus pooling eliminates private individual vehicle trips at school gates.',
    });
  } else if (userCat === 'elderly' || user.ageGroup === 'above_60') {
    recommendations.push({
      category: language === 'hi' ? 'वरिष्ठ नागरिक सुरक्षा' : language === 'gu' ? 'વડીલોની સુરક્ષા' : 'Family & Senior Protection',
      action:
        isUnhealthy
          ? language === 'hi'
            ? 'सुबह की सैर पूरी तरह बंद रखें; घर के अंदर ही टहलें और निर्धारित इनहेलर/दवाएं समय पर लें।'
            : language === 'gu'
            ? 'સવારનું વોકિંગ બંધ રાખો; ઘરની અંદર જ હળવી કસરત કરો અને નિયમિત દવાઓ સમયસર લો.'
            : 'Suspend early morning park walks entirely; exercise indoors and keep prescribed cardiac/asthma bronchodilators accessible.'
          : language === 'hi'
          ? 'दोपहर के समय हल्की धूप में टहलें जब हवा साफ और गर्म हो।'
          : language === 'gu'
          ? 'બપોરે જ્યારે હવા સાફ અને ગરમ હોય ત્યારે જ થોડું ચાલો.'
          : 'Take mild strolls during sunny midday hours when ambient temperature is comfortable and smog dispersion is optimal.',
      reason:
        language === 'hi'
          ? 'ठंड और स्मॉग का मिश्रण रक्तचाप बढ़ाता है और हृदय व फेफड़ों पर अतिरिक्त तनाव डालता है।'
          : language === 'gu'
          ? 'ઠંડી અને સ્મોગનું મિશ્રણ બ્લડ પ્રેશર વધારે છે અને હૃદય પર દબાણ લાવે છે.'
          : 'Cold air combined with particulate spikes triggers vasoconstriction, elevating myocardial oxygen demand and blood pressure.',
      timing: language === 'hi' ? 'सुबह 05:30 से 09:30 के बीच' : language === 'gu' ? 'સવારે 05:30 થી 09:30 વચ્ચે' : 'Early dawn and morning hours',
      personal_benefit:
        language === 'hi' ? 'हार्ट अटैक, ब्रोंकाઇટિસ और सांस की तकलीफ के जोखिम को कम करता है।' : language === 'gu' ? 'હૃદય અને શ્વાસની બીમારીના જોખમને ઘટાડે છે.' : 'Significantly reduces cardiovascular ischemic events and acute bronchospasms.',
      environmental_benefit:
        language === 'hi' ? 'आवासीय क्षेत्रों में कचरा या पत्तियां जलाने से बचें।' : language === 'gu' ? 'કચરો કે પાંદડા સળગાવવાનું ટાળો.' : 'Promotes community smoke-free zones by discouraging garden biomass burning.',
    });
  } else if (userCat === 'professional') {
    recommendations.push({
      category: language === 'hi' ? 'कार्यरत पेशेवर' : language === 'gu' ? 'વ્યવસાયિક માર્ગદર્શન' : 'Working Professionals',
      action:
        isSevere || isVeryPoor
          ? language === 'hi'
            ? 'यदि संभव हो तो वर्क-फ्रॉम-होम (WFH) का विकल्प चुनें या मेट्रो/कारपूलिंग का उपयोग करें।'
            : language === 'gu'
            ? 'શક્ય હોય તો વર્ક-ફ્રોમ-હોમ (WFH) પસંદ કરો અથવા મેટ્રો/કારપૂલિંગનો ઉપયોગ કરો.'
            : 'Request work-from-home (WFH) flexibility where feasible, or commute via electric metro rail with car recirculation enabled.'
          : language === 'hi'
          ? 'कार में अकेले यात्रा करने के बजाय मेट्रो या सहकर्मियों के साथ कारपूलिंग अपनाएं।'
          : language === 'gu'
          ? 'કારમાં એકલા મુસાફરી કરવાને બદલે મેટ્રો અથવા કારપૂલિંગ પસંદ કરો.'
          : 'Opt for mass transit or carpooling to reduce personal driving exposure and highway bottlenecks.',
      reason:
        language === 'hi'
          ? 'ट्रैफिक जाम में वाहन चलाने से बंद कार में भी इनडोर एयर के मुकाबले 3 गुना ज्यादा धुआं भरता है।'
          : language === 'gu'
          ? 'ટ્રાફિકમાં વાહન ચલાવતી વખતે કારની અંદર પણ પુષ્કળ પ્રદૂષણ પ્રવેશે છે.'
          : 'Traffic congestion traps commuters in near-source exhaust plumes containing dangerous VOCs and ultra-fine carbon particles.',
      timing: language === 'hi' ? 'दैनिक ऑफिस आवागमन के समय' : language === 'gu' ? 'ઓફિસ જવા-આવવાના સમયે' : 'Morning and evening rush hour commute',
      personal_benefit:
        language === 'hi' ? 'ट्रैफिक तनाव और फेफड़ों में जहरीले धुएं के सीधे प्रवेश से बचाव।' : language === 'gu' ? 'માનસિક તણાવ અને ઝેરી ધુમાડાથી બચાવ.' : 'Reduces cognitive fatigue and avoids breathing concentrated diesel exhaust plumes.',
      environmental_benefit:
        language === 'hi' ? 'एक कार कम होने से प्रतिदिन लगभग 4-6 किलोग्राम CO2 और पार्टिकुलेट उत्सर्जन रुकता है।' : language === 'gu' ? 'કારપૂલિંગથી વાહનનું ઉત્સર્જન ઘટે છે.' : 'Carpooling or rail transit averts an estimated 4.2 kg of CO2 and tailpipe PM emissions per commuter journey.',
    });
  } else {
    recommendations.push({
      category: language === 'hi' ? 'परिवार व घरेलू सुरक्षा' : language === 'gu' ? 'પરિવારની સુરક્ષા' : 'Family Protection',
      action:
        language === 'hi'
          ? 'घर के मुख्य कमरों में इनडोर हवा को साफ रखें; बच्चों को शाम 07:00 बजे के बाद बाहर खेलने न भेजें।'
          : language === 'gu'
          ? 'ઘરની હવા શુદ્ધ રાખો; બાળકોને સાંજે 07:00 વાગ્યા પછી બહાર રમવા ન મોકલો.'
          : 'Keep children engaged in indoor creative play during peak evening smog hours; seal drafty windows with foam strips.',
      reason:
        language === 'hi'
          ? 'शाम के समय तापमान गिरते ही प्रदूषण जमीन की सतह पर जम जाता है।'
          : language === 'gu'
          ? 'સાંજે તાપમાન ઘટતાં જ પ્રદૂષણ જમીનની સપાટી પર જમા થાય છે.'
          : 'Thermal inversion intensifies post-sunset as ground temperatures cool, trapping toxic PM2.5 near breathing level.',
      timing: language === 'hi' ? 'शाम 06:30 से रात तक' : language === 'gu' ? 'સાંજે 06:30 થી રાત્રિ સુધી' : 'Late evening through night',
      personal_benefit:
        language === 'hi' ? 'बच्चों और परिवार के सदस्यों में रात की खांसी और एलर्जी कम करता है।' : language === 'gu' ? 'રાત્રે ઉધરસ અને એલર્જીથી રાહત આપે છે.' : 'Prevents nocturnal asthma awakenings and allergic respiratory cough in children.',
      environmental_benefit:
        language === 'hi' ? 'घर में अगरबत्ती या मोमबत्ती न जलाने से इनडोर वायु प्रदूषण तुरंत घटता है।' : language === 'gu' ? 'ઘરમાં અગરબત્તી ન સળગાવવાથી ઇન્ડોર પ્રદૂષણ ઘટે છે.' : 'Eliminating indoor combustion reduces domestic contribution to local air stagnation.',
    });
  }

  // Rec 3: Indoor Air Quality & Plant Myths vs Realities
  recommendations.push({
    category: language === 'hi' ? 'इनडोर वायु गुणवत्ता' : language === 'gu' ? 'ઇન્ડોર હવાની ગુણવત્તા' : 'Indoor Air Quality',
    action:
      language === 'hi'
        ? 'घर में अगरबत्ती/धूपबत्ती जलाने से बचें, सूखे झाड़ू के बदले गीला पोछा लगाएं और खिड़कियों के किनारों को सील रखें।'
        : language === 'gu'
        ? 'ઘરમાં અગરબત્તી કે ધૂપ કરવાનું ટાળો, સૂકા કચરાના બદલે ભીનું પોતું કરો અને બારીઓ સીલ રાખો.'
        : 'Avoid burning incense, mosquito coils, or candles indoors; practice damp microfiber mopping; and understand that while indoor plants provide aesthetic appeal, they cannot filter dense particulate PM2.5 like true HEPA filters.',
    reason:
      language === 'hi'
        ? 'अगरबत्ती का धुआं सिगरेट के धुएं जितने ही महीन कण (PM2.5) छोड़ता है, जिससे घर की हवा बाहर से भी ज्यादा जहरीली हो सकती है।'
        : language === 'gu'
        ? 'અગરબત્તીનો ધુમાડો સિગારેટ જેટલા જ સૂક્ષ્મ કણો (PM2.5) છોડે છે, જે ઘરની હવાને ઝેરી બનાવી શકે છે.'
        : 'Indoor combustion from incense sticks releases ultra-fine carbonaceous particles (50-200 µg/m³ spike) into confined living rooms.',
    timing: language === 'hi' ? 'दैनिक घरेलू दिनचर्या में' : language === 'gu' ? 'દૈનિક ઘરકામ દરમિયાન' : 'Continuous household practice',
    personal_benefit:
      language === 'hi' ? 'बिना महंगे उपकरणों के भी इनडोर प्रदूषण में 40-50% तक कमी।' : language === 'gu' ? 'મોંઘા સાધનો વિના પણ ઇન્ડોર પ્રદૂષણમાં 40-50% ઘટાડો.' : 'Affordable dust-trapping technique drops indoor particulate load by 40% without expensive machinery.',
    environmental_benefit:
      language === 'hi' ? 'अनावश्यक ऊर्जा और अगरबत्ती के धुएं को कम करना।' : language === 'gu' ? 'બિનજરૂરી ધુમાડો ઘટાડવો.' : 'Reduces secondary indoor volatile organics and particulate emissions into neighborhood micro-climate.',
  });

  // Rec 4: Low-Emission Lifestyle Alternative
  recommendations.push({
    category: language === 'hi' ? 'कम-उत्सर्जन जीवनशैली' : language === 'gu' ? 'ઓછા પ્રદૂષણ વાળી જીવનશૈલી' : 'Low-Emission Alternatives',
    action:
      language === 'hi'
        ? 'छोटी दूरियों के लिए कई बार कार निकालने के बजाय कामों को एक ही यात्रा में जोड़ें या इलेक्ट्रिक बस/मेट्रो चुनें।'
        : language === 'gu'
        ? 'નાની મુસાફરી માટે વારંવાર વાહન કાઢવાને બદલે બધા કામ એક સાથે પતાવો અથવા ઇલેક્ટ્રિક બસ/મેટ્રો વાપરો.'
        : 'Consolidate multiple errands into a single trip and switch short solo vehicular trips to clean public transit or carpooling.',
    reason:
      language === 'hi'
        ? 'ठंडे इंजन वाले वाहनों से पहले 5 मिनट में सबसे अधिक जहरीला धुआं निकलता है।'
        : language === 'gu'
        ? 'ઠંડા એન્જિન વાળા વાહનો શરૂઆતના 5 મિનિટમાં સૌથી વધુ ઝેરી ધુમાડો છોડે છે.'
        : 'Cold-start engines generate up to 60% of their trip emissions in the first 5 minutes of short errand driving.',
    timing: language === 'hi' ? 'साप्ताहिक खरीदारी और आवागमन में' : language === 'gu' ? 'સાપ્તાહિક ખરીદી અને મુસાફરીમાં' : 'Daily errand scheduling',
    personal_benefit:
      language === 'hi' ? 'ईंधन की बचत और ट्रैफिक में कम समय बिताना।' : language === 'gu' ? 'ઇંધણની બચત અને સમયની બચત.' : 'Saves direct fuel expenditure and limits individual exposure to idling stop-and-go congestion corridors.',
    environmental_benefit:
      language === 'hi' ? 'प्रति व्यक्ति कार्बन फुटप्रिंट और शहरी स्मॉग में सीधी कमी।' : language === 'gu' ? 'શહેરી સ્મોગ અને કાર્બન ઉત્સર્જનમાં ઘટાડો.' : 'Directly reduces per-capita hydrocarbon, NOx, and fine soot emissions contributing to city smog blankets.',
  });

  // Dynamic Daily Routine
  const daily_routine = {
    morning:
      isSevere || isVeryPoor
        ? language === 'hi'
          ? '06:00-09:30: बाहरी वॉक या रनिंग पूरी तरह रद्द रखें। खिड़कियां बंद रखें। स्कूल/ऑफिस यात्रा में N95 मास्क पहनें।'
          : language === 'gu'
          ? '06:00-09:30: સવારનું વોકિંગ બંધ રાખો. બારીઓ બંધ રાખો. મુસાફરીમાં N95 માસ્ક પહેરો.'
          : '06:00–09:30: Strictly cancel outdoor cardio. Keep all windows sealed. Wear an N95 respirator if stepping outside.'
        : language === 'hi'
        ? '07:00-09:00: हल्का इनडोर व्यायाम करें। व्यस्त सड़कों से दूर रहें।'
        : language === 'gu'
        ? '07:00-09:00: ઘરની અંદર હળવી કસરત કરો. ભારે ટ્રાફિકથી દૂર રહો.'
        : '07:00–09:00: Light stretching indoors. If commuting, prefer sheltered rail or carpool.',
    afternoon:
      language === 'hi'
        ? '12:00-15:30: दिन का सबसे सुरक्षित समय। आवश्यक बाहरी कार्य पूरे करें। यदि हवा बेहतर हो तो 20 मिनट के लिए कमरे वेंटिलेट करें।'
        : language === 'gu'
        ? '12:00-15:30: દિવસનો સૌથી સલામત સમય. જરૂરી બહારના કામ પતાવો. જો હવા યોગ્ય હોય તો થોડીવાર બારી ખોલો.'
        : '12:00–15:30: Safest diurnal window. Run outdoor errands now. Brief cross-ventilation (15-20 min) is permissible if sunlight breaks inversion.',
    evening:
      isSevere || isVeryPoor
        ? language === 'hi'
          ? '17:30-20:30: तापमान गिरते ही स्मॉग फिर बढ़ेगा। बच्चों को इनडोर रखें। घर लौटते ही हाथ-मुंह धोएं और गर्म पेय पिएं।'
          : language === 'gu'
          ? '17:30-20:30: તાપમાન ઘટતાં સ્મોગ ફરી વધશે. બાળકોને ઘરની અંદર રાખો. ઘરે આવીને ગરમ પાણી પીવો.'
          : '17:30–20:30: Inversion intensifies. Keep children indoors. Wash face and eyes with clean water upon arriving home; drink warm fluids.'
        : language === 'hi'
        ? '18:00-20:00: बाहरी गतिविधियों को सीमित करें। कारपूल या मेट्रो से घर लौटें।'
        : language === 'gu'
        ? '18:00-20:00: બહારની પ્રવૃત્તિઓ મર્યાદિત કરો. મેટ્રો અથવા કારપૂલથી પાછા ફરો.'
        : '18:00–20:00: Moderate transit exposure. Seal car ventilation to internal air recirculation mode.',
    night:
      language === 'hi'
        ? '21:00 onwards: खिड़कियां अच्छी तरह बंद रखें। एयर प्यूरीफायर को स्लीप मोड पर चालू रखें या कमरे में गीला पोछा लगाकर सोएं।'
        : language === 'gu'
        ? '21:00 પછી: બારીઓ બરાબર બંધ રાખો. એર પ્યુરિફાયર ચાલુ રાખો અથવા રૂમમાં ભીનું પોતું કરીને સૂવો.'
        : '21:00 onwards: Ensure bedroom windows are latched tightly. Run HEPA air purifier on quiet night mode or place a damp towel near door draft gaps.',
  };

  // Summary Text
  let summary = '';
  if (language === 'hi') {
    summary = `${location} में वर्तमान वायु गुणवत्ता सूचकांक (AQI) ${aqi} (${aqiCat}) है, जिसमें मुख्य प्रदूषक PM2.5 (${pm25} µg/m³) है। ${
      isUnhealthy
        ? 'यह स्तर श्वसन तंत्र के लिए अत्यंत संवेदनशील है। अनावश्यक बाहरी गतिविधियों से बचें और घर के अंदर सुरक्षित हवा बनाए रखें।'
        : 'वर्तमान स्थिति मध्यम है। संवेदनशील व्यक्तियों को सुबह के समय सावधानी बरतने की सलाह दी जाती है।'
    }`;
  } else if (language === 'gu') {
    summary = `${location} માં વર્તમાન એર ક્વોલિટી ઇન્ડેક્સ (AQI) ${aqi} (${aqiCat}) છે, જેમાં મુખ્ય પ્રદૂષક PM2.5 (${pm25} µg/m³) છે. ${
      isUnhealthy
        ? 'આ સ્તર શ્વાસ માટે જોખમી છે. બિનજરૂરી બહાર જવાનું ટાળો અને ઘરની અંદર સુરક્ષિત રહો.'
        : 'હાલની સ્થિતિ મધ્યમ છે. સંવેદનશીલ લોકોએ સવારના સમયે સાવચેત રહેવું જોઈએ.'
    }`;
  } else {
    summary = `Current air quality in ${location} is ${aqiCat} with an AQI of ${aqi} (dominant pollutant: PM2.5 at ${pm25} µg/m³, ${
      pm25 > 60 ? `${(pm25 / 60).toFixed(1)}x over CPCB 24-hr threshold` : 'within permissible limit'
    }). Temperature is ${env.weather.temperature}°C with ${env.weather.humidity}% humidity. ${
      isUnhealthy
        ? 'High particulate concentration and low thermal dispersion warrant strict preventive measures for sensitive respiratory tracts.'
        : 'Atmospheric conditions are relatively moderate; schedule physical exertion during afternoon dispersion windows.'
    }`;
  }

  // Follow-up suggestions
  const follow_up_questions =
    language === 'hi'
      ? [
          'क्या मेरे परिवार के लिए बाहर जाना सुरक्षित है?',
          'सर्दियों में व्यायाम करने का सबसे सुरक्षित समय कौन सा है?',
          'कम खर्च में इनडोर एयर क्वालिटी कैसे सुधारें?',
          'क्या इनडोर प्लांट्स एयर प्यूरीफायर की जगह ले सकते हैं?',
        ]
      : language === 'gu'
      ? [
          'શું મારા પરિવાર માટે બહાર જવું સલામત છે?',
          'કસરત કરવા માટે સૌથી સલામત સમય કયો છે?',
          'ઓછા ખર્ચે ઘરની હવા કેવી રીતે શુદ્ધ કરવી?',
          'શું ઇન્ડોર પ્લાન્ટ્સ એર પ્યુરિફાયરનું સ્થાન લઈ શકે?',
        ]
      : [
          'Is it safe for my family to go outside today?',
          'What is the safest time to exercise today?',
          'How can I improve indoor air quality affordably?',
          'Do houseplants actually remove PM2.5 smog?',
          'What if I commute during peak traffic hours?',
        ];

  return {
    summary,
    current_conditions: {
      locationName: location,
      aqi,
      category: aqiCat,
      dominant_pollutant: env.dominantPollutant,
      pm25,
      pm10: env.pollutants.pm10,
      temperature: env.weather.temperature,
      data_timestamp: env.lastUpdated,
      is_live: !env.isDemo,
    },
    risk_level: aqiCat,
    user_context_applied: {
      category: userCat,
      age_group: user.ageGroup,
    },
    recommendations,
    daily_routine,
    what_if_analysis: whatIfAnalysis,
    alternatives: [
      language === 'hi' ? 'खुली हवा में दौड़ने के बजाय इनडोर योगाभ्यास' : language === 'gu' ? 'બહાર દોડવાને બદલે ઇન્ડોર યોગ' : 'Indoor cardiovascular workouts instead of outdoor park running',
      language === 'hi' ? 'अकेले कार चलाने के बजाय मेट्रो या कारपूलिंग' : language === 'gu' ? 'કારને બદલે મેટ્રો અથવા કારપૂલિંગ' : 'Electric metro or carpool rideshare instead of single-occupancy driving',
      language === 'hi' ? 'अगरबत्ती के बदले एलईडी सुगंध विसारक' : language === 'gu' ? 'અગરબત્તીને બદલે ધુમાડા રહિત સુગંધ' : 'Non-combustion domestic humidification instead of incense burning',
    ],
    limitations: [
      language === 'hi'
        ? 'यह सामान्य पर्यावरणीय स्वास्थ्य सलाह है और इसे चिकित्सीय निदान या नुस्खे के रूप में न लें।'
        : language === 'gu'
        ? 'આ માત્ર સામાન્ય પર્યાવરણીય સલાહ છે, તેને તબીબી સલાહ ન ગણવી.'
        : 'Guidance is derived from ambient CPCB & Copernicus sensor models and does not substitute for personalized clinical medical diagnosis.',
      !env.isDemo
        ? language === 'hi'
          ? `डेटा स्रोत: ${env.dataSource} (रीडिंग: ${new Date(env.lastUpdated).toLocaleTimeString()})`
          : language === 'gu'
          ? `ડેટા સ્ત્રોત: ${env.dataSource}`
          : `Live telemetry sourced from: ${env.dataSource} (${new Date(env.lastUpdated).toLocaleTimeString()})`
        : language === 'hi'
        ? 'लाइव सेंसर अनुपलब्ध होने के कारण यह सिमुलेशन डेटा है।'
        : language === 'gu'
        ? 'લાઈવ સેન્સર ઉપલબ્ધ ન હોવાથી આ સિમ્યુલેશન ડેટા છે.'
        : 'External live telemetry currently offline; recommendations are based on regional winter inversion baseline simulation.',
    ],
    follow_up_questions,
  };
};
