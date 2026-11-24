import mongoose from 'mongoose';
import CarbonFootprintRecord, {
  ICarbonFootprintRecord,
  FootprintCategory,
  DataQualityStatus,
} from '../models/CarbonFootprintRecord.js';
import EnvironmentalActivity from '../models/EnvironmentalActivity.js';
import { getFactorByCategoryAndName, seedEmissionFactors } from './emissionFactorService.js';

export interface CalculationResult {
  category: FootprintCategory;
  activityName: string;
  inputValues: Record<string, any>;
  calculatedEmissionsKgCO2e: number;
  criteriaPollutantsGrams?: {
    pm25?: number;
    pm10?: number;
    nox?: number;
    so2?: number;
    co?: number;
  };
  emissionFactor: {
    name: string;
    factor: number;
    unit: string;
    source: string;
    methodology: string;
  };
  dataQuality: {
    status: DataQualityStatus;
    completenessPercentage: number;
    assumptions: string[];
    limitations: string[];
  };
  formula: string;
}

export const calculateTransportFootprint = async (data: {
  transportMode: string;
  distanceKm: number;
  passengers?: number;
  fuelType?: string;
  date?: string;
}): Promise<CalculationResult> => {
  if (data.distanceKm <= 0) {
    throw new Error('Distance must be a positive number greater than 0.');
  }

  const mode = data.transportMode.toLowerCase();
  const passengers = Math.max(1, data.passengers || 1);
  const dist = data.distanceKm;

  let factorName = 'Passenger Car - Petrol';
  let factorVal = 0.192;
  let unit = 'kg CO2e/km';
  let pm25Grams = 0;
  let noxGrams = 0;
  let coGrams = 0;

  if (mode.includes('diesel') || (data.fuelType && data.fuelType.toLowerCase() === 'diesel')) {
    factorName = 'Passenger Car - Diesel';
    factorVal = 0.171;
    pm25Grams = dist * (0.025 / passengers);
    noxGrams = dist * (0.25 / passengers);
    coGrams = dist * (0.5 / passengers);
  } else if (mode.includes('two_wheeler') || mode.includes('bike') || mode.includes('scooter')) {
    factorName = 'Two Wheeler - 4-Stroke Motorcycle / Scooter';
    factorVal = 0.045;
    pm25Grams = dist * 0.01;
    noxGrams = dist * 0.15;
    coGrams = dist * 1.4;
  } else if (mode.includes('ev') || mode.includes('electric car')) {
    factorName = 'Electric Passenger Car (Grid Mix Charged)';
    factorVal = 0.053;
  } else if (mode.includes('electric 2w') || mode.includes('ev_two_wheeler')) {
    factorName = 'Electric Two-Wheeler';
    factorVal = 0.015;
  } else if (mode.includes('bus')) {
    factorName = 'Urban Transit Bus (Diesel / CNG Average Occupancy)';
    factorVal = 0.054;
    unit = 'kg CO2e/pkm';
  } else if (mode.includes('metro') || mode.includes('subway')) {
    factorName = 'Metro Rail Rapid Transit (Electric Traction)';
    factorVal = 0.028;
    unit = 'kg CO2e/pkm';
  } else if (mode.includes('train')) {
    factorName = 'Suburban / Intercity Electric Train';
    factorVal = 0.035;
    unit = 'kg CO2e/pkm';
  } else if (mode.includes('walk') || mode.includes('cycle') || mode.includes('bicycle')) {
    factorName = 'Walking and Cycling (Zero Direct Emissions)';
    factorVal = 0.0;
  } else {
    // Default petrol car
    pm25Grams = dist * (0.005 / passengers);
    noxGrams = dist * (0.08 / passengers);
    coGrams = dist * (1.0 / passengers);
  }

  const factorDoc = await getFactorByCategoryAndName('transportation', factorName);

  const calculatedEmissions = Number(
    ((dist * factorVal) / (unit === 'kg CO2e/pkm' ? 1 : passengers)).toFixed(3)
  );

  return {
    category: 'transportation',
    activityName: `Transit: ${data.transportMode} (${dist} km)`,
    inputValues: {
      transportMode: data.transportMode,
      distanceKm: dist,
      passengers,
      fuelType: data.fuelType || 'standard',
      quantity: dist,
      unit: 'km',
    },
    calculatedEmissionsKgCO2e: calculatedEmissions,
    criteriaPollutantsGrams: {
      pm25: Number(pm25Grams.toFixed(2)),
      pm10: Number((pm25Grams * 1.6).toFixed(2)),
      nox: Number(noxGrams.toFixed(2)),
      co: Number(coGrams.toFixed(2)),
    },
    emissionFactor: {
      name: factorDoc?.name || factorName,
      factor: factorDoc?.value || factorVal,
      unit: factorDoc?.unit || unit,
      source: factorDoc?.source || 'BEE & IPCC 2006 Mobile Combustion Guidelines',
      methodology: factorDoc?.methodology || 'Activity distance x emission factor per passenger',
    },
    dataQuality: {
      status: 'Calculated',
      completenessPercentage: 100,
      assumptions: [
        `Occupancy assumed at ${passengers} passenger(s) sharing vehicle emissions`,
        'Vehicle fuel efficiency normalized to Bureau of Energy Efficiency (BEE) fleet averages',
      ],
      limitations: [
        'Real-world idling, traffic congestion speed variations, and AC usage can shift consumption by 15-20%',
      ],
    },
    formula: `${dist} km × ${factorVal} ${unit} / ${unit === 'kg CO2e/pkm' ? '1 (pkm standard)' : `${passengers} passengers`} = ${calculatedEmissions} kg CO2e`,
  };
};

