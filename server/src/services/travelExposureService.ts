export interface TravelExposureInput {
  outdoorAqi: number;
  pm25: number;
  mode: string;
  durationMinutes: number;
  trafficStatus?: 'low' | 'moderate' | 'heavy' | 'severe';
  roadType?: 'arterial_highway' | 'interior_corridor' | 'ring_road' | 'dedicated_transit_way';
}

export interface TravelExposureResult {
  exposureLevel: 'low' | 'moderate' | 'high' | 'severe';
  inhalationRiskScore: number; // 0 to 100
  microEnvironmentMultiplier: number;
  explanation: string;
  protectiveMeasures: string[];
  maskRecommendation: string;
  cautionaryNotes: string[];
}

export const evaluateTravelExposure = (input: TravelExposureInput): TravelExposureResult => {
  const {
    outdoorAqi = 150,
    pm25 = 60,
    mode = 'metro',
    durationMinutes = 30,
    trafficStatus = 'moderate',
    roadType = 'arterial_highway',
  } = input;

  // 1. Base pollution load (0 to 40)
  let baseScore = Math.min(40, (outdoorAqi / 500) * 40);

  // 2. Micro-environment exposure multiplier based on transport mode & enclosure
  let modeMultiplier = 1.0;
  let modeDesc = '';

  const m = mode.toLowerCase();
  if (m.includes('cycling') || m === 'bicycle') {
    // High exertion multiplies minute ventilation volume from 6 L/min to 20-30 L/min!
    modeMultiplier = 1.5;
    modeDesc = 'Active physical exertion multiplies respiratory inhalation volume by 2.5x–3x compared to resting state.';
  } else if (m.includes('walking') || m === 'pedestrian') {
    modeMultiplier = 1.25;
    modeDesc = 'Direct open-air roadside walking with no physical particulate barrier.';
  } else if (m.includes('two_wheeler') || m === 'motorcycle' || m === 'scooter') {
    modeMultiplier = 1.35;
    modeDesc = 'Open-air rider positioned at direct tailpipe exhaust height in idling traffic queues.';
  } else if (m.includes('auto') || m === 'auto_rickshaw') {
    modeMultiplier = 1.2;
    modeDesc = 'Open-sided vehicle with minimal protection from street-level diesel soot.';
  } else if (m.includes('car') || m.includes('carpool') || m.includes('electric_vehicle')) {
    modeMultiplier = 0.45;
    modeDesc = 'Enclosed vehicle cabin with internal air recirculation and cabin particulate filtration.';
  } else if (m.includes('metro') || m.includes('train')) {
    modeMultiplier = 0.35;
    modeDesc = 'Grade-separated mass transit corridor isolated from street-level vehicular tailpipe plumes.';
  } else if (m.includes('bus')) {
    modeMultiplier = 0.65;
    modeDesc = 'High-capacity enclosed passenger cabin; exposure peaks during door-opening boarding stops.';
  }

  // 3. Traffic congestion penalty (idling tailpipes concentrate local NO2 and ultrafine particles)
  let trafficMultiplier = 1.0;
  if (trafficStatus === 'severe') trafficMultiplier = 1.35;
  else if (trafficStatus === 'heavy') trafficMultiplier = 1.2;
  else if (trafficStatus === 'low') trafficMultiplier = 0.85;

  // 4. Duration penalty (exposure is cumulative: Dose = Concentration * Time)
  const durationFactor = Math.min(1.5, Math.max(0.7, durationMinutes / 30));

  // Compute final inhalation risk score (0 to 100)
  const rawScore = baseScore * modeMultiplier * trafficMultiplier * durationFactor;
  const inhalationRiskScore = Math.min(100, Math.round(rawScore));

  let exposureLevel: 'low' | 'moderate' | 'high' | 'severe' = 'moderate';
  if (inhalationRiskScore >= 60) exposureLevel = 'severe';
  else if (inhalationRiskScore >= 42) exposureLevel = 'high';
  else if (inhalationRiskScore <= 22) exposureLevel = 'low';

  // Protective measures & Mask advice
  const protectiveMeasures: string[] = [];
  let maskRecommendation = 'No mask strictly required under current favorable conditions.';

  if (outdoorAqi > 200 || exposureLevel === 'high' || exposureLevel === 'severe') {
    maskRecommendation = 'A certified snug-fitting N95 or FFP2 respirator is strongly recommended during transit.';
  } else if (outdoorAqi > 100 && (m.includes('walking') || m.includes('two_wheeler') || m.includes('cycling'))) {
    maskRecommendation = 'Wear a well-fitted N95 mask to filter roadside coarse dust and diesel soot.';
  }

  if (m.includes('car') || m.includes('carpool') || m.includes('electric_vehicle')) {
    protectiveMeasures.push('Press the internal AC air-recirculation button to block highway diesel exhaust from entering cabin.');
    protectiveMeasures.push('Keep windows fully rolled up, especially when idling at major traffic signals.');
  } else if (m.includes('two_wheeler') || m.includes('motorcycle')) {
    protectiveMeasures.push('Avoid idling directly behind heavy diesel trucks and buses at red lights.');
    protectiveMeasures.push('Wear a full-face helmet with visor down and an N95 respirator underneath.');
  } else if (m.includes('cycling')) {
    if (outdoorAqi > 200) {
      protectiveMeasures.push('Shift cycling workout indoors or transition commute to Metro / bus during severe smog.');
    } else {
      protectiveMeasures.push('Choose low-traffic secondary streets rather than multi-lane arterial highways.');
    }
  } else if (m.includes('metro') || m.includes('bus')) {
    protectiveMeasures.push('Stay back from platform edge and board quickly to minimize open-door exposure.');
  }

  const cautionaryNotes = [
    'Personal pollution exposure is the product of concentration and duration. A slightly longer route with free-flowing traffic can result in lower cumulative lung deposition than a shorter route trapped in gridlock.',
    'Walking or cycling along heavy diesel corridors can expose travelers to 3x higher ultrafine black carbon compared to interior residential greenways.',
  ];

  return {
    exposureLevel,
    inhalationRiskScore,
    microEnvironmentMultiplier: Math.round(modeMultiplier * 100) / 100,
    explanation: `${modeDesc} Evaluated over a ${durationMinutes}-minute journey with ${trafficStatus} roadside congestion under ambient AQI ${outdoorAqi}.`,
    protectiveMeasures,
    maskRecommendation,
    cautionaryNotes,
  };
};
