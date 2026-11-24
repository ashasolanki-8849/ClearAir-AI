import { AQIResponseData } from './aqiService.js';
import { IRoomVentilation } from '../models/IndoorRoom.js';
import { IDeviceLatestReadings } from '../models/IndoorDevice.js';

export interface VentilationAdviceInput {
  outdoorAqiData?: AQIResponseData | null;
  roomType?: string;
  roomVentilation?: IRoomVentilation;
  indoorReadings?: IDeviceLatestReadings | null;
  isCookingActive?: boolean;
  occupancyCount?: number;
  language?: 'en' | 'hi' | 'gu';
}

export interface VentilationAdviceResult {
  isWindowOpeningRecommended: boolean;
  ventilationStatus: 'favorable' | 'restricted_pulse_only' | 'emergency_purge' | 'closed_filtration_only';
  headline: string;
  recommendation: string;
  bestTimeWindow: string;
  durationMinutes: number;
  kitchenVentilationRule: string;
  co2AndStuffinessRisk: 'low' | 'moderate' | 'high' | 'critical';
  outdoorInfiltrationRisk: 'low' | 'moderate' | 'high' | 'severe';
  airPurifierCoordination: string;
  scientificContext: string;
  dataLimitationsNotice: string;
}

export const evaluateVentilationStrategy = (
  input: VentilationAdviceInput
): VentilationAdviceResult => {
  const {
    outdoorAqiData,
    roomType = 'living_room',
    indoorReadings,
    isCookingActive = false,
    occupancyCount = 2,
    language = 'en',
  } = input;

  const outdoorAqi = outdoorAqiData?.aqi || 140;
  const pm25 = outdoorAqiData?.pollutants?.pm25 || 65;
  const temp = outdoorAqiData?.weather?.temperature || 20;
  const humidity = outdoorAqiData?.weather?.humidity || 60;

  const indoorPm25 = indoorReadings?.pm25;
  const indoorCo2 = indoorReadings?.co2;

  // CO2 accumulation check
  let co2Risk: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  if (indoorCo2) {
    if (indoorCo2 > 1800) co2Risk = 'critical';
    else if (indoorCo2 > 1200) co2Risk = 'high';
    else if (indoorCo2 > 800) co2Risk = 'moderate';
  } else if (occupancyCount >= 3 && roomType === 'bedroom') {
    // Estimated stuffiness based on room type & occupancy
    co2Risk = 'high';
  }

  // Outdoor infiltration penalty
  let outdoorRisk: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  if (outdoorAqi >= 350) outdoorRisk = 'severe';
  else if (outdoorAqi >= 250) outdoorRisk = 'high';
  else if (outdoorAqi >= 100) outdoorRisk = 'moderate';

  // Core Decision Matrix: Balancing Outdoor vs Indoor Plumes
  let isWindowOpeningRecommended = false;
  let status: 'favorable' | 'restricted_pulse_only' | 'emergency_purge' | 'closed_filtration_only' =
    'closed_filtration_only';
  let headline = '';
  let recommendation = '';
  let duration = 0;
  let bestWindow = '12:00 - 15:30 (Midday solar boundary layer expansion)';
  let coordination = 'Keep air purifier running continuously on auto / medium mode.';

  // Scenario 1: Active kitchen cooking (Cooking plume ALWAYS takes precedence)
  if (isCookingActive || roomType === 'kitchen') {
    isWindowOpeningRecommended = true;
    status = 'restricted_pulse_only';
    headline =
      language === 'hi'
        ? 'रसोई का निकास अनिवार्य: आंतरिक खिड़की/एग्जॉस्ट तुरंत चलाएं'
        : language === 'gu'
        ? 'રસોઈનું વેન્ટિલેશન જરૂરી: એક્ઝોસ્ટ ફેન ચાલુ રાખો'
        : 'Active Kitchen Cooking: Prioritize Immediate Plume Extraction';
    recommendation =
      language === 'hi'
        ? 'बाहरी AQI खराब होने पर भी खाना बनाते समय एग्जॉस्ट फैन चलाना आवश्यक है। बेडरूम का दरवाजा बंद रखें ताकि धुआं अन्य कमरों में न फैले।'
        : language === 'gu'
        ? 'બહારનું પ્રદૂષણ વધારે હોય તો પણ રસોઈ વખતે એક્ઝોસ્ટ ચલાવો. બેડરૂમનો દરવાજો બંધ રાખો જેથી ધુમાડો અન્ય રૂમમાં ન જાય.'
        : 'Even during unfavorable outdoor smog, active cooking emits high-density toxic particulates and combustion gases that exceed outdoor levels. Run kitchen exhaust and crack open the kitchen window, but tightly shut doors leading to bedrooms to contain the smoke plume.';
    duration = 20;
    coordination = 'Turn off air purifiers situated immediately in the kitchen path (to avoid grease clogging HEPA), but run purifiers in connected bedrooms on high.';
  }
  // Scenario 2: Severe outdoor smog (AQI >= 300) with high indoor CO2 (> 1200 ppm or multi-occupancy)
  else if (outdoorAqi >= 300 && (co2Risk === 'high' || co2Risk === 'critical')) {
    isWindowOpeningRecommended = true;
    status = 'restricted_pulse_only';
    headline =
      language === 'hi'
        ? 'संतुलित पल्स-वेंटिलेशन: 5-8 मिनट का नियंत्रित वायु विनिमय'
        : language === 'gu'
        ? 'નિયંત્રિત પલ્સ-વેન્ટિલેશન: ૫-૮ મિનિટ બારી ખુલ્લી રાખો'
        : 'High Indoor CO2 Alert: Apply Brief 5–8 Minute Cross-Draft Pulse';
    recommendation =
      language === 'hi'
        ? 'बाहरी स्मॉग गंभीर है, लेकिन कमरे में कार्बन डाइऑक्साइड (CO2) बढ़ गया है जिससे सुस्ती व सिरदर्द हो सकता है। 5-8 मिनट के लिए क्रॉस-वेंटिलेशन करें, फिर खिड़कियां बंद कर प्यूरीफायर चलाएं।'
        : language === 'gu'
        ? 'બહાર સ્મોગ વધારે છે પણ રૂમમાં CO2 વધવાથી માથું દુખી શકે છે. ૫-૮ મિનિટ ઝડપી વેન્ટિલેશન કરી તરત જ બારીઓ બંધ કરો.'
        : 'Complete hermetic sealing causes toxic CO2 and indoor bio-effluent buildup (headaches, lethargy, impaired cognition). Perform a brief 5–8 minute rapid cross-ventilation pulse to flush accumulated CO2, then re-seal windows and boost your HEPA purifier to scrub newly entered outdoor dust.';
    duration = 8;
    coordination = 'Keep air purifier on standby during the 5-minute pulse, then boost to Turbo/Maximum speed for 20 minutes immediately upon closing windows.';
  }
  // Scenario 3: Favorable or Moderate Outdoor Air (AQI < 120)
  else if (outdoorAqi < 120) {
    isWindowOpeningRecommended = true;
    status = 'favorable';
    headline =
      language === 'hi'
        ? 'अनुकूल प्राकृतिक वेंटिलेशन: खिड़कियां खोलें'
        : language === 'gu'
        ? 'અનુકૂળ હવા: બારીઓ ખોલી રૂમમાં તાજી હવા આવવા દો'
        : 'Favorable Outdoor Window: Generous Cross-Ventilation Recommended';
    recommendation =
      language === 'hi'
        ? `वर्तमान बाहरी AQI ${outdoorAqi} स्वीकार्य है। कमरों में ताजी हवा का संचार करने के लिए 30-45 मिनट खिड़कियां खुली रखें।`
        : language === 'gu'
        ? `હાલનો બહારનો AQI ${outdoorAqi} સારો છે. રૂમમાં તાજી હવા માટે ૩૦-૪૫ મિનિટ બારીઓ ખોલો.`
        : `Ambient air quality is favorable (AQI ${outdoorAqi}). Open opposing windows for 30–60 minutes to flush indoor stale air, moisture, and chemical vapors.`;
    duration = 45;
    bestWindow = 'Anytime during sunlight hours; avoid very late night damp inversion';
    coordination = 'Air purifiers can run on lowest eco-mode or be turned off temporarily while fresh air circulates.';
  }
  // Scenario 4: Poor/Very Poor Outdoor Smog (AQI 200–299)
  else {
    isWindowOpeningRecommended = false;
    status = 'closed_filtration_only';
    headline =
      language === 'hi'
        ? 'सीमित वेंटिलेशन: दोपहर के समय 10 मिनट की पल्स तक सीमित रखें'
        : language === 'gu'
        ? 'મર્યાદિત વેન્ટિલેશન: બપોરે ૧૦ મિનિટ જ બારી ખોલો'
        : 'Unfavorable Outdoor Smog: Prioritize Indoor Filtration with Midday Pulse';
    recommendation =
      language === 'hi'
        ? `बाहरी AQI (${outdoorAqi}) अस्वास्थ्यकर है। सुबह और रात की खिड़कियां बंद रखें। दोपहर 12:00 से 15:00 के बीच जब धूप से स्मॉग छंटता है, तभी 10 मिनट के लिए हल्की ताजी हवा लें।`
        : language === 'gu'
        ? `બહારનો AQI (${outdoorAqi}) ખરાબ છે. સવાર અને સાંજે બારી બંધ રાખો. બપોરે ૧૨ થી ૩ વચ્ચે ૧૦ મિનિટ માટે જ બારી ખોલો.`
        : `Elevated outdoor particulate levels (AQI ${outdoorAqi}, PM2.5 ${pm25} µg/m³) make continuous open windows hazardous. Keep windows latched during morning and night smog inversions. If the room feels stuffy, limit ventilation to a single 10-minute pulse between 12:30 and 15:00.`;
    duration = 10;
    coordination = 'Operate HEPA air filtration continuously. Ensure internal room doors are closed to minimize total air volume needing purification.';
  }

  const kitchenRule =
    'Kitchen exhaust fans must always discharge directly outdoors, never into internal attic or wall cavities. Always close the kitchen corridor door while cooking so culinary aerosol plumes do not circulate into sleeping quarters.';

  const scientificContext =
    'Atmospheric physics demonstrates that sealing all windows indefinitely during smog season can drive indoor CO2 above 2,500 ppm and cause moisture buildup leading to fungal blooms. Strategic "pulse ventilation" (opening windows widely for 5-10 minutes during peak midday thermal mixing) flushes stale gases while minimizing particulate deposition, which can then be rapidly captured by mechanical HEPA filtration.';

  const dataLimitationsNotice = outdoorAqiData
    ? `Ventilation model calibrated with real-time outdoor observation (${outdoorAqiData.location.name}: AQI ${outdoorAqi}).`
    : 'Outdoor environmental data is currently estimated. If outdoor air quality is visibly hazy or smells of burning smoke, restrict window openings to minimal durations.';

  return {
    isWindowOpeningRecommended,
    ventilationStatus: status,
    headline,
    recommendation,
    bestTimeWindow: bestWindow,
    durationMinutes: duration,
    kitchenVentilationRule: kitchenRule,
    co2AndStuffinessRisk: co2Risk,
    outdoorInfiltrationRisk: outdoorRisk,
    airPurifierCoordination: coordination,
    scientificContext,
    dataLimitationsNotice,
  };
};
