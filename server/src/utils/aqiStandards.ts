import { AQICategory } from '../models/AirQuality.js';

export interface HealthGuidance {
  category: AQICategory;
  color: string;
  badgeBg: string;
  badgeText: string;
  healthImplications: string;
  vulnerableGroups: string[];
  precautions: string[];
  disclaimer: string;
}

export const calculateCPCB_AQI = (pm25: number, pm10: number): { aqi: number; category: AQICategory } => {
  // Linear interpolation for CPCB sub-index for PM2.5 and PM10
  const getPM25SubIndex = (c: number): number => {
    if (c <= 30) return (50 / 30) * c;
    if (c <= 60) return 50 + ((100 - 50) / (60 - 30)) * (c - 30);
    if (c <= 90) return 100 + ((200 - 100) / (90 - 60)) * (c - 60);
    if (c <= 120) return 200 + ((300 - 200) / (120 - 90)) * (c - 90);
    if (c <= 250) return 300 + ((400 - 300) / (250 - 120)) * (c - 120);
    return 400 + ((500 - 400) / (380 - 250)) * Math.min(c - 250, 130);
  };

  const getPM10SubIndex = (c: number): number => {
    if (c <= 50) return c;
    if (c <= 100) return 50 + ((100 - 50) / (100 - 50)) * (c - 50);
    if (c <= 250) return 100 + ((200 - 100) / (250 - 100)) * (c - 100);
    if (c <= 350) return 200 + ((300 - 200) / (350 - 250)) * (c - 250);
    if (c <= 430) return 300 + ((400 - 300) / (430 - 350)) * (c - 350);
    return 400 + ((500 - 400) / (500 - 430)) * Math.min(c - 430, 70);
  };

  const sub25 = getPM25SubIndex(pm25 || 0);
  const sub10 = getPM10SubIndex(pm10 || 0);
  const aqi = Math.round(Math.max(sub25, sub10));

  let category: AQICategory = 'Good';
  if (aqi <= 50) category = 'Good';
  else if (aqi <= 100) category = 'Satisfactory';
  else if (aqi <= 200) category = 'Moderate';
  else if (aqi <= 300) category = 'Poor';
  else if (aqi <= 400) category = 'Very Poor';
  else category = 'Severe';

  return { aqi, category };
};

