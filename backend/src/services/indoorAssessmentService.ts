import {
  IIdentifiedSource,
  IAssessmentRecommendation,
  IQuestionnaireResponses,
  PollutionCategory,
  RiskSeverity,
} from '../models/IndoorAssessment.js';

export interface AssessmentResult {
  identifiedSources: IIdentifiedSource[];
  overallRiskLevel: RiskSeverity;
  summary: string;
  recommendations: IAssessmentRecommendation[];
  isQuestionnaireBased: boolean;
}

export const analyzeIndoorEnvironment = (
  responses: IQuestionnaireResponses,
  outdoorAqi: number = 150,
  language: 'en' | 'hi' | 'gu' = 'en'
): AssessmentResult => {
  const sources: IIdentifiedSource[] = [];
  const recommendations: IAssessmentRecommendation[] = [];

  let riskScore = 0; // 0 to 100

  // -------------------------------------------------------------
  // 1. PARTICULATE SOURCES
  // -------------------------------------------------------------

  // A. Cooking smoke & frying
  if (responses.cookingActivities === 'heavy_frying_tadka' || responses.cookingActivities === 'wood_kerosene') {
    const isSolidFuel = responses.cookingActivities === 'wood_kerosene';
    riskScore += isSolidFuel ? 35 : 22;
    sources.push({
      id: 'src_cooking_smoke',
      category: 'particulate',
      sourceName:
        language === 'hi'
          ? 'रसोई का धुआं व तड़का कण'
          : language === 'gu'
          ? 'રસોઈનો ધુમાડો અને વઘારના કણો'
          : 'High-Temperature Cooking Plumes & Tadka Aerosols',
      whyItMatters:
        language === 'hi'
          ? 'गर्म तेल के तड़के और दहन से भारी मात्रा में अतिसूक्ष्म PM2.5 और अल्ट्राफाइन एरोसोल निकलते हैं।'
          : language === 'gu'
          ? 'ગરમ તેલ અને વઘારથી અતિસૂક્ષ્મ PM2.5 કણો નીકળે છે જે ફેફસામાં ઊંડે સુધી જાય છે.'
          : 'High-heat oil frying and spice tadka emit ultrafine particulate matter (PM2.5 < 0.1µm) that penetrates deep into alveolar lung tissues.',
      whereItOccurs: 'Kitchen, adjacent dining & living zones without barrier separation',
      healthConcerns:
        'Throat irritation, coughing, accelerated cardiovascular stress, exacerbation of bronchial asthma.',
      preventiveAction:
        'Always switch on the kitchen exhaust fan or chimney 1 minute before igniting flame, cover pans with lids during spluttering, and keep kitchen doors closed from living spaces.',
      severity: isSolidFuel ? 'severe' : 'high',
    });

    recommendations.push({
      id: 'rec_kitchen_exhaust',
      category: 'immediate',
      title: 'Active Kitchen Plume Isolation',
      action: 'Turn on exhaust fan or range hood at maximum speed during any oil frying and leave it running for 5 minutes post-cooking.',
      benefit: 'Captures up to 75% of volatile grease particles before they migrate to bedrooms.',
      priority: 'high',
      costCategory: 'zero_cost',
    });
  }

  // B. Incense (Agarbatti), Dhoop & Candles
  if (responses.incenseOrCandles === 'daily_puja' || responses.incenseOrCandles === 'heavy') {
    riskScore += responses.incenseOrCandles === 'heavy' ? 25 : 18;
    sources.push({
      id: 'src_incense_smoke',
      category: 'particulate',
      sourceName:
        language === 'hi'
          ? 'अगरबत्ती व धूप का धुआं'
          : language === 'gu'
          ? 'અગરબત્તી અને ધૂપનો ધુમાડો'
          : 'Incense (Agarbatti) & Dhoop Smolder Particulates',
      whyItMatters:
        language === 'hi'
          ? 'अगरबत्ती का धीमी गति का दहन सिगरेट के धुएं की तरह ही पॉलीसाइक्लिक एरोमैटिक हाइड्रोकार्बन और PM2.5 उत्पन्न करता है।'
          : language === 'gu'
          ? 'અગરબત્તી અને ધૂપના ધીમા દહનથી હાનિકારક PM2.5 અને વાયુ પ્રદૂષણ વધે છે.'
          : 'Slow incomplete smolder of incense sticks releases high concentrations of PM2.5, benzene, and polycyclic aromatic hydrocarbons (PAHs).',
      whereItOccurs: 'Puja rooms, living rooms, enclosed spaces with low air exchange',
      healthConcerns: 'Eye tearing, sinus inflammation, long-term respiratory sensitivity in children and elders.',
      preventiveAction:
        'Switch to smokeless essential oil diffusers, brass diya with clean vegetable oil, or burn dhoop only in well-ventilated courtyards or open balcony spaces.',
      severity: responses.incenseOrCandles === 'heavy' ? 'high' : 'moderate',
    });

    recommendations.push({
      id: 'rec_incense_mitigation',
      category: 'daily_habit',
      title: 'Low-Smoke Prayer Practices',
      action: 'Burn miniature or bamboo-coreless dhoop near an open window, or substitute with flameless LED diyas or gentle natural camphor in minimal amounts.',
      benefit: 'Reduces indoor peak PM2.5 spikes by up to 60 µg/m³ during morning rituals.',
      priority: 'medium',
      costCategory: 'zero_cost',
    });
  }

  // C. Indoor Tobacco Smoking
  if (responses.indoorSmoking) {
    riskScore += 40;
    sources.push({
      id: 'src_tobacco_smoke',
      category: 'particulate',
      sourceName: 'Secondhand & Thirdhand Tobacco Smoke',
      whyItMatters:
        'Releases over 7,000 toxic chemicals, toxic carbon monoxide, and PM2.5 particulates that stick to fabrics and carpets for weeks (thirdhand smoke).',
      whereItOccurs: 'Living rooms, balconies connected to living spaces, stairwells',
      healthConcerns: 'Asthma triggers in children, sudden infant health hazards, increased long-term cardiovascular risks.',
      preventiveAction: 'Enforce a strict 100% smoke-free home policy. Balcony smoking with open adjoining doors still drafts smoke inwards.',
      severity: 'severe',
    });

    recommendations.push({
      id: 'rec_strict_smoke_free',
      category: 'immediate',
      title: '100% Smoke-Free Home Protocol',
      action: 'Designate the entire indoor boundary as zero-smoking. Wash textiles and soft furnishings that hold lingering chemical residues.',
      benefit: 'Eliminates one of the single most hazardous preventable indoor airborne carcinogens.',
      priority: 'urgent',
      costCategory: 'zero_cost',
    });
  }

  // D. Outdoor Infiltration (Winter Smog Entry)
  if (outdoorAqi > 200 && (responses.ventilationAvailability === 'none' || responses.windowCount > 2)) {
    riskScore += 25;
    sources.push({
      id: 'src_outdoor_infiltration',
      category: 'particulate',
      sourceName:
        language === 'hi'
          ? 'बाहरी स्मॉग का कमरों में रिसाव'
          : language === 'gu'
          ? 'બહારના સ્મોગનો ઘરમાં પ્રવેશ'
          : 'Ambient Outdoor Winter Smog Infiltration',
      whyItMatters:
        language === 'hi'
          ? `बाहर का AQI ${outdoorAqi} बहुत खराब है। बिना सील वाली खिड़कियों और दरवाजों के नीचे की खाली जगह से 60-70% बाहरी प्रदूषण अंदर आ जाता है।`
          : language === 'gu'
          ? `બહારનો AQI ${outdoorAqi} ખૂબ ખરાબ છે. ખુલ્લી બારીઓ અને દરવાજાની તિરાડોમાંથી પ્રદૂષણ ઘરમાં પ્રવેશે છે.`
          : `Severe ambient PM2.5 (Current outdoor AQI ~${outdoorAqi}) infiltrates naturally through unsealed window gaps, door sills, and balcony sliders.`,
      whereItOccurs: 'North & East facing windows, balcony glass sliding tracks, entry door bottoms',
      healthConcerns: 'Persistent elevated base PM2.5 levels during sleeping and study hours.',
      preventiveAction: 'Install self-adhesive EPDM weatherstrip tape along window edges and apply door draft stopper brushes under main doors.',
      severity: outdoorAqi >= 350 ? 'severe' : 'high',
    });

    recommendations.push({
      id: 'rec_weatherstrip_windows',
      category: 'maintenance',
      title: 'Gap Sealing & Draft Stopper Installation',
      action: 'Place rolled towels or inexpensive silicone door sweep seals beneath external facing doors and apply foam tape to rattling window frames.',
      benefit: 'Cuts outdoor toxic particulate infiltration by 30% to 50% without choking passive oxygen replenishment.',
      priority: 'high',
      costCategory: 'low_cost',
    });
  }

  // E. Dust Accumulation & Resuspension
  if (responses.dustAccumulation === 'heavy' || responses.cleaningHabits === 'dry_sweeping') {
    riskScore += 16;
    sources.push({
      id: 'src_resuspended_dust',
      category: 'particulate',
      sourceName: 'Resuspended Floor Dust & Dry-Brooming Aerosols',
      whyItMatters:
        'Dry broom sweeping (jhadu) does not eliminate dust; it resuspends heavy coarse PM10 and settled fine particulates into the breathing zone for 2-4 hours.',
      whereItOccurs: 'Hard tiled floors, under-bed spaces, ceiling fans, curtains',
      healthConcerns: 'Morning sneezing attacks, allergic rhinitis, itchy eyes and dry throat.',
      preventiveAction: 'Replace traditional dry broom sweeping with damp micro-fiber mopping (pocha) or a sealed HEPA-filtered vacuum cleaner.',
      severity: 'moderate',
    });

    recommendations.push({
      id: 'rec_damp_mopping',
      category: 'daily_habit',
      title: 'Damp Mopping (Wet Pocha) Over Dry Sweeping',
      action: 'Always damp-mop floors with water and mild detergent rather than vigorous dry broom sweeping, which disperses dust back into air.',
      benefit: 'Captures settled particulates permanently without re-launching them into your family’s breathing zone.',
      priority: 'high',
      costCategory: 'zero_cost',
    });
  }

  // -------------------------------------------------------------
  // 2. GASEOUS & CHEMICAL SOURCES
  // -------------------------------------------------------------

  // A. Combustion appliances & Unvented Gas Stoves
  if (responses.combustionAppliances === 'lpg_cylinder' || responses.combustionAppliances === 'piped_gas' || responses.combustionAppliances === 'room_heater_unvented') {
    const isUnventedHeater = responses.combustionAppliances === 'room_heater_unvented';
    riskScore += isUnventedHeater ? 35 : 15;
    sources.push({
      id: 'src_combustion_gases',
      category: 'gaseous',
      sourceName: isUnventedHeater ? 'Unvented Gas/Kerosene Room Heater' : 'Gas Cooking Combustion Emissions (NO2 & CO trace)',
      whyItMatters:
        'Natural gas and LPG combustion generate Nitrogen Dioxide (NO2), water vapor, and potential trace Carbon Monoxide (CO) if burners are clogged.',
      whereItOccurs: 'Kitchen, closed bedrooms using gas heaters without flue pipes',
      healthConcerns: 'Lower respiratory tract inflammation, increased bronchial hyperactivity in young children.',
      preventiveAction:
        'Inspect stove burners for clear blue flames (yellow flames indicate incomplete combustion and CO danger). Never use an unvented gas burner as a room heater.',
      severity: isUnventedHeater ? 'severe' : 'moderate',
    });

    recommendations.push({
      id: 'rec_gas_burner_maintenance',
      category: 'maintenance',
      title: 'Gas Burner Inspection & Blue Flame Assurance',
      action: 'Clean burner brass ports with a pin to remove food residue. Ensure flame is crisp blue; contact gas technician if flame turns sluggish orange/yellow.',
      benefit: 'Prevents incomplete combustion that generates toxic carbon monoxide and excess soot.',
      priority: 'high',
      costCategory: 'zero_cost',
    });
  }

  // -------------------------------------------------------------
  // 3. BIOLOGICAL & MOISTURE SOURCES
  // -------------------------------------------------------------

  // A. Dampness, Mold & Musty Odors
  if (responses.dampnessOrMold && responses.dampnessOrMold !== 'none') {
    const isVisibleMold = responses.dampnessOrMold === 'visible_black_mold';
    riskScore += isVisibleMold ? 30 : 18;
    sources.push({
      id: 'src_mold_dampness',
      category: 'biological_moisture',
      sourceName: isVisibleMold ? 'Active Visible Wall Mold & Fungal Spores' : 'Chronic Dampness & High Structural Moisture',
      whyItMatters:
        'Damp plaster and stagnant moisture cultivate fungal colonies (Aspergillus, Cladosporium) that release millions of microscopic mycotoxin spores into the air.',
      whereItOccurs: 'Bathroom adjacent walls, beneath AC units, ceiling water seepage patches',
      healthConcerns: 'Chronic morning cough, allergic fungal sinusitis, skin rashes, severe asthma flares.',
      preventiveAction: 'Fix wall pipe leakages immediately. Clean visible mold spots with 3% hydrogen peroxide or white vinegar (avoid dry dusting mold).',
      severity: isVisibleMold ? 'severe' : 'high',
    });

    recommendations.push({
      id: 'rec_mold_remediation',
      category: 'immediate',
      title: 'Moisture Remediation & Non-Toxic Mold Clean-up',
      action: 'Dampen moldy surfaces with a vinegar solution and wipe down with disposable rags wearing an N95 mask. Address structural plumbing leaks promptly.',
      benefit: 'Eliminates continuous bio-aerosol proliferation directly at its source.',
      priority: isVisibleMold ? 'urgent' : 'high',
      costCategory: 'low_cost',
    });
  }

  // B. Pets in enclosed rooms
  if (responses.petsInRoom) {
    riskScore += 10;
    sources.push({
      id: 'src_pet_dander',
      category: 'biological_moisture',
      sourceName: 'Pet Dander & Salivary Protein Bio-Aerosols',
      whyItMatters:
        'Microscopic skin flakes shed by cats and dogs contain proteins that float airborne for hours and settle deep into upholstery and mattresses.',
      whereItOccurs: 'Bedrooms, sofa cushions, pet bedding',
      healthConcerns: 'Nighttime nasal congestion, wheezing, disturbed sleep architecture.',
      preventiveAction: 'Keep bedrooms pet-free zones, brush pets outdoors regularly, and wash pet bedding weekly in warm water (above 55°C).',
      severity: 'low',
    });

    recommendations.push({
      id: 'rec_pet_dander_hygiene',
      category: 'daily_habit',
      title: 'Pet Bedding & Sleeping Zone Hygiene',
      action: 'Designate the master bed as a pet-free sanctuary and vacuum fabric furniture weekly with a sealed HEPA cleaner.',
      benefit: 'Reduces nighttime allergen inhalation during 7-8 hours of sleep.',
      priority: 'medium',
      costCategory: 'zero_cost',
    });
  }

  // -------------------------------------------------------------
  // Purifier Status Check & Addition
  // -------------------------------------------------------------
  if (responses.airPurifierStatus === 'none' && outdoorAqi > 150) {
    recommendations.push({
      id: 'rec_consider_hepa_purifier',
      category: 'filtration',
      title: 'Mechanical True HEPA Filtration Implementation',
      action: 'Consider placing a True HEPA (H13 grade) mechanical purifier sized appropriately for your room volume to filter fine particulate matter during severe inversion episodes.',
      benefit: 'Removes up to 99.97% of airborne PM2.5, smoke particulates, and allergens down to 0.3 microns.',
      priority: outdoorAqi > 250 ? 'high' : 'medium',
      costCategory: 'higher_investment',
    });
  }

  // Determine overall risk level
  let overallRiskLevel: RiskSeverity = 'low';
  if (riskScore >= 60) overallRiskLevel = 'severe';
  else if (riskScore >= 40) overallRiskLevel = 'high';
  else if (riskScore >= 20) overallRiskLevel = 'moderate';

  const summary =
    language === 'hi'
      ? `इस कमरे के विश्लेषण में ${sources.length} संभावित प्रदूषण स्रोत पहचाने गए हैं। समग्र आंतरिक वायु जोखिम स्तर: ${overallRiskLevel.toUpperCase()}। यह प्रश्नावली-आधारित आकलन है।`
      : language === 'gu'
      ? `આ રૂમના મૂલ્યાંકનમાં ${sources.length} સંભવિત પ્રદૂષણ સ્ત્રોત મળ્યા છે. આંતરિક હવાનું જોખમ સ્તર: ${overallRiskLevel.toUpperCase()}. આ અંદાજિત માર્ગદર્શન છે.`
      : `Based on your room parameters and current ambient conditions, ${sources.length} potential indoor pollution factors were identified. Overall estimated vulnerability is ${overallRiskLevel.toUpperCase()}. Note: This is an empirical exposure assessment based on user responses and ambient conditions, not a physical sensor measurement.`;

  return {
    identifiedSources: sources,
    overallRiskLevel,
    summary,
    recommendations,
    isQuestionnaireBased: true,
  };
};