export const calculateElectricityFootprint = async (data: {
  kwh: number;
  billingPeriod?: string;
  gridRegion?: string;
  renewableShare?: number;
}): Promise<CalculationResult> => {
  if (data.kwh <= 0) {
    throw new Error('Electricity usage in kWh must be greater than 0.');
  }

  const factorDoc = await getFactorByCategoryAndName(
    'electricity',
    'Indian National Electricity Grid Baseline (CEA)'
  );
  const factorVal = factorDoc?.value || 0.716;

  const renewableMultiplier = Math.max(0, 1 - (data.renewableShare || 0) / 100);
  const calculatedEmissions = Number((data.kwh * factorVal * renewableMultiplier).toFixed(3));

  return {
    category: 'electricity',
    activityName: `Electricity Consumption (${data.kwh} kWh)`,
    inputValues: {
      kwh: data.kwh,
      billingPeriod: data.billingPeriod || 'Monthly',
      gridRegion: data.gridRegion || 'National Grid',
      renewableShare: data.renewableShare || 0,
      quantity: data.kwh,
      unit: 'kWh',
    },
    calculatedEmissionsKgCO2e: calculatedEmissions,
    criteriaPollutantsGrams: {
      so2: Number((data.kwh * 0.45).toFixed(2)), // thermal grid average upstream sulfur
      nox: Number((data.kwh * 0.38).toFixed(2)),
    },
    emissionFactor: {
      name: factorDoc?.name || 'CEA Grid Baseline Database v19',
      factor: factorVal,
      unit: 'kg CO2e/kWh',
      source: factorDoc?.source || 'Central Electricity Authority (CEA) User Guide v19',
      methodology: 'Gross generation operational and build margin mix across Indian national grid',
    },
    dataQuality: {
      status: 'Calculated',
      completenessPercentage: 100,
      assumptions: [
        'National grid average generation emission factor applied (CEA v19 baseline)',
        data.renewableShare ? `${data.renewableShare}% clean generation credit applied` : 'Zero certified on-site green power',
      ],
      limitations: [
        'State-specific discom loss ratios and transmission losses (T&D) may slightly vary actual marginal intensity',
      ],
    },
    formula: `${data.kwh} kWh × ${factorVal} kg CO2e/kWh ${data.renewableShare ? `× (1 - ${data.renewableShare}%)` : ''} = ${calculatedEmissions} kg CO2e`,
  };
};