export const getHealthGuidance = (category: AQICategory, userCategory?: string): HealthGuidance => {
  const disclaimer = 'Note: ClearAir AI environmental advisories provide general health protection guidance based on regional air quality standards and are not a substitute for clinical medical diagnosis.';

  switch (category) {
    case 'Good':
      return {
        category,
        color: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeText: '#10b981',
        healthImplications: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        vulnerableGroups: ['No restriction for any demographic group.'],
        precautions: [
          'Ideal condition for outdoor exercise and ventilation.',
          'Open windows to freshen indoor air.',
        ],
        disclaimer,
      };

    case 'Satisfactory':
      return {
        category,
        color: '#34d399',
        badgeBg: 'rgba(52, 211, 153, 0.15)',
        badgeText: '#34d399',
        healthImplications: 'Minor breathing discomfort may be experienced by sensitive people.',
        vulnerableGroups: ['Individuals with respiratory allergies or mild asthma.'],
        precautions: [
          'Unusually sensitive individuals should observe mild discomfort.',
          'General outdoor activities are safe for healthy individuals.',
        ],
        disclaimer,
      };

    case 'Moderate':
      return {
        category,
        color: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeText: '#f59e0b',
        healthImplications: 'May cause breathing discomfort to people with asthma, heart condition, and lung ailments.',
        vulnerableGroups: ['Children, elderly citizens, and people with existing cardiopulmonary conditions.'],
        precautions: [
          'Sensitive groups should reduce prolonged heavy outdoor exertion.',
          'Keep rescue inhalers handy if prescribed.',
          'Consider closing windows during peak morning/evening traffic spikes.',
        ],
        disclaimer,
      };

    case 'Poor':
      return {
        category,
        color: '#f97316',
        badgeBg: 'rgba(249, 115, 22, 0.15)',
        badgeText: '#f97316',
        healthImplications: 'Breathing discomfort to most people on prolonged exposure. Worsening of cardiac and respiratory symptoms.',
        vulnerableGroups: ['Children, senior citizens, pregnant women, outdoor laborers.'],
        precautions: [
          'Wear an effective N95/FFP2 mask when outdoors for extended periods.',
          'Avoid early morning vigorous outdoor jogging or sports.',
          'Run indoor HEPA air purifiers if available.',
        ],
        disclaimer,
      };

    case 'Very Poor':
      return {
        category,
        color: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeText: '#ef4444',
        healthImplications: 'Respiratory illness likely on prolonged exposure. Significant risk of airway irritation and fatigue.',
        vulnerableGroups: ['All population groups, especially children, elderly, and respiratory patients.'],
        precautions: [
          'Avoid non-essential outdoor travel and high-exertion workouts.',
          'Wear N95/KN95 masks properly sealed whenever stepping outside.',
          'Keep windows and doors securely closed; practice wet mopping instead of dry dusting.',
        ],
        disclaimer,
      };

    case 'Severe':
    default:
      return {
        category: 'Severe',
        color: '#991b1b',
        badgeBg: 'rgba(153, 27, 27, 0.25)',
        badgeText: '#ef4444',
        healthImplications: 'Emergency conditions: severely impacts healthy individuals and causes acute distress in vulnerable groups.',
        vulnerableGroups: ['Entire population is affected; high danger for infants, elderly, and asthma/COPD patients.'],
        precautions: [
          'Strictly remain indoors and seal gaps around doors and windows.',
          'Do NOT exercise or run outdoors under any circumstances.',
          'Run air purifiers in sealed rooms continuously.',
          'Consult emergency health services if experiencing shortness of breath or chest constriction.',
        ],
        disclaimer,
      };
  }
};

export const pollutantSignificance: Record<string, { name: string; unit: string; description: string; limit24h: number }> = {
  pm25: {
    name: 'Fine Particulate Matter (PM2.5)',
    unit: 'µg/m³',
    description: 'Ultra-fine particles (<2.5 µm) that penetrate deep into alveolar lung tissues and enter the bloodstream.',
    limit24h: 60, // CPCB 24h standard
  },
  pm10: {
    name: 'Coarse Particulate Matter (PM10)',
    unit: 'µg/m³',
    description: 'Inhalable particles (<10 µm) from road dust, construction, and biomass burning that irritate the upper airway.',
    limit24h: 100, // CPCB 24h standard
  },
  no2: {
    name: 'Nitrogen Dioxide (NO2)',
    unit: 'µg/m³',
    description: 'Pungent combustion gas from vehicles and power stations that causes bronchial inflammation.',
    limit24h: 80,
  },
  so2: {
    name: 'Sulphur Dioxide (SO2)',
    unit: 'µg/m³',
    description: 'Industrial gas emitted by coal combustion that triggers airway spasms and acid smog.',
    limit24h: 80,
  },
  co: {
    name: 'Carbon Monoxide (CO)',
    unit: 'mg/m³',
    description: 'Colorless, odorless gas from incomplete fuel combustion that reduces oxygen-carrying capacity.',
    limit24h: 2.0,
  },
  o3: {
    name: 'Ozone (O3)',
    unit: 'µg/m³',
    description: 'Secondary pollutant formed by sunlight reacting with NOx and VOCs, caustic to lung lining.',
    limit24h: 100,
  },
  nh3: {
    name: 'Ammonia (NH3)',
    unit: 'µg/m³',
    description: 'Emitted from agricultural fertilizer and livestock waste, reacting to form secondary particulate matter.',
    limit24h: 400,
  },
};
