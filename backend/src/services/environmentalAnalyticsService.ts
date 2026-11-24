import mongoose from 'mongoose';
import CarbonFootprintRecord from '../models/CarbonFootprintRecord.js';
import EnvironmentalActivity from '../models/EnvironmentalActivity.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';
import { CommunityCampaign } from '../models/CommunityCampaign.js';
import { CommunityEvent } from '../models/CommunityEvent.js';
import { fetchRealtimeAQI } from './aqiService.js';

export interface DashboardSummary {
  periodLabel: string;
  startDate: string;
  endDate: string;
  hasSufficientData: boolean;
  totalCarbonFootprintKgCO2e: number;
  breakdown: {
    transportationKgCO2e: number;
    electricityKgCO2e: number;
    householdFuelKgCO2e: number;
    wasteKgCO2e: number;
    waterKgCO2e: number;
  };
  sharesPercentage: {
    transportation: number;
    electricity: number;
    householdFuel: number;
    waste: number;
    water: number;
  };
  criteriaPollutantsGrams: {
    pm25: number;
    pm10: number;
    nox: number;
    co: number;
    so2: number;
  };
  resourceMetrics: {
    totalDistanceKm: number;
    electricityKwh: number;
    waterLiters: number;
    wasteDivertedKg: number;
    compostProducedKg: number;
  };
  activitiesCompletedCount: number;
  activeGoalsCount: number;
  trendSeries: Array<{
    date: string;
    totalKgCO2e: number;
    transport: number;
    energy: number;
    waste: number;
  }>;
  dataQualitySummary: {
    averageCompletenessPercentage: number;
    recordCountsByStatus: Record<string, number>;
  };
}

export const getDateRangeFromFilter = (
  filter: string,
  customStart?: string,
  customEnd?: string
): { startDate: Date; endDate: Date; label: string } => {
  const now = new Date();
  const endDate = customEnd ? new Date(customEnd) : new Date(now);

  let startDate: Date;
  let label = 'This Month';

  switch (filter) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      label = 'Today';
      break;
    case 'this_week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      label = 'This Week (Past 7 Days)';
      break;
    case 'last_3_months':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      label = 'Last 3 Months';
      break;
    case 'last_6_months':
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      label = 'Last 6 Months';
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      label = 'This Year';
      break;
    case 'custom':
      startDate = customStart ? new Date(customStart) : new Date(now.setDate(now.getDate() - 30));
      label = 'Custom Range';
      break;
    case 'this_month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      label = 'This Month';
      break;
  }

  return { startDate, endDate, label };
};

