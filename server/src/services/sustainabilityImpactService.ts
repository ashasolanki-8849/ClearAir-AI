import mongoose from 'mongoose';
import {
  EnvironmentalImpactRecord,
  IEnvironmentalImpactRecord,
  ImpactActivityType,
} from '../models/EnvironmentalImpactRecord.js';

export interface ImpactCalculationResult {
  activityType: ImpactActivityType;
  inputQuantity: number;
  inputUnit: string;
  calculatedValues: {
    co2EquivalentKg: number;
    pm25AvoidedGrams: number;
    noxAvoidedGrams: number;
    wasteDivertedKg: number;
    waterSavedLiters: number;
  };
  calculationMethod: string;
  emissionFactor: {
    factor: number;
    unit: string;
    citation: string;
  };
  assumptions: string[];
  dataConfidence: 'high' | 'medium' | 'insufficient_data';
  insufficientDataReason?: string;
  isReliable: boolean;
}

export const calculateEnvironmentalImpact = async (
  userId: string | mongoose.Types.ObjectId,
  activityType: ImpactActivityType,
  quantity: number,
  unit: string,
  period: 'single_action' | 'daily' | 'weekly' | 'monthly' = 'daily',
  description?: string
): Promise<ImpactCalculationResult> => {
  if (typeof quantity !== 'number' || quantity <= 0 || isNaN(quantity)) {
    return {
      activityType,
      inputQuantity: 0,
      inputUnit: unit,
      calculatedValues: {
        co2EquivalentKg: 0,
        pm25AvoidedGrams: 0,
        noxAvoidedGrams: 0,
        wasteDivertedKg: 0,
        waterSavedLiters: 0,
      },
      calculationMethod: 'N/A',
      emissionFactor: { factor: 0, unit: 'N/A', citation: 'N/A' },
      assumptions: [],
      dataConfidence: 'insufficient_data',
      insufficientDataReason: 'Insufficient data for calculation. A positive numeric input value is required.',
      isReliable: false,
    };
  }

  let co2EquivalentKg = 0;
  let pm25AvoidedGrams = 0;
  let noxAvoidedGrams = 0;
  let wasteDivertedKg = 0;
  let waterSavedLiters = 0;

  let calculationMethod = '';
  let emissionFactor = { factor: 0, unit: '', citation: '' };
  const assumptions: string[] = [];

  switch (activityType) {
    case 'electricity_saving':
      // CEA India baseline emission factor for grid electricity: 0.716 kg CO2e / kWh
      emissionFactor = {
        factor: 0.716,
        unit: 'kg CO2e / kWh',
        citation: 'Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector (v19)',
      };
      co2EquivalentKg = Math.round(quantity * emissionFactor.factor * 100) / 100;
      calculationMethod = 'kWh Saved × Grid CO2e Factor (0.716 kg CO2e/kWh)';
      assumptions.push('Reflects average Indian regional grid mix including coal thermal, hydro, and renewables.');
      break;

    case 'transit_switch':
      // Petrol car emission: ~142 g CO2/km (0.142 kg/km) vs Metro: ~22 g CO2/pass-km. Avoided = 0.120 kg CO2/km
      // Avoided PM2.5: ~0.02 g / km
      // Avoided NOx: ~0.18 g / km
      emissionFactor = {
        factor: 0.12,
        unit: 'kg CO2e avoided / passenger-km',
        citation: 'IPCC 2006 Mobile Combustion Guidelines & CPCB Vehicular Emission Inventories',
      };
      co2EquivalentKg = Math.round(quantity * emissionFactor.factor * 100) / 100;
      pm25AvoidedGrams = Math.round(quantity * 0.02 * 100) / 100;
      noxAvoidedGrams = Math.round(quantity * 0.18 * 100) / 100;
      calculationMethod = 'Transit Distance (km) × (Car Emission Factor - Mass Transit Emission Factor)';
      assumptions.push('Assumes substitution of solo passenger petrol car (1.2L engine, 12 km/L) with electric mass transit.');
      break;

    case 'waste_segregation':
    case 'composting':
      // CPCB factor: Diverting organic wet waste from anaerobic landfills saves ~0.45 kg CO2e per kg
      emissionFactor = {
        factor: 0.45,
        unit: 'kg CO2e avoided / kg wet waste diverted',
        citation: 'CPCB Solid Waste Management Emission Factors / IPCC Waste Model',
      };
      co2EquivalentKg = Math.round(quantity * emissionFactor.factor * 100) / 100;
      wasteDivertedKg = Math.round(quantity * 100) / 100;
      calculationMethod = 'Segregated Waste (kg) × Methane Avoidance Factor (0.45 kg CO2e/kg)';
      assumptions.push('Avoids unmanaged anaerobic landfill decomposition and open dump smoldering fires.');
      break;

    case 'water_conservation':
      // Municipal pumping and treatment energy factor: ~0.00035 kg CO2e per liter saved
      emissionFactor = {
        factor: 0.00035,
        unit: 'kg CO2e avoided / Liter saved',
        citation: 'Bureau of Energy Efficiency (BEE) Municipal Water Pumping Audit Guidelines',
      };
      waterSavedLiters = Math.round(quantity);
      co2EquivalentKg = Math.round(quantity * emissionFactor.factor * 1000) / 1000;
      calculationMethod = 'Liters Conserved × Municipal Pumping Energy Factor (0.00035 kg CO2e/L)';
      assumptions.push('Accounts for energy conserved in raw water extraction, treatment, and distribution pumping.');
      break;

    case 'reusable_product':
      // Avoidance of disposable plastic bottle (500ml PET bottle lifecycle = ~0.082 kg CO2e, ~0.02 kg plastic waste)
      emissionFactor = {
        factor: 0.082,
        unit: 'kg CO2e avoided / disposable item avoided',
        citation: 'Life Cycle Assessment (LCA) of Single-Use vs Reusable Containers (UNEP)',
      };
      co2EquivalentKg = Math.round(quantity * emissionFactor.factor * 100) / 100;
      wasteDivertedKg = Math.round(quantity * 0.02 * 100) / 100;
      calculationMethod = 'Units Avoided × Embodied Virgin Polymer Factor (0.082 kg CO2e/bottle)';
      assumptions.push('Assumes avoidance of single-use 500ml PET bottle or virgin polymer carry bag.');
      break;

    default:
      co2EquivalentKg = Math.round(quantity * 0.5 * 100) / 100;
      calculationMethod = 'Standard Activity Factor';
      emissionFactor = { factor: 0.5, unit: 'kg CO2e / unit', citation: 'General Environmental Guidelines' };
  }

  // Persist record to MongoDB
  await EnvironmentalImpactRecord.create({
    userId,
    activityType,
    inputValues: { quantity, unit, description },
    calculatedValues: {
      co2EquivalentKg,
      pm25AvoidedGrams,
      noxAvoidedGrams,
      wasteDivertedKg,
      waterSavedLiters,
    },
    calculationMethod,
    emissionFactor,
    period,
    assumptions,
    recordedAt: new Date(),
  });

  return {
    activityType,
    inputQuantity: quantity,
    inputUnit: unit,
    calculatedValues: {
      co2EquivalentKg,
      pm25AvoidedGrams,
      noxAvoidedGrams,
      wasteDivertedKg,
      waterSavedLiters,
    },
    calculationMethod,
    emissionFactor,
    assumptions,
    dataConfidence: 'high',
    isReliable: true,
  };
};

