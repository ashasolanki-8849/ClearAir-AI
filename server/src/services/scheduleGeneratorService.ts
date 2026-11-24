import { IPlannedActivity, PlanPeriod } from '../models/DailyPlan.js';
import { ILifestyleProfile } from '../models/LifestyleProfile.js';
import { AQIResponseData } from './aqiService.js';

export interface ScheduleGeneratorInput {
  aqiData: AQIResponseData;
  lifestyle: Partial<ILifestyleProfile>;
  language?: 'en' | 'hi' | 'gu';
}

export const generatePersonalizedSchedule = (input: ScheduleGeneratorInput): IPlannedActivity[] => {
  const { aqiData, lifestyle, language = 'en' } = input;
  const aqi = aqiData.aqi;
  const aqiCat = aqiData.aqiCategory;
  const pm25 = aqiData.pollutants.pm25;
  const location = aqiData.location.name;

  const isSevere = aqi >= 400 || aqiCat === 'Severe';
  const isVeryPoor = (aqi >= 301 && aqi < 400) || aqiCat === 'Very Poor';
  const isPoor = (aqi >= 201 && aqi <= 300) || aqiCat === 'Poor';
  const isModerate = (aqi >= 101 && aqi <= 200) || aqiCat === 'Moderate';
  const isUnhealthy = aqi > 200;

  const userCat = lifestyle.userCategory || 'professional';
  const schedule = lifestyle.schedule || {
    wakeUpTime: '06:30',
    sleepTime: '22:30',
    workOrSchoolStart: '09:00',
    workOrSchoolEnd: '17:30',
    exerciseTime: '07:00',
    travelTimings: { morningCommute: '08:30', eveningCommute: '17:30' },
  };

  const activities: IPlannedActivity[] = [];

  // ==========================================
  // 1. EARLY MORNING (06:00 - 08:00)
  // ==========================================
  const earlyMorningRisk: 'severe' | 'high' | 'moderate' | 'low' = isSevere
    ? 'severe'
    : isVeryPoor || isPoor
    ? 'high'
    : isModerate
    ? 'moderate'
    : 'low';

  let earlyAct = '';
  let earlyReason = '';
  let earlyAlt = '';
  let earlyPersonalBenefit = '';
  let earlyEnvBenefit = '';
  let earlyType: 'indoor' | 'outdoor' | 'transit' = 'indoor';

  if (isUnhealthy) {
    earlyType = 'indoor';
    if (userCat === 'student') {
      earlyAct =
        language === 'hi'
          ? 'कमरे के अंदर योग व श्वसन व्यायाम'
          : language === 'gu'
          ? 'રૂમની અંદર યોગ અને શ્વાસની કસરત'
          : 'Indoor yoga, light stretching & hydration';
      earlyReason =
        language === 'hi'
          ? `सुबह का तापमान कम होने से स्मॉग जमीन की सतह पर जम गया है (AQI ${aqi}, PM2.5 ${pm25} µg/m³)।`
          : language === 'gu'
          ? `સવારનું તાપમાન ઓછું હોવાથી સ્મોગ જમીનની સપાટી પર જમા છે (AQI ${aqi})।`
          : `Cold thermal boundary layer traps heavy PM2.5 (${pm25} µg/m³) at breathing height across ${location}.`;
      earlyAlt =
        language === 'hi'
          ? 'बिस्तर पर हल्की स्ट्रेचिंग व ध्यान'
          : language === 'gu'
          ? 'હળવી સ્ટ્રેચિંગ અને ધ્યાન'
          : 'Gentle bed stretching & mindfulness';
    } else if (userCat === 'elderly') {
      earlyAct =
        language === 'hi'
          ? 'घर के अंदर धीमी गति से चलना व दवाइयां लेना'
          : language === 'gu'
          ? 'ઘરની અંદર ધીમેથી ચાલવું અને દવાઓ લેવી'
          : 'Indoor living room walking & morning health check';
      earlyReason =
        language === 'hi'
          ? 'सर्द हवा और धुएं से रक्तचाप व सांस की नली में अचानक खिंचाव हो सकता है।'
          : language === 'gu'
          ? 'ઠંડી હવા અને ધુમાડો બ્લડ પ્રેશર અને શ્વાસનળીમાં તકલીફ કરી શકે છે.'
          : 'Morning chill combined with ambient smog induces acute airway constriction in vulnerable lungs.';
      earlyAlt =
        language === 'hi'
          ? 'कुर्सी पर बैठकर प्राणायाम'
          : language === 'gu'
          ? 'ખુરશી પર બેસીને શ્વાસોચ્છવાસની કસરત'
          : 'Seated deep breathing in a closed room';
    } else {
      earlyAct =
        language === 'hi'
          ? 'इनडोर वर्कआउट या रेजिस्टेंस ट्रेनिंग'
          : language === 'gu'
          ? 'ઇન્ડોર વર્કઆઉટ અથવા રેઝિસ્ટન્સ ટ્રેનિંગ'
          : 'Indoor bodyweight / cardio routine in a sealed room';
      earlyReason =
        language === 'hi'
          ? `सुबह 06:00 से 08:30 के बीच बाहरी हवा सबसे अधिक विषैली है (AQI ${aqi})।`
          : language === 'gu'
          ? `સવારે 06:00 થી 08:30 વચ્ચે બહારની હવા સૌથી વધુ ઝેરી હોય છે.`
          : `Ground-level smog peaks before sunrise; outdoor running causes 4x deeper particulate lung penetration.`;
      earlyAlt =
        language === 'hi'
          ? 'घर में ट्रेडमिल या इनडोर साइकिलिंग'
          : language === 'gu'
          ? 'ઘરમાં ટ્રેડમિલ અથવા સાઇકલિંગ'
          : 'Stationary cycling or foam roller recovery';
    }
    earlyPersonalBenefit =
      language === 'hi'
        ? 'फेफड़ों में 80% से अधिक खतरनाक पार्टिकुलेट जाने से बचते हैं।'
        : language === 'gu'
        ? 'ફેફસામાં 80% થી વધુ ઝેરી કણો જતાં અટકે છે.'
        : 'Prevents acute microvascular inflammation caused by inhaling cold morning soot.';
    earlyEnvBenefit =
      language === 'hi'
        ? 'घर में व्यायाम करने से सुबह की अनावश्यक वाहन यात्रा रुकती है।'
        : language === 'gu'
        ? 'ઘરે કસરત કરવાથી સવારની મુસાફરી અટકે છે.'
        : 'Eliminates vehicle travel to commercial gyms or distant parks.';
  } else {
    earlyType = 'outdoor';
    earlyAct =
      language === 'hi'
        ? 'पार्क में हल्की मॉर्निंग वॉक'
        : language === 'gu'
        ? 'બગીચામાં હળવું મોર્નિંગ વોકિંગ'
        : 'Brisk park walk / gentle outdoor jogging';
    earlyReason =
      language === 'hi'
        ? `वर्तमान AQI ${aqi} (${aqiCat}) सुरक्षित बाहरी व्यायाम की अनुमति देता है।`
        : language === 'gu'
        ? `હાલનો AQI ${aqi} સુરક્ષિત બહાર કસરત કરવાની મંજૂરી આપે છે.`
        : `Acceptable ambient conditions (${aqiCat}) permit moderate outdoor physical conditioning.`;
    earlyAlt =
      language === 'hi'
        ? 'छत या बालकनी पर योग'
        : language === 'gu'
        ? 'બાલ્કનીમાં યોગ'
        : 'Balcony stretching & sun exposure';
    earlyPersonalBenefit =
      language === 'hi'
        ? 'हृदय और फेफड़ों की कार्यक्षमता में प्राकृतिक सुधार।'
        : language === 'gu'
        ? 'હૃદય અને ફેફસાંની ક્ષમતામાં સુધારો.'
        : 'Stimulates cardiovascular stamina and natural vitamin D synthesis.';
    earlyEnvBenefit =
      language === 'hi'
        ? 'पैदल चलने से शून्य उत्सर्जन जीवनशैली को बढ़ावा।'
        : language === 'gu'
        ? 'ચાલવાથી શૂન્ય પ્રદૂષણ.'
        : 'Promotes active non-motorized mobility.';
  }

  activities.push({
    id: `act_early_${Date.now()}_1`,
    period: 'early_morning',
    periodLabel: language === 'hi' ? 'प्रातःकाल (06:00 - 08:00)' : language === 'gu' ? 'વહેલી સવાર (06:00 - 08:00)' : 'Early Morning (06:00 - 08:00)',
    activity: earlyAct,
    recommendedTime: schedule.exerciseTime || '06:45',
    indoorOutdoor: earlyType,
    pollutionRisk: earlyMorningRisk,
    reason: earlyReason,
    alternativeActivity: earlyAlt,
    expectedBenefit: earlyPersonalBenefit,
    personalBenefit: earlyPersonalBenefit,
    environmentalBenefit: earlyEnvBenefit,
    status: 'pending',
    isCustom: false,
    isAlternativeApplied: false,
  });

  // ==========================================
  // 2. MORNING COMMUTE / TRANSIT (08:00 - 11:30)
  // ==========================================
  const commuteTime = schedule.travelTimings?.morningCommute || '08:30';
  let mornAct = '';
  let mornReason = '';
  let mornAlt = '';
  let mornPersonal = '';
  let mornEnv = '';

  if (userCat === 'student') {
    mornAct =
      language === 'hi'
        ? 'स्कूल/कॉलेज यात्रा: N95 मास्क पहनें और बस खिड़की बंद रखें'
        : language === 'gu'
        ? 'સ્કૂલ યાત્રા: N95 માસ્ક પહેરો અને બારી બંધ રાખો'
        : 'School/College Commute: Sealed bus/transit with N95 mask';
    mornReason =
      language === 'hi'
        ? 'सुबह 8 से 10 बजे के बीच स्कूल और दफ्तर के ट्रैफिक से सड़क पर डीजल धुआं अत्यधिक होता है।'
        : language === 'gu'
        ? 'સવારે સ્કૂલ અને ઓફિસ ટ્રાફિકને કારણે ડીઝલનો ધુમાડો વધુ હોય છે.'
        : 'Heavy morning congestion elevates roadside ultrafine particle and NO2 spikes by 2.5x.';
    mornAlt =
      language === 'hi'
        ? 'माता-पिता के साथ कारपूल या स्कूल वैन'
        : language === 'gu'
        ? 'કારપૂલિંગ અથવા સ્કૂલ બસ'
        : 'Shared neighborhood school carpooling';
  } else if (userCat === 'elderly' || userCat === 'homemaker') {
    mornAct =
      language === 'hi'
        ? 'घर में वेंटिलेशन बंद रखें व इनडोर घरेलू कार्य पूरे करें'
        : language === 'gu'
        ? 'ઘરની બારીઓ બંધ રાખો અને ઇન્ડોર કામ પતાવો'
        : 'Indoor household management; keep windows sealed against street exhaust';
    mornReason =
      language === 'hi'
        ? 'सड़क का ट्रैफिक धुआं खुली खिड़कियों से घर में तेजी से प्रवेश करता है।'
        : language === 'gu'
        ? 'ટ્રાફિકનો ધુમાડો ખુલ્લી બારીઓમાંથી ઘરમાં પ્રવેશે છે.'
        : 'Morning traffic plume equilibrates into unsealed street-facing rooms within 20 minutes.';
    mornAlt =
      language === 'hi'
        ? 'गीले पोछे से फर्श की सफाई (सूखे झाड़ू के बदले)'
        : language === 'gu'
        ? 'ભીનું પોતું કરીને સફાઈ કરવી'
        : 'Damp microfiber dusting & sealed room maintenance';
  } else {
    mornAct =
      isSevere
        ? language === 'hi'
          ? 'वर्क-फ्रॉम-होम (WFH) या मेट्रो रेल से सुरक्षित ऑफिस आवागमन'
          : language === 'gu'
          ? 'વર્ક-ફ્રોમ-હોમ (WFH) અથવા મેટ્રોથી મુસાફરી'
          : 'Work-from-Home flexibility or air-conditioned Metro Rail commute'
        : language === 'hi'
        ? 'मेट्रो या कारपूलिंग द्वारा ऑफिस यात्रा (कार री-सर्कुलेशन ऑन)'
        : language === 'gu'
        ? 'મેટ્રો અથવા કારપૂલિંગથી ઓફિસ મુસાફરી'
        : 'Office Commute via Metro Rail / Carpool with internal cabin air recirculation';
    mornReason =
      language === 'hi'
        ? `ट्रैफिक जाम में बंद कार भी 3 गुना जहरीला धुआं खींचती है (AQI ${aqi})।`
        : language === 'gu'
        ? `ટ્રાફિકમાં કાર પણ ઝેરી ધુમાડો ખેંચે છે (AQI ${aqi})।`
        : `Idling vehicular corridors concentrate carcinogenic benzene and nitrogen dioxide.`;
    mornAlt =
      language === 'hi'
        ? 'ऑफ-पीक समय में सुबह 10:30 बजे ऑफिस निकलें'
        : language === 'gu'
        ? 'ઓફ-પીક સમયે 10:30 વાગ્યે નીકળો'
        : 'Shift commute departure to staggered off-peak window (10:15)';
  }

  mornPersonal =
    language === 'hi'
      ? 'सड़क किनारे के सीधे जहरीले धुएं से बचाव।'
      : language === 'gu'
      ? 'રસ્તા પરના ઝેરી ધુમાડાથી બચાવ.'
      : 'Cuts direct roadside soot and volatile organic inhalation by 70%.';
  mornEnv =
    language === 'hi'
      ? 'सार्वजनिक परिवहन से शहर के ट्रैफिक और धुएं में कमी।'
      : language === 'gu'
      ? 'પબ્લિક ટ્રાન્સપોર્ટથી ટ્રાફિક અને ધુમાડો ઘટે છે.'
      : 'Mass transit avoids individual fossil fuel burn across congested highways.';

  activities.push({
    id: `act_morn_${Date.now()}_2`,
    period: 'morning',
    periodLabel: language === 'hi' ? 'सुबह का आवागमन (08:30 - 11:30)' : language === 'gu' ? 'સવારની મુસાફરી (08:30 - 11:30)' : 'Morning Commute (08:30 - 11:30)',
    activity: mornAct,
    recommendedTime: commuteTime,
    indoorOutdoor: 'transit',
    pollutionRisk: isUnhealthy ? 'high' : 'moderate',
    reason: mornReason,
    alternativeActivity: mornAlt,
    expectedBenefit: mornPersonal,
    personalBenefit: mornPersonal,
    environmentalBenefit: mornEnv,
    status: 'pending',
    isCustom: false,
    isAlternativeApplied: false,
  });

  // ==========================================
  // 3. AFTERNOON (12:00 - 16:00) — BEST DISPERSION WINDOW
  // ==========================================
  let aftAct = '';
  let aftReason = '';
  let aftAlt = '';

  if (isSevere) {
    aftAct =
      language === 'hi'
        ? 'इनडोर कार्य व आवश्यक खरीदारी को ऑनलाइन शेड्यूल करें'
        : language === 'gu'
        ? 'ઇન્ડોર કામ કરો અને ખરીદી ઓનલાઇન કરો'
        : 'Remain indoors; complete study or office work; order essential groceries digitally';
    aftReason =
      language === 'hi'
        ? 'गंभीर स्मॉग के दौरान दोपहर में भी पार्टिकुलेट खतरनाक स्तर पर रहते हैं।'
        : language === 'gu'
        ? 'ગંભીર સ્મોગ દરમિયાન બપોરે પણ પ્રદૂષણ વધુ રહે છે.'
        : 'Hazardous air conditions persist despite solar warming; avoid ambient exposure.';
    aftAlt =
      language === 'hi'
        ? 'घर में एयर प्यूरीफायर चलाकर आराम करें'
        : language === 'gu'
        ? 'એર પ્યુરિફાયર ચાલુ રાખીને આરામ કરો'
        : 'Indoor reading and desktop tasks in HEPA-filtered zone';
  } else {
    aftAct =
      language === 'hi'
        ? 'बाहरी आवश्यक काम (बैंक, खरीदारी) पूरे करें; 20 मिनट के लिए कमरों में ताजी हवा आने दें'
        : language === 'gu'
        ? 'બહારના જરૂરી કામ (બેંક, ખરીદી) પતાવો; 20 મિનિટ માટે બારીઓ ખોલી વેન્ટિલેશન કરો'
        : 'Complete essential outdoor errands; brief 15–20 min cross-ventilation if sun is bright';
    aftReason =
      language === 'hi'
        ? 'धूप के कारण दोपहर में स्मॉग की परत ऊपर उठती है, जिससे यह दिन का सबसे साफ समय होता है।'
        : language === 'gu'
        ? 'સૂર્યપ્રકાશને કારણે બપોરે સ્મોગ ઓછો હોય છે, જેથી આ દિવસનો સૌથી સાફ સમય છે.'
        : 'Solar heating elevates the mixing height, achieving diurnal minimum ground-level PM2.5 concentrations.';
    aftAlt =
      language === 'hi'
        ? 'पैदल चलने के बजाय एक ही यात्रा में कई काम जोड़ें'
        : language === 'gu'
        ? 'બધા કામ એક સાથે પતાવો'
        : 'Consolidate multiple errands into one streamlined transit loop';
  }

  const aftPersonal =
    language === 'hi'
      ? 'दिन के सबसे सुरक्षित समय में काम निपटाने से फेफड़ों पर दबाव नहीं पड़ता।'
      : language === 'gu'
      ? 'દિવસના સૌથી સલામત સમયે કામ પતાવવાથી ફેફસાં પર દબાણ ઘટશે.'
      : 'Avoids breathing trapped boundary-layer morning soot by utilizing optimal thermal dispersion.';
  const aftEnv =
    language === 'hi'
      ? 'दिन में खिड़कियां खोलकर वेंटिलेशन से बिजली की बचत।'
      : language === 'gu'
      ? 'બપોરે વેન્ટિલેશન કરવાથી વીજળી બચે છે.'
      : 'Natural cross-ventilation flushes indoor CO2 and dampness without mechanical ventilation load.';

  activities.push({
    id: `act_aft_${Date.now()}_3`,
    period: 'afternoon',
    periodLabel: language === 'hi' ? 'दोपहर का समय (12:00 - 16:00)' : language === 'gu' ? 'બપોરનો સમય (12:00 - 16:00)' : 'Afternoon Window (12:00 - 16:00)',
    activity: aftAct,
    recommendedTime: '13:30',
    indoorOutdoor: isSevere ? 'indoor' : 'outdoor',
    pollutionRisk: isSevere ? 'high' : 'moderate',
    reason: aftReason,
    alternativeActivity: aftAlt,
    expectedBenefit: aftPersonal,
    personalBenefit: aftPersonal,
    environmentalBenefit: aftEnv,
    status: 'pending',
    isCustom: false,
    isAlternativeApplied: false,
  });

  // ==========================================
  // 4. EVENING (17:30 - 20:30)
  // ==========================================
  let eveAct = '';
  let eveReason = '';
  let eveAlt = '';

  if (isUnhealthy) {
    eveAct =
      language === 'hi'
        ? 'घर वापसी पर तुरंत खिड़कियां बंद करें; बच्चों को बाहर खेलने के बजाय इनडोर गेम्स में व्यस्त रखें'
        : language === 'gu'
        ? 'ઘરે પાછા આવીને બારીઓ બંધ કરો; બાળકોને બહાર રમવા ન મોકલવા'
        : 'Evening commute: Keep vehicle windows rolled up; engage children in creative indoor games';
    eveReason =
      language === 'hi'
        ? 'सूरज ढलते ही तापमान गिरता है और शाम के ट्रैफिक का धुआं जमीन पर अटक जाता है।'
        : language === 'gu'
        ? 'સૂર્યાસ્ત પછી તાપમાન ઘટતાં સ્મોગ જમીન પર જમા થાય છે.'
        : 'Post-sunset ground radiation cooling triggers evening thermal inversion, trapping heavy evening rush-hour emissions.';
    eveAlt =
      language === 'hi'
        ? 'घर में परिवार के साथ बोर्ड गेम्स या इनडोर एक्टिविटी'
        : language === 'gu'
        ? 'ઘરમાં બોર્ડ ગેમ્સ અથવા ઇન્ડોર એક્ટિવિટી'
        : 'Family board games or shared indoor reading';
  } else {
    eveAct =
      language === 'hi'
        ? 'पार्क में हल्की वॉक या शाम का समय परिवार के साथ'
        : language === 'gu'
        ? 'બગીચામાં હળવું વોકિંગ અથવા પરિવાર સાથે સમય'
        : 'Light outdoor evening recreation before night chill sets in';
    eveReason =
      language === 'hi'
        ? `वर्तमान AQI ${aqi} पर शाम की सामान्य गतिविधि स्वीकार्य है।`
        : language === 'gu'
        ? `હાલના AQI પર સામાન્ય પ્રવૃત્તિ સ્વીકાર્ય છે.`
        : 'Moderate ambient parameters permit modest outdoor activity prior to nocturnal temperature inversion.';
    eveAlt =
      language === 'hi'
        ? 'छत पर टहलना'
        : language === 'gu'
        ? 'ધાબા પર ચાલવું'
        : 'Terrace walking away from ground dust';
  }

  const evePersonal =
    language === 'hi'
      ? 'शाम के पीक स्मॉग से बच्चों और बुजुर्गों में रात की खांसी से बचाव।'
      : language === 'gu'
      ? 'બાળકો અને વડીલોમાં રાત્રે ખાંસીથી બચાવ.'
      : 'Prevents acute nocturnal asthma triggers, allergic rhinitis, and ocular burning.';
  const eveEnv =
    language === 'hi'
      ? 'अनावश्यक शाम की यात्राएं टालने से स्थानीय प्रदूषण घटता है।'
      : language === 'gu'
      ? 'બિનજરૂરી મુસાફરી ટાળવાથી પ્રદૂષણ ઘટે છે.'
      : 'Curtails evening discretionary trips during the most pollution-vulnerable hour of the urban day.';

  activities.push({
    id: `act_eve_${Date.now()}_4`,
    period: 'evening',
    periodLabel: language === 'hi' ? 'सायंकाल (17:30 - 20:30)' : language === 'gu' ? 'સાંજનો સમય (17:30 - 20:30)' : 'Evening Transition (17:30 - 20:30)',
    activity: eveAct,
    recommendedTime: schedule.travelTimings?.eveningCommute || '18:15',
    indoorOutdoor: isUnhealthy ? 'indoor' : 'outdoor',
    pollutionRisk: isUnhealthy ? 'high' : 'moderate',
    reason: eveReason,
    alternativeActivity: eveAlt,
    expectedBenefit: evePersonal,
    personalBenefit: evePersonal,
    environmentalBenefit: eveEnv,
    status: 'pending',
    isCustom: false,
    isAlternativeApplied: false,
  });

  // ==========================================
  // 5. NIGHT (21:00 - 23:00)
  // ==========================================
  const nightAct =
    language === 'hi'
      ? 'शयनकक्ष की खिड़कियां अच्छी तरह बंद रखें; कमरे में गीला पोछा लगाएं और एयर प्यूरीफायर स्लीप मोड पर चलाएं'
      : language === 'gu'
      ? 'બેડરૂમની બારીઓ બંધ રાખો; રૂમમાં ભીનું પોતું કરો અને એર પ્યુરિફાયર સ્લીપ મોડ પર રાખો'
      : 'Bedroom sealing: Latch windows tightly; damp-wipe floor; run HEPA air purifier on quiet night mode';
  const nightReason =
    language === 'hi'
      ? 'रात भर तापमान कम रहने से बाहर हवा सबसे भारी और प्रदूषित रहती है; अगरबत्ती या मोमबत्ती न जलाएं।'
      : language === 'gu'
      ? 'રાત્રે તાપમાન ઓછું હોવાથી હવા વધુ પ્રદૂષિત રહે છે; અગરબત્તી ન સળગાવો.'
      : 'Stable nocturnal air layers preserve high particulate stagnation; avoiding indoor combustion ensures clean recovery during sleep.';
  const nightAlt =
    language === 'hi'
      ? 'दरवाजे के नीचे गीला तौलिया लगाएं'
      : language === 'gu'
      ? 'દરવાજા નીચે ભીનો ટુવાલ મૂકો'
      : 'Place draft seal or damp cloth roll at base of bedroom door';

  const nightPersonal =
    language === 'hi'
      ? 'गहरी नींद के दौरान फेफड़ों की प्राकृतिक रिकवरी और सांस की सुरक्षा।'
      : language === 'gu'
      ? 'ઊંઘ દરમિયાન શ્વસનતંત્રની સુરક્ષા.'
      : 'Facilitates restorative pulmonary recovery during 7-8 hours of continuous sleep.';
  const nightEnv =
    language === 'hi'
      ? 'अगरबत्ती व कचरा न जलाने से घर और आसपास की हवा साफ रहती है।'
      : language === 'gu'
      ? 'અગરબત્તી કે કચરો ન સળગાવવાથી હવા શુદ્ધ રહે છે.'
      : 'Eliminates domestic micro-emissions into neighborhood nocturnal baseline.';

  activities.push({
    id: `act_night_${Date.now()}_5`,
    period: 'night',
    periodLabel: language === 'hi' ? 'रात्रि विश्राम (21:00 - 23:00)' : language === 'gu' ? 'રાત્રિનો સમય (21:00 - 23:00)' : 'Night Recovery (21:00 - 23:00)',
    activity: nightAct,
    recommendedTime: schedule.sleepTime ? '21:30' : '21:30',
    indoorOutdoor: 'indoor',
    pollutionRisk: 'low',
    reason: nightReason,
    alternativeActivity: nightAlt,
    expectedBenefit: nightPersonal,
    personalBenefit: nightPersonal,
    environmentalBenefit: nightEnv,
    status: 'pending',
    isCustom: false,
    isAlternativeApplied: false,
  });

  return activities;
};