export const calculateHouseholdFuelFootprint = async (data: {
  fuelType: 'lpg_cylinder' | 'lpg_kg' | 'png_m3';
  quantity: number;
}): Promise<CalculationResult> => {
  if (data.quantity <= 0) {
    throw new Error('Fuel quantity must be greater than 0.');
  }

  let factorName = 'Liquefied Petroleum Gas (LPG Cylinder)';
  let factorVal = 2.984; // per kg
  let unit = 'kg CO2e/kg';
  let totalKgFuel = data.quantity;

  if (data.fuelType === 'lpg_cylinder') {
    totalKgFuel = data.quantity * 14.2; // 14.2 kg per standard Indian domestic cylinder
  } else if (data.fuelType === 'png_m3') {
    factorName = 'Piped Natural Gas (PNG)';
    factorVal = 2.15;
    unit = 'kg CO2e/m3';
    totalKgFuel = data.quantity;
  }

  const factorDoc = await getFactorByCategoryAndName('household_fuel', factorName);
  const calculatedEmissions = Number((totalKgFuel * factorVal).toFixed(3));

  return {
    category: 'household_fuel',
    activityName: `Cooking Fuel: ${data.fuelType === 'png_m3' ? `${data.quantity} m³ PNG` : `${data.quantity} ${data.fuelType === 'lpg_cylinder' ? 'LPG Cylinder(s)' : 'kg LPG'}`}`,
    inputValues: {
      fuelType: data.fuelType,
      quantity: data.quantity,
      unit: data.fuelType === 'png_m3' ? 'm3' : data.fuelType === 'lpg_cylinder' ? 'cylinders' : 'kg',
    },
    calculatedEmissionsKgCO2e: calculatedEmissions,
    criteriaPollutantsGrams: {
      co: Number((totalKgFuel * 0.12).toFixed(2)),
      nox: Number((totalKgFuel * 0.28).toFixed(2)),
    },
    emissionFactor: {
      name: factorDoc?.name || factorName,
      factor: factorDoc?.value || factorVal,
      unit: factorDoc?.unit || unit,
      source: factorDoc?.source || 'Petroleum Planning & Analysis Cell (PPAC) & IPCC 2006 Tables',
      methodology: factorDoc?.methodology || 'Stoichiometric hydrocarbon complete combustion',
    },
    dataQuality: {
      status: 'Calculated',
      completenessPercentage: 100,
      assumptions: ['Standard commercial purity LPG (60% butane, 40% propane) / City PNG mix'],
      limitations: ['Burner flame efficiency and ventilation conditions affect minor CO vs CO2 combustion conversion'],
    },
    formula: `${totalKgFuel} ${unit.split('/')[1]} × ${factorVal} ${unit} = ${calculatedEmissions} kg CO2e`,
  };
};

export const calculateWasteFootprint = async (data: {
  wasteType: 'mixed_unsegregated' | 'organic_composted' | 'recyclable_recovered';
  quantityKg: number;
}): Promise<CalculationResult> => {
  if (data.quantityKg <= 0) {
    throw new Error('Waste quantity in kg must be greater than 0.');
  }

  let factorName = 'Mixed Municipal Solid Waste - Landfill Disposal';
  let factorVal = 1.45;
  let isAvoided = false;

  if (data.wasteType === 'organic_composted') {
    factorName = 'Decentralized Composting Methane Avoidance';
    factorVal = 0.52;
    isAvoided = true;
  } else if (data.wasteType === 'recyclable_recovered') {
    factorName = 'Dry Recyclables Recovery (Paper, Plastic, Metal)';
    factorVal = 0.85;
    isAvoided = true;
  }

  const factorDoc = await getFactorByCategoryAndName('waste', factorName);
  const calculatedEmissions = Number(
    ((isAvoided ? -1 : 1) * data.quantityKg * factorVal).toFixed(3)
  );

  return {
    category: 'waste',
    activityName: `Waste: ${data.quantityKg} kg (${data.wasteType.replace('_', ' ')})`,
    inputValues: {
      wasteType: data.wasteType,
      quantityKg: data.quantityKg,
      quantity: data.quantityKg,
      unit: 'kg',
    },
    calculatedEmissionsKgCO2e: calculatedEmissions,
    emissionFactor: {
      name: factorDoc?.name || factorName,
      factor: factorDoc?.value || factorVal,
      unit: factorDoc?.unit || 'kg CO2e/kg',
      source: factorDoc?.source || 'CPCB Solid Waste Baseline & IPCC Waste Model',
      methodology: factorDoc?.methodology || 'First Order Decay Methane & Recycled virgin displacement model',
    },
    dataQuality: {
      status: 'Calculated',
      completenessPercentage: 100,
      assumptions: [
        isAvoided
          ? 'Diverting organic/dry waste prevents anaerobic decomposition and open incineration'
          : 'Landfill disposed waste undergoes anaerobic methane generation over 20-year decay horizon',
      ],
      limitations: ['Moisture content and landfill gas flaring infrastructure affect exact methane yields'],
    },
    formula: `${isAvoided ? '-' : ''}${data.quantityKg} kg × ${factorVal} kg CO2e/kg = ${calculatedEmissions} kg CO2e`,
  };
};