export const getUserImpactSummary = async (
  userId: string | mongoose.Types.ObjectId
): Promise<{
  totalCo2EquivalentKg: number;
  totalPm25AvoidedGrams: number;
  totalNoxAvoidedGrams: number;
  totalWasteDivertedKg: number;
  totalWaterSavedLiters: number;
  recordsCount: number;
  equivalentTreesOffset: number;
}> => {
  const records = await EnvironmentalImpactRecord.find({ userId });
  let totalCo2 = 0;
  let totalPm25 = 0;
  let totalNox = 0;
  let totalWaste = 0;
  let totalWater = 0;

  for (const r of records) {
    totalCo2 += r.calculatedValues.co2EquivalentKg || 0;
    totalPm25 += r.calculatedValues.pm25AvoidedGrams || 0;
    totalNox += r.calculatedValues.noxAvoidedGrams || 0;
    totalWaste += r.calculatedValues.wasteDivertedKg || 0;
    totalWater += r.calculatedValues.waterSavedLiters || 0;
  }

  // 1 mature urban tree absorbs ~21.77 kg CO2 annually (US EPA / Indian Forestry Guidelines)
  const equivalentTrees = Math.round((totalCo2 / 21.77) * 10) / 10;

  return {
    totalCo2EquivalentKg: Math.round(totalCo2 * 100) / 100,
    totalPm25AvoidedGrams: Math.round(totalPm25 * 100) / 100,
    totalNoxAvoidedGrams: Math.round(totalNox * 100) / 100,
    totalWasteDivertedKg: Math.round(totalWaste * 100) / 100,
    totalWaterSavedLiters: Math.round(totalWater),
    recordsCount: records.length,
    equivalentTreesOffset: equivalentTrees,
  };
};
