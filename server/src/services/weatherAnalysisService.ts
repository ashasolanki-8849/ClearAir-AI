export interface WeatherFactorAnalysis {
  factor: 'wind' | 'temperature_inversion' | 'humidity' | 'precipitation' | 'solar_radiation';
  status: 'favorable' | 'neutral' | 'unfavorable' | 'hazardous';
  currentValueText: string;
  influenceOnPollution: string;
  scientificMechanism: string;
}

export interface WeatherPollutionReport {
  overallDispersionCondition: 'optimal_dispersion' | 'moderate_ventilation' | 'poor_stagnation' | 'severe_inversion_trap';
  dispersionScore: number; // 0 (trapped) to 100 (high dispersion)
  headline: string;
  summary: string;
  factors: WeatherFactorAnalysis[];
  rainScavengingPotential: 'none' | 'light_dampening' | 'active_washout';
  scientificLimitationNotice: string;
}

export const analyzeWeatherPollutionRelationship = (weather: {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation?: number;
}): WeatherPollutionReport => {
  const { temperature, humidity, windSpeed, windDirection, precipitation = 0 } = weather;

  const factors: WeatherFactorAnalysis[] = [];
  let dispersionScore = 50;

  // 1. Wind Speed & Advective Dilution
  if (windSpeed < 5) {
    dispersionScore -= 25;
    factors.push({
      factor: 'wind',
      status: 'unfavorable',
      currentValueText: `${windSpeed} km/h (Calm / Stagnant)`,
      influenceOnPollution: 'Zero horizontal air movement traps vehicle exhaust within 50 meters of roadways.',
      scientificMechanism:
        'Mechanical ventilation requires atmospheric kinetic energy. Speeds under 5 km/h prevent turbulent boundary mixing, causing localized plume accumulation.',
    });
  } else if (windSpeed >= 16) {
    dispersionScore += 25;
    factors.push({
      factor: 'wind',
      status: 'favorable',
      currentValueText: `${windSpeed} km/h (Moderate to Fresh Breeze)`,
      influenceOnPollution: 'Active horizontal dispersion continuously sweeps suspended smog out of the city basin.',
      scientificMechanism:
        'Higher wind velocity accelerates advective transport and eddy diffusivity, lowering roadside pollutant concentrations.',
    });
  } else {
    factors.push({
      factor: 'wind',
      status: 'neutral',
      currentValueText: `${windSpeed} km/h (Light Air)`,
      influenceOnPollution: 'Standard moderate ventilation; neither accelerating accumulation nor rapidly clearing particulates.',
      scientificMechanism: 'Provides baseline regional transport of gaseous and particulate matter.',
    });
  }

  // 2. Relative Humidity & Hygroscopic Growth
  if (humidity > 75) {
    dispersionScore -= 15;
    factors.push({
      factor: 'humidity',
      status: 'unfavorable',
      currentValueText: `${humidity}% (High Relative Humidity)`,
      influenceOnPollution: 'Causes fine particles to swell with moisture and fosters secondary nitrate/sulfate aerosol formation.',
      scientificMechanism:
        'Inorganic salts (sulfates, nitrates) undergo deliquescence at RH > 75%, rapidly multiplying particulate mass and decreasing visual visibility (smog haze).',
    });
  } else if (humidity < 40) {
    dispersionScore += 10;
    factors.push({
      factor: 'humidity',
      status: 'favorable',
      currentValueText: `${humidity}% (Dry Air)`,
      influenceOnPollution: 'Dry conditions prevent moisture condensation onto particulate cores, limiting optical haze density.',
      scientificMechanism: 'Aerosols remain in dry, unswollen state with reduced chemical conversion rates.',
    });
  } else {
    factors.push({
      factor: 'humidity',
      status: 'neutral',
      currentValueText: `${humidity}% (Moderate Humidity)`,
      influenceOnPollution: 'Normal atmospheric moisture with standard aerosol reaction kinetics.',
      scientificMechanism: 'Atmospheric chemical oxidation proceeds at nominal background rates.',
    });
  }

  // 3. Thermal Inversion Probability
  const isNightOrMorning = new Date().getHours() < 9 || new Date().getHours() > 20;
  if (temperature < 18 && isNightOrMorning && windSpeed < 6) {
    dispersionScore -= 20;
    factors.push({
      factor: 'temperature_inversion',
      status: 'hazardous',
      currentValueText: `${temperature}°C (Cold Nocturnal Surface)`,
      influenceOnPollution: 'Severe radiation inversion lid traps ground-level tailpipe exhaust right at human breathing height.',
      scientificMechanism:
        'Ground radiation cooling in calm winter nights inverts normal lapse rate (warm air atop cold air), creating a physical density barrier that suppresses vertical convective uplift.',
    });
  } else if (temperature > 24 && !isNightOrMorning) {
    dispersionScore += 15;
    factors.push({
      factor: 'solar_radiation',
      status: 'favorable',
      currentValueText: `${temperature}°C (Daytime Solar Heating)`,
      influenceOnPollution: 'Sunlight heats ground surface, driving thermal convective plumes that lift the inversion lid.',
      scientificMechanism:
        'Convective thermals expand the planetary boundary layer from ~150 meters to over 800–1000 meters, diluting ground-level particulate density.',
    });
  }

  // 4. Precipitation & Wet Scavenging
  let rainPotential: WeatherPollutionReport['rainScavengingPotential'] = 'none';
  if (precipitation >= 2.5) {
    dispersionScore += 30;
    rainPotential = 'active_washout';
    factors.push({
      factor: 'precipitation',
      status: 'favorable',
      currentValueText: `${precipitation} mm/h (Active Rainfall)`,
      influenceOnPollution: 'Rain droplets actively collide with and wash out suspended PM10 and PM2.5 particulates from the air.',
      scientificMechanism:
        'Wet deposition occurs via impaction scavenging (raindrops capturing falling particles) and in-cloud nucleation, resulting in a dramatic temporary drop in particulate AQI.',
    });
  } else if (precipitation > 0) {
    dispersionScore += 10;
    rainPotential = 'light_dampening';
    factors.push({
      factor: 'precipitation',
      status: 'neutral',
      currentValueText: `${precipitation} mm/h (Light Drizzle)`,
      influenceOnPollution: 'Suppresses ground dust resuspension, but light drizzle is insufficient to wash out sub-micron PM2.5 particles.',
      scientificMechanism: 'Coarse dust particles are grounded while ultrafine soot remains suspended in humid droplets.',
    });
  }

  dispersionScore = Math.max(5, Math.min(95, dispersionScore));

  let condition: WeatherPollutionReport['overallDispersionCondition'] = 'moderate_ventilation';
  let headline = 'Moderate Atmospheric Dispersion Conditions';
  let summary = 'Current weather patterns provide steady ventilation with modest localized accumulation.';

  if (dispersionScore <= 25) {
    condition = 'severe_inversion_trap';
    headline = 'Severe Smog Inversion Trap Active';
    summary =
      'Calm winds and a cold nocturnal boundary layer have formed an atmospheric ceiling over the city, trapping vehicle and industrial emissions near ground level.';
  } else if (dispersionScore <= 45) {
    condition = 'poor_stagnation';
    headline = 'Poor Atmospheric Ventilation';
    summary =
      'Subdued wind speeds are insufficient to clear urban tailpipe plumes, resulting in gradual accumulation of fine particulates across the day.';
  } else if (dispersionScore >= 75) {
    condition = 'optimal_dispersion';
    headline = 'Favorable Dispersion & Air Cleansing';
    summary =
      'Healthy wind speeds or active precipitation are diluting suspended pollutants and maintaining cleaner ground-level conditions.';
  }

  const scientificLimitationNotice =
    'Atmospheric physics demonstrates that weather determines how efficiently pollutants disperse or accumulate, but weather does not generate emissions. High humidity or cold air alone does not cause pollution without combustion sources.';

  return {
    overallDispersionCondition: condition,
    dispersionScore,
    headline,
    summary,
    factors,
    rainScavengingPotential: rainPotential,
    scientificLimitationNotice,
  };
};
