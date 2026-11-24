import mongoose from 'mongoose';
import { EnvironmentalImpactRecord } from '../models/EnvironmentalImpactRecord.js';
import { SustainableAction } from '../models/SustainableAction.js';

export interface BeforeAfterComparisonData {
  category: string;
  beforeHabit: string;
  afterAlternative: string;
  metricLabel: string;
  beforeValueText: string;
  afterValueText: string;
  changeSummary: string;
  estimatedCo2AvoidedKgMonthly: number;
  estimatedMoneySavedInrMonthly?: number;
  scientificExplanation: string;
  disclaimer: string;
}

export const getBeforeAfterComparisons = async (
  userId: string | mongoose.Types.ObjectId
): Promise<{
  comparisons: BeforeAfterComparisonData[];
  overallMonthlyCo2SavedKg: number;
  overallMonthlyMoneySavedInr: number;
  disclaimerNotice: string;
}> => {
  const comparisons: BeforeAfterComparisonData[] = [
    {
      category: 'Transportation',
      beforeHabit: 'Daily solo commute in a private petrol car (15 km roundtrip)',
      afterAlternative: 'Daily commute via Metro mass transit with electric feeder connection',
      metricLabel: 'Monthly Transport CO2e',
      beforeValueText: '~64 kg CO2e / month',
      afterValueText: '~10 kg CO2e / month',
      changeSummary: '84% reduction in commuter tailpipe greenhouse emissions',
      estimatedCo2AvoidedKgMonthly: 54,
      estimatedMoneySavedInrMonthly: 2200,
      scientificExplanation: 'Mass transit distributes traction energy over thousands of passengers, operating on high-efficiency dedicated electric rail rather than idling in stop-and-go arterial traffic.',
      disclaimer: 'Calculated using IPCC 2006 Mobile Combustion Guidelines and DMRC per-passenger emission factors.',
    },
    {
      category: 'Household Energy',
      beforeHabit: 'Operating residential Air Conditioner at 18°C–20°C for 8 hours daily',
      afterAlternative: 'Operating AC at BEE-recommended 24°C with a gentle ceiling fan',
      metricLabel: 'Monthly AC Electricity Usage',
      beforeValueText: '~320 kWh / month',
      afterValueText: '~230 kWh / month',
      changeSummary: '28% reduction in compressor electricity consumption (~90 kWh saved)',
      estimatedCo2AvoidedKgMonthly: 64.4,
      estimatedMoneySavedInrMonthly: 720,
      scientificExplanation: 'Each 1°C increase in evaporator set-point reduces compressor thermodynamic workload by ~6%. CEA Indian grid emission factor: 0.716 kg CO2e/kWh.',
      disclaimer: 'Based on Bureau of Energy Efficiency (BEE) empirical residential testing standards.',
    },
    {
      category: 'Waste Management',
      beforeHabit: 'Unsegregated domestic waste dumped into municipal landfill collection',
      afterAlternative: 'Two-bin source segregation with decentralized wet waste composting',
      metricLabel: 'Monthly Landfill Diversion',
      beforeValueText: '0 kg diverted (100% landfilled)',
      afterValueText: '24 kg organic waste composted & diverted',
      changeSummary: '100% diversion of organic fraction from landfill methane generation',
      estimatedCo2AvoidedKgMonthly: 10.8,
      scientificExplanation: 'Aerobic composting prevents anaerobic methanogenesis, eliminating spontaneous landfill smoldering and surface methane flares.',
      disclaimer: 'CPCB Solid Waste Management Emission Factors / IPCC Waste Model.',
    },
    {
      category: 'Shopping & Consumption',
      beforeHabit: 'Using 20+ single-use plastic carry bags and 10 PET water bottles monthly',
      afterAlternative: 'Durable cotton tote bags and insulated stainless steel bottle',
      metricLabel: 'Monthly Single-Use Plastics',
      beforeValueText: '30 disposable plastic items',
      afterValueText: '0 disposable items',
      changeSummary: 'Eliminates 360 single-use plastic items annually per person',
      estimatedCo2AvoidedKgMonthly: 2.5,
      estimatedMoneySavedInrMonthly: 200,
      scientificExplanation: 'Avoids upstream petrochemical cracking and polymer synthesis emissions, preventing microplastic environmental degradation.',
      disclaimer: 'UNEP Life Cycle Assessment of Single-Use vs Reusable Containers.',
    },
  ];

  const overallCo2 = comparisons.reduce((sum, c) => sum + c.estimatedCo2AvoidedKgMonthly, 0);
  const overallMoney = comparisons.reduce((sum, c) => sum + (c.estimatedMoneySavedInrMonthly || 0), 0);

  return {
    comparisons,
    overallMonthlyCo2SavedKg: Math.round(overallCo2 * 10) / 10,
    overallMonthlyMoneySavedInr: overallMoney,
    disclaimerNotice:
      'Actual recorded lifestyle changes are distinguished from model-estimated environmental benefits. Personal emission reductions contribute to community sustainability but do not claim to directly alter regional ambient air quality on their own.',
  };
};