export const calculateWaterFootprint = async (data: {
  liters: number;
}): Promise<CalculationResult> => {
  if (data.liters <= 0) {
    throw new Error('Water volume in Liters must be greater than 0.');
  }

  const factorDoc = await getFactorByCategoryAndName(
    'water',
    'Municipal Potable Water Supply & Treatment'
  );
  const factorVal = factorDoc?.value || 0.00035;
  const calculatedEmissions = Number((data.liters * factorVal).toFixed(3));

  return {
    category: 'water',
    activityName: `Water Consumption: ${data.liters} Liters`,
    inputValues: {
      waterLiters: data.liters,
      quantity: data.liters,
      unit: 'Liters',
    },
    calculatedEmissionsKgCO2e: calculatedEmissions,
    emissionFactor: {
      name: factorDoc?.name || 'Municipal Water Supply & Treatment',
      factor: factorVal,
      unit: 'kg CO2e/L',
      source: factorDoc?.source || 'CPHEEO Water Supply & Treatment Manual',
      methodology: 'Specific electrical energy for raw water pumping, coagulation, and pressurized distribution',
    },
    dataQuality: {
      status: 'Calculated',
      completenessPercentage: 100,
      assumptions: ['Municipal utility treatment and booster pumping electricity intensity'],
      limitations: ['Groundwater borewell submersible pump energy varies with water table depth'],
    },
    formula: `${data.liters} L × ${factorVal} kg CO2e/L = ${calculatedEmissions} kg CO2e`,
  };
};

export const recordFootprintActivity = async (
  userId: string,
  result: CalculationResult,
  householdId?: string
): Promise<ICarbonFootprintRecord> => {
  const record = new CarbonFootprintRecord({
    userId: new mongoose.Types.ObjectId(userId),
    householdId: householdId ? new mongoose.Types.ObjectId(householdId) : undefined,
    category: result.category,
    activityName: result.activityName,
    inputValues: result.inputValues,
    calculatedEmissionsKgCO2e: result.calculatedEmissionsKgCO2e,
    criteriaPollutantsGrams: result.criteriaPollutantsGrams || {},
    emissionFactor: result.emissionFactor,
    dataQuality: result.dataQuality,
    date: new Date(),
    period: 'single',
  });

  const savedRecord = await record.save();

  // Create corresponding EnvironmentalActivity entry for the unified activity logger
  await EnvironmentalActivity.create({
    userId: new mongoose.Types.ObjectId(userId),
    householdId: householdId ? new mongoose.Types.ObjectId(householdId) : undefined,
    activityName: result.activityName,
    category:
      result.category === 'household_fuel' || result.category === 'electricity'
        ? 'energy'
        : (result.category as any),
    date: new Date(),
    quantity: result.inputValues.quantity,
    unit: result.inputValues.unit,
    notes: `Calculated emissions: ${result.calculatedEmissionsKgCO2e} kg CO2e`,
    isCompleted: true,
    dataQuality: {
      status: result.dataQuality.status,
      source: result.emissionFactor.name,
    },
    footprintRecordId: savedRecord._id,
  });

  return savedRecord;
};

export const getFootprintHistory = async (params: {
  userId: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) => {
  const query: any = { userId: new mongoose.Types.ObjectId(params.userId) };

  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }

  if (params.startDate || params.endDate) {
    query.date = {};
    if (params.startDate) query.date.$gte = params.startDate;
    if (params.endDate) query.date.$lte = params.endDate;
  }

  const limit = Math.min(100, params.limit || 30);
  const skip = params.skip || 0;

  const [records, total] = await Promise.all([
    CarbonFootprintRecord.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    CarbonFootprintRecord.countDocuments(query),
  ]);

  return { records, total };
};
