import mongoose from 'mongoose';
import EnvironmentalReportRecord, {
  IEnvironmentalReportRecord,
  ReportType,
} from '../models/EnvironmentalReportRecord.js';
import { getDashboardAnalytics, getDateRangeFromFilter } from './environmentalAnalyticsService.js';
import CarbonFootprintRecord from '../models/CarbonFootprintRecord.js';
import EnvironmentalActivity from '../models/EnvironmentalActivity.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';

export const generateEnvironmentalReport = async (
  userId: string,
  reportType: ReportType,
  filter: string = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<IEnvironmentalReportRecord> => {
  const { startDate, endDate, label } = getDateRangeFromFilter(filter, customStart, customEnd);
  const uId = new mongoose.Types.ObjectId(userId);

  const [summary, footprintRecords, activities, goals] = await Promise.all([
    getDashboardAnalytics(userId, filter, customStart, customEnd),
    CarbonFootprintRecord.find({ userId: uId, date: { $gte: startDate, $lte: endDate } }).lean(),
    EnvironmentalActivity.find({ userId: uId, date: { $gte: startDate, $lte: endDate } }).lean(),
    EnvironmentalGoal.find({ userId: uId }).lean(),
  ]);

  let title = `Personal Environmental Impact Report (${label})`;
  if (reportType === 'monthly_carbon') title = `Monthly Carbon Footprint Audit (${label})`;
  else if (reportType === 'transportation_impact') title = `Commuter Mobility & Emissions Dossier (${label})`;
  else if (reportType === 'waste_management') title = `Solid Waste Diversion & Recycling Audit (${label})`;

  const reportData = {
    reportType,
    periodLabel: label,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    executiveSummary: {
      totalEmissionsKgCO2e: summary.totalCarbonFootprintKgCO2e,
      breakdown: summary.breakdown,
      sharesPercentage: summary.sharesPercentage,
      criteriaPollutantsGrams: summary.criteriaPollutantsGrams,
      resourceMetrics: summary.resourceMetrics,
      activitiesCompleted: summary.activitiesCompletedCount,
    },
    activitiesLog: activities.map((a) => ({
      activityName: a.activityName,
      category: a.category,
      date: a.date,
      quantity: a.quantity,
      unit: a.unit,
      source: a.dataQuality.source,
      status: a.dataQuality.status,
    })),
    detailedFootprintEntries: footprintRecords.map((f) => ({
      activity: f.activityName,
      category: f.category,
      calculatedEmissionsKgCO2e: f.calculatedEmissionsKgCO2e,
      factorApplied: `${f.emissionFactor.factor} ${f.emissionFactor.unit}`,
      citation: f.emissionFactor.source,
      dataQuality: f.dataQuality.status,
      date: f.date,
    })),
    goalsOverview: goals.map((g) => ({
      title: g.title,
      category: g.category,
      progress: `${g.currentValue} / ${g.targetValue} ${g.unit}`,
      status: g.status,
    })),
    methodologyNotes: [
      'Electricity emissions evaluated using Central Electricity Authority (CEA) Baseline Database v19 (0.716 kg CO2e/kWh).',
      'Transportation emissions evaluated via Bureau of Energy Efficiency (BEE) and IPCC 2006 Mobile Combustion Guidelines.',
      'Waste diversion avoided emissions modeled via CPCB First-Order Decay & Material Recovery Factors.',
      'Criteria air pollutants (PM2.5, NOx, SO2) reported separately from greenhouse gas (CO2-equivalent) inventories.',
    ],
    transparencyNotice:
      'This report is generated for personal and community decision intelligence from user-entered and verified monitoring logs. It does not constitute a statutory carbon credit certification.',
  };

  const reportRecord = new EnvironmentalReportRecord({
    userId: uId,
    reportType,
    title,
    reportingPeriod: {
      startDate,
      endDate,
      label,
    },
    reportData,
    generatedAt: new Date(),
  });

  return reportRecord.save();
};

export const getUserReports = async (userId: string) => {
  return EnvironmentalReportRecord.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ generatedAt: -1 })
    .lean();
};

export const getReportById = async (reportId: string, userId: string) => {
  const report = await EnvironmentalReportRecord.findOne({
    _id: new mongoose.Types.ObjectId(reportId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!report) {
    throw new Error('Report not found');
  }

  return report;
};

export const generateCsvExport = (report: IEnvironmentalReportRecord): string => {
  const data = report.reportData;
  const rows: string[] = [];

  rows.push('"ClearAir AI - Environmental Impact Report"');
  rows.push(`"Report Title","${report.title}"`);
  rows.push(`"Period","${report.reportingPeriod.label} (${report.reportingPeriod.startDate} to ${report.reportingPeriod.endDate})"`);
  rows.push(`"Generated At","${new Date(report.generatedAt).toISOString()}"`);
  rows.push('');
  rows.push('"--- EXECUTIVE SUMMARY ---"');
  rows.push('"Metric","Value","Unit"');
  rows.push(`"Total Carbon Footprint","${data.executiveSummary.totalEmissionsKgCO2e}","kg CO2e"`);
  rows.push(`"Transportation Emissions","${data.executiveSummary.breakdown.transportationKgCO2e}","kg CO2e"`);
  rows.push(`"Electricity Emissions","${data.executiveSummary.breakdown.electricityKgCO2e}","kg CO2e"`);
  rows.push(`"Household Fuel Emissions","${data.executiveSummary.breakdown.householdFuelKgCO2e}","kg CO2e"`);
  rows.push(`"Waste Disposed / Diverted","${data.executiveSummary.breakdown.wasteKgCO2e}","kg CO2e"`);
  rows.push(`"Water Treatment Emissions","${data.executiveSummary.breakdown.waterKgCO2e}","kg CO2e"`);
  rows.push(`"Total Clean Distance Logged","${data.executiveSummary.resourceMetrics.totalDistanceKm}","km"`);
  rows.push(`"Total Electricity Logged","${data.executiveSummary.resourceMetrics.electricityKwh}","kWh"`);
  rows.push(`"Waste Diverted from Landfill","${data.executiveSummary.resourceMetrics.wasteDivertedKg}","kg"`);
  rows.push('');
  rows.push('"--- DETAILED FOOTPRINT ENTRIES ---"');
  rows.push('"Date","Activity","Category","Emissions (kg CO2e)","Emission Factor","Data Quality"');

  if (Array.isArray(data.detailedFootprintEntries)) {
    data.detailedFootprintEntries.forEach((entry: any) => {
      rows.push(
        `"${new Date(entry.date).toLocaleDateString()}","${entry.activity}","${entry.category}","${entry.calculatedEmissionsKgCO2e}","${entry.factorApplied}","${entry.dataQuality}"`
      );
    });
  }

  return rows.join('\n');
};