export const getDashboardAnalytics = async (
  userId: string,
  filter: string = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<DashboardSummary> => {
  const { startDate, endDate, label } = getDateRangeFromFilter(filter, customStart, customEnd);
  const uId = new mongoose.Types.ObjectId(userId);

  const [records, activities, goals] = await Promise.all([
    CarbonFootprintRecord.find({
      userId: uId,
      date: { $gte: startDate, $lte: endDate },
    }).lean(),
    EnvironmentalActivity.find({
      userId: uId,
      date: { $gte: startDate, $lte: endDate },
    }).lean(),
    EnvironmentalGoal.countDocuments({
      userId: uId,
      status: 'active',
    }),
  ]);

  if (!records || records.length === 0) {
    return {
      periodLabel: label,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      hasSufficientData: false,
      totalCarbonFootprintKgCO2e: 0,
      breakdown: {
        transportationKgCO2e: 0,
        electricityKgCO2e: 0,
        householdFuelKgCO2e: 0,
        wasteKgCO2e: 0,
        waterKgCO2e: 0,
      },
      sharesPercentage: {
        transportation: 0,
        electricity: 0,
        householdFuel: 0,
        waste: 0,
        water: 0,
      },
      criteriaPollutantsGrams: { pm25: 0, pm10: 0, nox: 0, co: 0, so2: 0 },
      resourceMetrics: {
        totalDistanceKm: 0,
        electricityKwh: 0,
        waterLiters: 0,
        wasteDivertedKg: 0,
        compostProducedKg: 0,
      },
      activitiesCompletedCount: activities.length,
      activeGoalsCount: goals,
      trendSeries: [],
      dataQualitySummary: {
        averageCompletenessPercentage: 0,
        recordCountsByStatus: {},
      },
    };
  }

  let transTotal = 0;
  let elecTotal = 0;
  let fuelTotal = 0;
  let wasteTotal = 0;
  let waterTotal = 0;

  let pm25Total = 0;
  let pm10Total = 0;
  let noxTotal = 0;
  let coTotal = 0;
  let so2Total = 0;

  let totalDist = 0;
  let totalKwh = 0;
  let totalWater = 0;
  let totalWasteDiverted = 0;
  let totalCompost = 0;

  const qualityCounts: Record<string, number> = {};
  let qualitySum = 0;

  const dateMap: Record<string, { total: number; transport: number; energy: number; waste: number }> = {};

  records.forEach((r) => {
    const val = r.calculatedEmissionsKgCO2e || 0;
    const cat = r.category;
    const dStr = new Date(r.date).toISOString().split('T')[0];

    if (!dateMap[dStr]) {
      dateMap[dStr] = { total: 0, transport: 0, energy: 0, waste: 0 };
    }

    dateMap[dStr].total += val;

    if (cat === 'transportation') {
      transTotal += val;
      dateMap[dStr].transport += val;
      totalDist += r.inputValues?.distanceKm || r.inputValues?.quantity || 0;
    } else if (cat === 'electricity') {
      elecTotal += val;
      dateMap[dStr].energy += val;
      totalKwh += r.inputValues?.kwh || r.inputValues?.quantity || 0;
    } else if (cat === 'household_fuel') {
      fuelTotal += val;
      dateMap[dStr].energy += val;
    } else if (cat === 'waste') {
      wasteTotal += val;
      dateMap[dStr].waste += val;
      if (r.inputValues?.wasteType === 'recyclable_recovered') {
        totalWasteDiverted += r.inputValues?.quantity || 0;
      } else if (r.inputValues?.wasteType === 'organic_composted') {
        totalCompost += r.inputValues?.quantity || 0;
      }
    } else if (cat === 'water') {
      waterTotal += val;
      totalWater += r.inputValues?.waterLiters || r.inputValues?.quantity || 0;
    }

    if (r.criteriaPollutantsGrams) {
      pm25Total += r.criteriaPollutantsGrams.pm25 || 0;
      pm10Total += r.criteriaPollutantsGrams.pm10 || 0;
      noxTotal += r.criteriaPollutantsGrams.nox || 0;
      coTotal += r.criteriaPollutantsGrams.co || 0;
      so2Total += r.criteriaPollutantsGrams.so2 || 0;
    }

    const st = r.dataQuality?.status || 'Calculated';
    qualityCounts[st] = (qualityCounts[st] || 0) + 1;
    qualitySum += r.dataQuality?.completenessPercentage || 100;
  });

  const totalCarbon = Math.max(0, transTotal + elecTotal + fuelTotal + wasteTotal + waterTotal);

  const calcShare = (v: number) => (totalCarbon > 0 ? Number(((v / totalCarbon) * 100).toFixed(1)) : 0);

  const trendSeries = Object.keys(dateMap)
    .sort()
    .map((d) => ({
      date: d,
      totalKgCO2e: Number(dateMap[d].total.toFixed(2)),
      transport: Number(dateMap[d].transport.toFixed(2)),
      energy: Number(dateMap[d].energy.toFixed(2)),
      waste: Number(dateMap[d].waste.toFixed(2)),
    }));

  return {
    periodLabel: label,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    hasSufficientData: true,
    totalCarbonFootprintKgCO2e: Number(totalCarbon.toFixed(2)),
    breakdown: {
      transportationKgCO2e: Number(transTotal.toFixed(2)),
      electricityKgCO2e: Number(elecTotal.toFixed(2)),
      householdFuelKgCO2e: Number(fuelTotal.toFixed(2)),
      wasteKgCO2e: Number(wasteTotal.toFixed(2)),
      waterKgCO2e: Number(waterTotal.toFixed(2)),
    },
    sharesPercentage: {
      transportation: calcShare(transTotal),
      electricity: calcShare(elecTotal),
      householdFuel: calcShare(fuelTotal),
      waste: calcShare(wasteTotal),
      water: calcShare(waterTotal),
    },
    criteriaPollutantsGrams: {
      pm25: Number(pm25Total.toFixed(1)),
      pm10: Number(pm10Total.toFixed(1)),
      nox: Number(noxTotal.toFixed(1)),
      co: Number(coTotal.toFixed(1)),
      so2: Number(so2Total.toFixed(1)),
    },
    resourceMetrics: {
      totalDistanceKm: Math.round(totalDist),
      electricityKwh: Math.round(totalKwh),
      waterLiters: Math.round(totalWater),
      wasteDivertedKg: Math.round(totalWasteDiverted),
      compostProducedKg: Math.round(totalCompost),
    },
    activitiesCompletedCount: activities.length,
    activeGoalsCount: goals,
    trendSeries,
    dataQualitySummary: {
      averageCompletenessPercentage: Math.round(qualitySum / records.length),
      recordCountsByStatus: qualityCounts,
    },
  };
};

export const getComparisonAnalytics = async (
  userId: string,
  period1: { start: string; end: string; label?: string },
  period2: { start: string; end: string; label?: string }
) => {
  const uId = new mongoose.Types.ObjectId(userId);

  const [p1Records, p2Records] = await Promise.all([
    CarbonFootprintRecord.find({
      userId: uId,
      date: { $gte: new Date(period1.start), $lte: new Date(period1.end) },
    }).lean(),
    CarbonFootprintRecord.find({
      userId: uId,
      date: { $gte: new Date(period2.start), $lte: new Date(period2.end) },
    }).lean(),
  ]);

  const aggregate = (recs: any[]) => {
    let total = 0;
    let transport = 0;
    let energy = 0;
    let waste = 0;
    let water = 0;
    let dist = 0;
    let kwh = 0;

    recs.forEach((r) => {
      const v = r.calculatedEmissionsKgCO2e || 0;
      total += v;
      if (r.category === 'transportation') {
        transport += v;
        dist += r.inputValues?.distanceKm || 0;
      } else if (r.category === 'electricity' || r.category === 'household_fuel') {
        energy += v;
        kwh += r.inputValues?.kwh || 0;
      } else if (r.category === 'waste') {
        waste += v;
      } else if (r.category === 'water') {
        water += v;
      }
    });

    return {
      totalEmissionsKg: Number(total.toFixed(2)),
      transportationKg: Number(transport.toFixed(2)),
      energyKg: Number(energy.toFixed(2)),
      wasteKg: Number(waste.toFixed(2)),
      waterKg: Number(water.toFixed(2)),
      distanceKm: Math.round(dist),
      electricityKwh: Math.round(kwh),
      recordsCount: recs.length,
    };
  };

  const agg1 = aggregate(p1Records);
  const agg2 = aggregate(p2Records);

  const calcDiff = (curr: number, prev: number) => {
    const absDiff = Number((curr - prev).toFixed(2));
    const pctDiff = prev !== 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : null;
    return {
      previous: prev,
      current: curr,
      absoluteDifference: absDiff,
      percentageDifference: pctDiff,
      isReduction: absDiff < 0,
    };
  };

  return {
    period1: {
      label: period1.label || 'Previous Period',
      startDate: period1.start,
      endDate: period1.end,
      metrics: agg1,
    },
    period2: {
      label: period2.label || 'Current Period',
      startDate: period2.start,
      endDate: period2.end,
      metrics: agg2,
    },
    differences: {
      totalCarbonFootprint: calcDiff(agg2.totalEmissionsKg, agg1.totalEmissionsKg),
      transportation: calcDiff(agg2.transportationKg, agg1.transportationKg),
      energy: calcDiff(agg2.energyKg, agg1.energyKg),
      waste: calcDiff(agg2.wasteKg, agg1.wasteKg),
      distanceKm: calcDiff(agg2.distanceKm, agg1.distanceKm),
      electricityKwh: calcDiff(agg2.electricityKwh, agg1.electricityKwh),
    },
    dataCompleteness: {
      period1RecordsCount: agg1.recordsCount,
      period2RecordsCount: agg2.recordsCount,
      isComparisonReliable: agg1.recordsCount > 0 && agg2.recordsCount > 0,
      notice:
        agg1.recordsCount === 0 || agg2.recordsCount === 0
          ? 'Insufficient historical records in one of the selected periods. Log daily activities to unlock complete comparison fidelity.'
          : 'Comparison is evaluated using identical verified CEA and IPCC emission models.',
    },
  };
};

export const getSmartInsights = async (userId: string) => {
  const summary = await getDashboardAnalytics(userId, 'this_month');

  const insights: Array<{
    title: string;
    explanation: string;
    category: string;
    metric: string;
    suggestedAction: string;
    completeness: string;
  }> = [];

  if (!summary.hasSufficientData) {
    insights.push({
      title: 'Initial Profile Setup Required',
      explanation: 'No carbon footprint records logged yet for this month. Start logging your daily commute, electricity bills, or waste segregation.',
      category: 'general',
      metric: '0 activities logged',
      suggestedAction: 'Log your morning commute or enter your last electricity bill in the calculator.',
      completeness: 'Incomplete',
    });
    return { insights };
  }

  // Insight 1: Largest Contributor
  const shares = summary.sharesPercentage;
  let topCategory = 'transportation';
  let maxShare = shares.transportation;

  if (shares.electricity > maxShare) {
    topCategory = 'electricity';
    maxShare = shares.electricity;
  }
  if (shares.householdFuel > maxShare) {
    topCategory = 'household_fuel';
    maxShare = shares.householdFuel;
  }

  insights.push({
    title: `${topCategory.replace('_', ' ').toUpperCase()} Is Your Dominant Carbon Source`,
    explanation: `${topCategory.replace('_', ' ')} accounts for ${maxShare}% (${
      topCategory === 'transportation'
        ? summary.breakdown.transportationKgCO2e
        : summary.breakdown.electricityKgCO2e
    } kg CO2e) of your recorded footprint this month.`,
    category: topCategory,
    metric: `${maxShare}% share`,
    suggestedAction:
      topCategory === 'transportation'
        ? 'Shift 2 private car trips to Metro Rail or bus this week to cut transit emissions by up to 60%.'
        : 'Set air conditioner temperature to 24°C and turn off standby phantom power strips.',
    completeness: 'Verified from recorded inputs',
  });

  // Insight 2: Resource specific
  if (summary.resourceMetrics.wasteDivertedKg > 0 || summary.resourceMetrics.compostProducedKg > 0) {
    insights.push({
      title: 'Positive Solid Waste Diversion',
      explanation: `You successfully diverted ${
        summary.resourceMetrics.wasteDivertedKg + summary.resourceMetrics.compostProducedKg
      } kg of waste from open burning and anaerobic landfills.`,
      category: 'waste',
      metric: `${summary.resourceMetrics.wasteDivertedKg} kg recycled`,
      suggestedAction: 'Keep up two-bin domestic segregation to prevent municipal open burning.',
      completeness: 'High',
    });
  } else {
    insights.push({
      title: 'Waste Records Missing',
      explanation: 'You have not logged any domestic waste segregation or composting records this month.',
      category: 'waste',
      metric: '0 kg tracked',
      suggestedAction: 'Record whether you segregated clean dry recyclables this week.',
      completeness: 'Partial data',
    });
  }

  // Insight 3: Local Air Pollution Awareness Note
  insights.push({
    title: 'Carbon Footprint vs. Ambient AQI Clarification',
    explanation: 'Your carbon footprint measures greenhouse gas emissions (CO2-equivalent) that influence global warming over decades. Local ambient AQI is driven by fine particulate matter (PM2.5, PM10) trapped by winter temperature inversions.',
    category: 'education',
    metric: 'Scientific distinction',
    suggestedAction: 'Check the Local Air Pollution tab to view real-time PM2.5 station observations.',
    completeness: 'Ground truth science',
  });

  return { insights };
};

export const getLocalAirPollutionAwareness = async (lat: number, lon: number, city: string) => {
  const telemetry = await fetchRealtimeAQI(lat, lon, city);

  return {
    location: {
      name: telemetry.location.name,
      city: telemetry.location.city,
      coordinates: { lat, lon },
    },
    currentAqi: telemetry.aqi,
    aqiCategory: telemetry.aqiCategory,
    standard: telemetry.standard,
    pollutants: telemetry.pollutants,
    hourlyTrend: telemetry.hourlyTrend,
    weather: telemetry.weather,
    dataSource: telemetry.dataSource,
    lastUpdated: telemetry.lastUpdated,
    scientificBoundaryNote:
      'Ambient air quality data reflects measured continuous monitoring stations (CPCB / Open-Meteo). Personal carbon footprint reductions do not instantly change ambient citywide PM2.5 readings.',
  };
};
