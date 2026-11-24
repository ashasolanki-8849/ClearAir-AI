export interface PurifierCalculatorInput {
  length: number;
  width: number;
  height: number;
  unit?: 'meters' | 'feet';
  budget?: 'low_cost' | 'mid_range' | 'premium';
  primaryConcern?: 'smog_pm25' | 'pet_allergies' | 'cooking_smoke' | 'dampness_dust';
  language?: 'en' | 'hi' | 'gu';
}

export interface PurifierGuidanceResult {
  roomDimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'meters' | 'feet';
  };
  roomVolume: {
    cubicMeters: number;
    cubicFeet: number;
  };
  floorArea: {
    sqMeters: number;
    sqFeet: number;
  };
  recommendedCADR: {
    smokeCfm: number;
    smokeM3h: number;
    dustCfm: number;
    pollenCfm: number;
  };
  airChangesPerHour: number; // e.g. 5 ACH for severe smog
  filterTechRequired: {
    preFilter: boolean;
    hepaGrade: 'True HEPA H13' | 'H14 Hospital Grade';
    activatedCarbonWeight: string; // e.g. 'At least 250g - 500g'
    forbiddenTechWarning: string;
  };
  maintenanceSchedule: {
    preFilterCleaningInterval: string;
    hepaReplacementMonths: string;
    filterLifeCheckInstructions: string;
  };
  energyAndCostGuidance: {
    typicalPowerWatts: string;
    dailyEnergyKWh: string;
    costEstimateCategory: string;
  };
  criticalLimitations: string[];
}

export const calculatePurifierRequirements = (
  input: PurifierCalculatorInput
): PurifierGuidanceResult => {
  const {
    length = 4,
    width = 3.5,
    height = 3,
    unit = 'meters',
    budget = 'mid_range',
    primaryConcern = 'smog_pm25',
    language = 'en',
  } = input;

  // Convert to meters and feet
  let lengthMeters = length;
  let widthMeters = width;
  let heightMeters = height;

  if (unit === 'feet') {
    lengthMeters = length * 0.3048;
    widthMeters = width * 0.3048;
    heightMeters = height * 0.3048;
  }

  const floorAreaSqM = Math.round(lengthMeters * widthMeters * 10) / 10;
  const floorAreaSqFt = Math.round(floorAreaSqM * 10.7639);

  const volumeM3 = Math.round(floorAreaSqM * heightMeters * 10) / 10;
  const volumeFt3 = Math.round(volumeM3 * 35.3147);

  // 5 Air Changes per Hour (ACH) is the benchmark standard during severe winter smog episodes
  const targetACH = 5;

  // Recommended CADR in m3/h: Volume (m3) * ACH
  const cadrM3h = Math.round(volumeM3 * targetACH);
  // CADR in CFM = CADR (m3/h) / 1.699
  const cadrCfm = Math.round(cadrM3h / 1.7);

  const dustCfm = Math.round(cadrCfm * 1.05);
  const pollenCfm = Math.round(cadrCfm * 1.1);

  const carbonRequirement =
    primaryConcern === 'cooking_smoke' || primaryConcern === 'smog_pm25'
      ? 'Minimum 300g–500g virgin activated granular carbon honeycomb layer to adsorb NO2 and VOC odors.'
      : 'Standard carbon-impregnated fibrous weave is sufficient for general living areas.';

  const criticalLimitations = [
    'Mechanical HEPA filters do NOT remove Carbon Monoxide (CO) — a dedicated CO alarm is required for fuel-burning appliances.',
    'HEPA filters do NOT remove carbon dioxide (CO2) or replenish oxygen — brief strategic window ventilation is still required.',
    'True HEPA cannot remove radon gas without specialized soil-depressurization systems.',
    'Ordinary particle filters do NOT trap gaseous pollutants unless paired with substantial granular activated carbon.',
  ];

  return {
    roomDimensions: {
      length,
      width,
      height,
      unit,
    },
    roomVolume: {
      cubicMeters: volumeM3,
      cubicFeet: volumeFt3,
    },
    floorArea: {
      sqMeters: floorAreaSqM,
      sqFeet: floorAreaSqFt,
    },
    recommendedCADR: {
      smokeCfm: cadrCfm,
      smokeM3h: cadrM3h,
      dustCfm,
      pollenCfm,
    },
    airChangesPerHour: targetACH,
    filterTechRequired: {
      preFilter: true,
      hepaGrade: 'True HEPA H13',
      activatedCarbonWeight: carbonRequirement,
      forbiddenTechWarning:
        'DO NOT buy ozone-generating air purifiers, needlepoint bi-polar ionizers, or photocatalytic oxidation (PCO) devices that emit respiratory irritants like ozone (O3) and formaldehyde.',
    },
    maintenanceSchedule: {
      preFilterCleaningInterval: 'Vacuum or rinse washable mesh pre-filter every 2 to 3 weeks.',
      hepaReplacementMonths: 'Replace primary HEPA composite filter every 6 to 12 months (or when airflow noticeably drops).',
      filterLifeCheckInstructions:
        'Inspect filter surface with a flashlight; dark grey/black particulate saturation indicates saturation regardless of timer app readings.',
    },
    energyAndCostGuidance: {
      typicalPowerWatts: '30W to 55W on medium operating speed.',
      dailyEnergyKWh: 'Approx. 0.7 to 1.2 kWh per 24 hours of continuous running (less than a standard ceiling fan).',
      costEstimateCategory:
        budget === 'low_cost'
          ? 'Budget-conscious: Look for certified True HEPA without excessive proprietary IoT apps.'
          : budget === 'premium'
          ? 'High-performance: Opt for high CADR units with sealed dual-sided H13 filters and real-time laser PM2.5 counters.'
          : 'Mid-range: Standard cylindrical or flat HEPA H13 filters with automated particulate sensors.',
    },
    criticalLimitations,
  };
};
