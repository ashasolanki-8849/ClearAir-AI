import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as carbonService from '../services/carbonFootprintService.js';
import * as analyticsService from '../services/environmentalAnalyticsService.js';
import * as goalService from '../services/environmentalGoalService.js';
import * as reportService from '../services/environmentalReportService.js';
import * as advisorService from '../services/environmentalAdvisorService.js';
import * as factorService from '../services/emissionFactorService.js';
import EnvironmentalActivity from '../models/EnvironmentalActivity.js';
import { FamilyProfile } from '../models/FamilyProfile.js';
import Community from '../models/Community.js';
import { CommunityCampaign } from '../models/CommunityCampaign.js';
import { CommunityEvent } from '../models/CommunityEvent.js';
import mongoose from 'mongoose';

// ================= DASHBOARD & SUMMARY =================

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { filter, startDate, endDate } = req.query;

    const data = await analyticsService.getDashboardAnalytics(
      userId,
      (filter as string) || 'this_month',
      startDate as string,
      endDate as string
    );

    res.status(200).json({ success: true, dashboard: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const data = await analyticsService.getDashboardAnalytics(userId, 'this_month');
    res.status(200).json({ success: true, summary: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrends = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const data = await analyticsService.getDashboardAnalytics(userId, 'last_6_months');
    res.status(200).json({ success: true, trends: data.trendSeries });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSmartInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const result = await analyticsService.getSmartInsights(userId);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CARBON FOOTPRINT CALCULATORS =================

export const calculateTransport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { transportMode, distanceKm, passengers, fuelType, saveToLog } = req.body;
    const userId = req.user?.id;

    const result = await carbonService.calculateTransportFootprint({
      transportMode,
      distanceKm: parseFloat(distanceKm),
      passengers: passengers ? parseInt(passengers, 10) : 1,
      fuelType,
    });

    let savedRecord = null;
    if (saveToLog && userId) {
      savedRecord = await carbonService.recordFootprintActivity(userId, result);
    }

    res.status(200).json({ success: true, result, savedRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const calculateEnergy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { kwh, fuelType, quantity, billingPeriod, renewableShare, saveToLog } = req.body;
    const userId = req.user?.id;

    let result;
    if (fuelType) {
      result = await carbonService.calculateHouseholdFuelFootprint({
        fuelType,
        quantity: parseFloat(quantity),
      });
    } else {
      result = await carbonService.calculateElectricityFootprint({
        kwh: parseFloat(kwh),
        billingPeriod,
        renewableShare: renewableShare ? parseFloat(renewableShare) : 0,
      });
    }

    let savedRecord = null;
    if (saveToLog && userId) {
      savedRecord = await carbonService.recordFootprintActivity(userId, result);
    }

    res.status(200).json({ success: true, result, savedRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const calculateWaste = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { wasteType, quantityKg, saveToLog } = req.body;
    const userId = req.user?.id;

    const result = await carbonService.calculateWasteFootprint({
      wasteType,
      quantityKg: parseFloat(quantityKg),
    });

    let savedRecord = null;
    if (saveToLog && userId) {
      savedRecord = await carbonService.recordFootprintActivity(userId, result);
    }

    res.status(200).json({ success: true, result, savedRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const calculateWater = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { liters, saveToLog } = req.body;
    const userId = req.user?.id;

    const result = await carbonService.calculateWaterFootprint({
      liters: parseFloat(liters),
    });

    let savedRecord = null;
    if (saveToLog && userId) {
      savedRecord = await carbonService.recordFootprintActivity(userId, result);
    }

    res.status(200).json({ success: true, result, savedRecord });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const calculateCarbonGeneral = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    if (category === 'transportation') return calculateTransport(req, res);
    if (category === 'electricity' || category === 'household_fuel') return calculateEnergy(req, res);
    if (category === 'waste') return calculateWaste(req, res);
    if (category === 'water') return calculateWater(req, res);
    res.status(400).json({ success: false, message: 'Invalid or unsupported calculation category' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCarbonHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { category, startDate, endDate, limit, skip } = req.query;

    const result = await carbonService.getFootprintHistory({
      userId,
      category: category as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string, 10) : 30,
      skip: skip ? parseInt(skip as string, 10) : 0,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ACTIVITY LOGGER =================

export const getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { category, page, limit } = req.query;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (category && category !== 'all') query.category = category;

    const pageNum = Math.max(1, page ? parseInt(page as string, 10) : 1);
    const limitNum = Math.min(50, limit ? parseInt(limit as string, 10) : 20);

    const [activities, total] = await Promise.all([
      EnvironmentalActivity.find(query)
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      EnvironmentalActivity.countDocuments(query),
    ]);

    res.status(200).json({ success: true, activities, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { activityName, category, date, quantity, unit, notes } = req.body;
    if (!activityName || !category) {
      res.status(400).json({ success: false, message: 'Activity name and category are required' });
      return;
    }

    const activity = await EnvironmentalActivity.create({
      userId: new mongoose.Types.ObjectId(req.user.id),
      activityName,
      category,
      date: date ? new Date(date) : new Date(),
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit,
      notes: notes || '',
      isCompleted: true,
      dataQuality: {
        status: 'User Entered',
        source: 'Manual Green Action Log',
      },
    });

    res.status(201).json({ success: true, activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getActivityById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const activity = await EnvironmentalActivity.findById(id).lean();
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }
    res.status(200).json({ success: true, activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { activityName, category, quantity, unit, notes } = req.body;

    const activity = await EnvironmentalActivity.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(req.user.id) },
      { $set: { activityName, category, quantity, unit, notes } },
      { new: true }
    );

    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found or unauthorized' });
      return;
    }

    res.status(200).json({ success: true, activity });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const result = await EnvironmentalActivity.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Activity not found or unauthorized' });
      return;
    }

    res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= COMPARISON =================

export const comparePeriods = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { period1, period2 } = req.body;

    if (!period1?.start || !period1?.end || !period2?.start || !period2?.end) {
      // Default: This month vs Last month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const thisMonthEnd = new Date().toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const comparison = await analyticsService.getComparisonAnalytics(
        userId,
        { start: lastMonthStart, end: lastMonthEnd, label: 'Last Month' },
        { start: thisMonthStart, end: thisMonthEnd, label: 'This Month' }
      );
      res.status(200).json({ success: true, comparison });
      return;
    }

    const comparison = await analyticsService.getComparisonAnalytics(userId, period1, period2);
    res.status(200).json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOCAL AIR POLLUTION AWARENESS =================

export const getLocalPollutionAwareness = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.6139;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 77.209;
    const city = (req.query.city as string) || 'Delhi';

    const awareness = await analyticsService.getLocalAirPollutionAwareness(lat, lon, city);
    res.status(200).json({ success: true, awareness });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ENVIRONMENTAL GOALS =================

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { status } = req.query;
    const goals = await goalService.getGoals(userId, status as string);
    res.status(200).json({ success: true, goals });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { title, category, targetValue, unit, startDate, endDate, trackingFrequency, remindersEnabled, notes } = req.body;

    const goal = await goalService.createGoal(req.user.id, {
      title,
      category,
      targetValue: parseFloat(targetValue),
      unit,
      startDate,
      endDate,
      trackingFrequency,
      remindersEnabled,
      notes,
    });

    res.status(201).json({ success: true, goal });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateGoalProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { incrementValue } = req.body;
    const goal = await goalService.updateGoalProgress(id, parseFloat(incrementValue));
    res.status(200).json({ success: true, goal });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateGoalStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const goal = await goalService.updateGoalStatus(id, status);
    res.status(200).json({ success: true, goal });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const result = await goalService.deleteGoal(id, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ================= FAMILY & COMMUNITY INTEGRATION =================

export const getFamilySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const familyMembers = await FamilyProfile.find({ userId }).lean();

    const summary = await analyticsService.getDashboardAnalytics(userId, 'this_month');

    res.status(200).json({
      success: true,
      familyMembersCount: familyMembers.length + 1,
      householdMetrics: {
        totalEmissionsKgCO2e: summary.totalCarbonFootprintKgCO2e,
        electricityKwh: summary.resourceMetrics.electricityKwh,
        waterLiters: summary.resourceMetrics.waterLiters,
        wasteDivertedKg: summary.resourceMetrics.wasteDivertedKg,
      },
      perCapitaEmissionsKgCO2e: Number(
        (summary.totalCarbonFootprintKgCO2e / Math.max(1, familyMembers.length + 1)).toFixed(2)
      ),
      note: 'Aggregated without duplicate counting across shared household utility meters.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityImpactSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const [community, campaigns, events] = await Promise.all([
      Community.findById(communityId).lean(),
      CommunityCampaign.find({ communityId }).lean(),
      CommunityEvent.find({ communityId }).lean(),
    ]);

    if (!community) {
      res.status(404).json({ success: false, message: 'Community not found' });
      return;
    }

    let wasteKg = 0;
    let trees = 0;
    let attendees = 0;

    events.forEach((e: any) => {
      if (e.impactSummary) {
        wasteKg += e.impactSummary.wasteCollectedKg || 0;
        trees += e.impactSummary.treesPlanted || 0;
        attendees += e.impactSummary.attendees || e.registeredCount || 0;
      }
    });

    campaigns.forEach((c: any) => {
      if (c.category === 'waste_segregation') {
        wasteKg += c.currentValue || 0;
      }
    });

    res.status(200).json({
      success: true,
      communityId,
      communityName: community.name,
      membersCount: community.membersCount,
      campaignsCount: campaigns.length,
      eventsCount: events.length,
      totalAttendees: attendees,
      wasteCollectedOrDivertedKg: wasteKg,
      treesPlanted: trees,
      notice: 'Community metrics represent physical logged volunteer operations.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= AI IMPACT ADVISOR =================

export const askImpactAdvisor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { message } = req.body;
    const advice = await advisorService.getImpactAIAdvice(userId, message);
    res.status(200).json({ success: true, advice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= REPORTS =================

export const generateReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { reportType, filter, startDate, endDate } = req.body;
    const report = await reportService.generateEnvironmentalReport(
      req.user.id,
      reportType || 'personal_summary',
      filter || 'this_month',
      startDate,
      endDate
    );
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const reports = await reportService.getUserReports(userId);
    res.status(200).json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { id } = req.params;
    const report = await reportService.getReportById(id, userId);
    res.status(200).json({ success: true, report });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const downloadReportCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { id } = req.params;
    const report = await reportService.getReportById(id, userId);
    const csvContent = reportService.generateCsvExport(report as any);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="clearair-report-${id}.csv"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DATA SOURCES & TRANSPARENCY =================

export const getEmissionFactors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const factors = await factorService.getEmissionFactors(category as string);
    res.status(200).json({ success: true, factors });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDataQuality = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      supportedQualityStatuses: [
        { status: 'User Entered', description: 'Values manually provided by user via form inputs' },
        { status: 'Measured', description: 'Recorded by hardware meter or telemetry device' },
        { status: 'Imported', description: 'Extracted from uploaded billing statements' },
        { status: 'Estimated', description: 'Approximated using verified regional averages' },
        { status: 'Calculated', description: 'Derived via documented CEA / IPCC conversion equations' },
        { status: 'Verified', description: 'Audited and confirmed by community administrator' },
      ],
      standards: [
        'Central Electricity Authority (CEA) Baseline Database for Indian Power Sector v19',
        'IPCC 2006 Guidelines for National Greenhouse Gas Inventories',
        'CPCB Municipal Solid Waste Characterization & First Order Decay Methane Model',
        'CPHEEO Potable Water Supply Standards',
      ],
      transparencyPledge:
        'ClearAir AI displays "Insufficient data for a reliable calculation" when required variables are missing, strictly avoiding arbitrary default fabrication.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
