import { IFamilyProfile } from '../models/FamilyProfile.js';
import { AQIResponseData } from './aqiService.js';

export interface FamilyGuidanceResult {
  memberId: string;
  name: string;
  category: string;
  age: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  recommendedActions: string[];
  safeTimeWindow: string;
  precautions: string[];
}

export const generateFamilyGuidance = (
  members: IFamilyProfile[],
  aqiData: AQIResponseData,
  language: string = 'en'
): FamilyGuidanceResult[] => {
  const aqi = aqiData.aqi;
  const isUnhealthy = aqi > 200;
  const isSevere = aqi >= 400;

  return members.map((member) => {
    let riskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'moderate';
    const recommendedActions: string[] = [];
    const precautions: string[] = [];
    let safeTimeWindow = '12:00 - 15:30 (Midday solar dispersion)';

    if (member.category === 'children' || member.age < 18) {
      riskLevel = isSevere ? 'severe' : isUnhealthy ? 'high' : 'moderate';
      safeTimeWindow = isUnhealthy ? 'Indoor only; avoid early morning outdoor recreation' : '11:00 - 15:00';

      if (isUnhealthy) {
        recommendedActions.push(
          language === 'hi'
            ? 'स्कूल के बाहर खेलने और पीटी पीरियड को इनडोर एक्टिविटी में बदलें'
            : language === 'gu'
            ? 'બહાર રમવાની પ્રવૃત્તિઓ બંધ કરી ઇન્ડોર ગેમ્સ રમાડો'
            : 'Restrict playground sports; substitute with indoor art, reading, or gymnasium play'
        );
        recommendedActions.push(
          language === 'hi'
            ? 'स्कूल आते-जाते समय उपयुक्त N95/बाल मास्क अवश्य पहनाएं'
            : language === 'gu'
            ? 'સ્કૂલ જતી વખતે બાળ-માસ્ક અથવા N95 માસ્ક પહેરાવો'
            : 'Ensure snug-fitting pediatric N95 respirator during school bus transit'
        );
        precautions.push(
          language === 'hi'
            ? 'शाम 6 बजे के बाद बच्चों को घर के अंदर रखें'
            : language === 'gu'
            ? 'સાંજે 6 વાગ્યા પછી બાળકોને બહાર જવા ન દો'
            : 'Children breathe 50% more air per pound than adults; keep indoors post-sunset'
        );
      } else {
        recommendedActions.push(
          language === 'hi'
            ? 'दोपहर के समय हल्की आउटडोर एक्टिविटी सुरक्षित है'
            : language === 'gu'
            ? 'બપોરે થોડી વાર બહાર રમી શકાય'
            : 'Midday outdoor activities permitted in open grassy spaces'
        );
      }
    } else if (member.category === 'elderly' || member.age >= 60) {
      riskLevel = isSevere ? 'severe' : isUnhealthy ? 'high' : 'moderate';
      safeTimeWindow = '13:00 - 15:30 (Warmest part of the day)';

      if (isUnhealthy) {
        recommendedActions.push(
          language === 'hi'
            ? 'सुबह की पार्क वॉक बंद करें; घर के अंदर हल्का प्राणायाम करें'
            : language === 'gu'
            ? 'સવારનું મોર્નિંગ વોક બંધ કરો; ઘરમાં હળવા યોગ કરો'
            : 'Suspend morning garden walks; practice indoor restorative breathing'
        );
        recommendedActions.push(
          language === 'hi'
            ? 'नियमित रक्तचाप और श्वसन दवाओं का समय पर सेवन करें'
            : language === 'gu'
            ? 'નિયમિત દવાઓ સમયસર લો'
            : 'Adhere strictly to prescribed cardiac, asthma, and blood pressure medications'
        );
        precautions.push(
          language === 'hi'
            ? 'ठंड और स्मॉग का मिश्रण दिल और फेफड़ों पर दबाव डालता है'
            : language === 'gu'
            ? 'ઠંડી અને પ્રદૂષણ હૃદય પર દબાણ વધારે છે'
            : 'Cold temperatures vasoconstrict arteries while fine PM2.5 triggers inflammation'
        );
      } else {
        recommendedActions.push(
          language === 'hi'
            ? 'दोपहर की हल्की धूप में टहलना लाभदायक है'
            : language === 'gu'
            ? 'બપોરના તડકામાં હળવું ચાલવું લાભદાયક છે'
            : 'Gentle stroll in midday sunshine enhances circulation and vitamin D'
        );
      }
    } else {
      // Adults / Professionals
      riskLevel = isSevere ? 'severe' : isUnhealthy ? 'high' : 'moderate';
      if (isUnhealthy) {
        recommendedActions.push(
          language === 'hi'
            ? 'ऑफिस यात्रा में कार का एसी री-सर्कुलेशन मोड पर रखें'
            : language === 'gu'
            ? 'કારમાં રી-સર્ક્યુલેશન મોડ ઓન રાખો'
            : 'Commute via metro or vehicle with cabin air recirculation activated'
        );
        recommendedActions.push(
          language === 'hi'
            ? 'बाहरी रनिंग के बजाय शाम को इनडोर जिम या वर्कआउट चुनें'
            : language === 'gu'
            ? 'બહાર દોડવાને બદલે ઇન્ડોર વર્કઆઉટ કરો'
            : 'Shift aerobic workouts to indoor fitness setups'
        );
      } else {
        recommendedActions.push(
          language === 'hi'
            ? 'साइकिल या वॉक से आवागमन पर्यावरण और स्वास्थ्य के लिए उत्तम'
            : language === 'gu'
            ? 'સાયકલિંગ અથવા વોકિંગ અનુકૂળ છે'
            : 'Active commuting (cycling/walking) is feasible under current conditions'
        );
      }
    }

    return {
      memberId: member._id ? member._id.toString() : Math.random().toString(),
      name: member.name,
      category: member.category,
      age: member.age,
      riskLevel,
      recommendedActions,
      safeTimeWindow,
      precautions,
    };
  });
};
