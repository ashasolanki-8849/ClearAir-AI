import { Request, Response } from 'express';
import {
  getOrCreateSustainabilityProfile,
  updateSustainabilityProfile,
  recalculateSustainabilityScore,
} from '../services/sustainabilityProfileService.js';
import {
  getPrioritizedRecommendations,
  seedDefaultRecommendations,
} from '../services/sustainabilityRecommendationService.js';
import { getBudgetAlternatives } from '../services/sustainableAlternativeService.js';
import { getLocalSustainableFacilities } from '../services/localSolutionService.js';
import {
  calculateEnvironmentalImpact,
  getUserImpactSummary,
} from '../services/sustainabilityImpactService.js';
import {
  seedDefaultChallenge,
  getOrCreateUserChallengeProgress,
  updateChallengeDayProgress,
} from '../services/greenChallengeService.js';
import {
  getOrCreateHouseholdSustainability,
  addHouseholdGoal,
  updateHouseholdGoal,
} from '../services/householdSustainabilityService.js';
import { generateSustainabilityAdvice } from '../services/sustainabilityAssistantService.js';
import { getBeforeAfterComparisons } from '../services/sustainabilityComparisonService.js';
import { SustainableAction } from '../models/SustainableAction.js';
import { SustainableRecommendation } from '../models/SustainableRecommendation.js';
import { SustainabilityHistory } from '../models/SustainabilityHistory.js';
import { EnvironmentalImpactRecord } from '../models/EnvironmentalImpactRecord.js';

export const getSustainabilityDashboard = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.query.userId || 'guest-user';

    const [profile, recommendations, actions, challengeProgress, household, impactSummary] =
      await Promise.all([
        getOrCreateSustainabilityProfile(userId),
        getPrioritizedRecommendations(undefined, undefined),
        SustainableAction.find({ userId }).sort({ createdAt: -1 }),
        getOrCreateUserChallengeProgress(userId),
        getOrCreateHouseholdSustainability(userId),
        getUserImpactSummary(userId),
      ]);

    res.status(200).json({
      success: true,
      data: {
        sustainabilityScore: profile.sustainabilityScore,
        profile,
        recommendedImprovements: recommendations.slice(0, 3), // Top 3 priority actions
        allRecommendations: recommendations,
        dailyActions: actions,
        challengeProgress,
        household,
        impactSummary,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const budget = req.query.budget as string | undefined;
    const recommendations = await getPrioritizedRecommendations(category, budget);
    res.status(200).json({ success: true, count: recommendations.length, recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateRecommendations = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const profile = await getOrCreateSustainabilityProfile(userId);
    const recommendations = await getPrioritizedRecommendations(
      profile.focusCategories[0],
      profile.budgetPreference
    );
    res.status(200).json({ success: true, count: recommendations.length, recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const rec = await SustainableRecommendation.findById(id);
    if (!rec) {
      res.status(404).json({ success: false, message: 'Recommendation not found' });
      return;
    }
    res.status(200).json({ success: true, recommendation: rec });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRecommendationStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id || 'guest-user';

    const rec = await SustainableRecommendation.findById(id);
    if (!rec) {
      res.status(404).json({ success: false, message: 'Recommendation not found' });
      return;
    }

    let action = await SustainableAction.findOne({ userId, recommendationId: rec._id });
    if (!action) {
      action = await SustainableAction.create({
        userId,
        recommendationId: rec._id,
        title: rec.recommendedAlternative,
        category: rec.category,
        costCategory: rec.costCategory,
        status: status || 'completed',
        completedAt: status === 'completed' ? new Date() : undefined,
        notes,
      });
    } else {
      action.status = status || action.status;
      if (status === 'completed') action.completedAt = new Date();
      if (notes) action.notes = notes;
      await action.save();
    }

    // Recalculate score
    const updatedProfile = await recalculateSustainabilityScore(userId);

    res.status(200).json({
      success: true,
      action,
      sustainabilityScore: updatedProfile.sustainabilityScore,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const profile = await getOrCreateSustainabilityProfile(userId);
    res.status(200).json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfileHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const profile = await updateSustainabilityProfile(userId, req.body);
    res.status(200).json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAlternatives = async (req: Request, res: Response): Promise<void> => {
  try {
    const budget = req.query.budget as any;
    const alternatives = await getBudgetAlternatives(budget);
    res.status(200).json({ success: true, count: alternatives.length, alternatives });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLocalSolutions = (req: Request, res: Response): void => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const category = req.query.category as string | undefined;

    const result = getLocalSustainableFacilities(lat, lon, category);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const chatWithAdvisor = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'User message string is required' });
      return;
    }

    const result = await generateSustainabilityAdvice(message, userId, context || {});
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const calculateImpactHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const { activityType, quantity, unit, period, description } = req.body;

    const result = await calculateEnvironmentalImpact(
      userId,
      activityType,
      parseFloat(quantity),
      unit || 'unit',
      period,
      description
    );

    res.status(200).json({ success: true, impact: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getImpactHistory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const records = await EnvironmentalImpactRecord.find({ userId }).sort({ recordedAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: records.length, records });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getImpactSummaryHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const summary = await getUserImpactSummary(userId);
    res.status(200).json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getChallenges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await seedDefaultChallenge();
    res.status(200).json({ success: true, challenge });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const startChallenge = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const progress = await getOrCreateUserChallengeProgress(userId);
    res.status(200).json({ success: true, progress });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateChallengeProgress = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const { dayNumber, isCompleted } = req.body;

    const progress = await updateChallengeDayProgress(userId, parseInt(dayNumber, 10), !!isCompleted);
    await recalculateSustainabilityScore(userId);

    res.status(200).json({ success: true, progress });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getChallengeProgress = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const progress = await getOrCreateUserChallengeProgress(userId);
    res.status(200).json({ success: true, progress });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHousehold = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const household = await getOrCreateHouseholdSustainability(userId);
    res.status(200).json({ success: true, household });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addHouseholdGoalHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const household = await addHouseholdGoal(userId, req.body);
    res.status(201).json({ success: true, household });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateHouseholdGoalHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const { id } = req.params;
    const household = await updateHouseholdGoal(userId, id, req.body);
    res.status(200).json({ success: true, household });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHistory = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const history = await SustainabilityHistory.find({ userId }).sort({ recordedAt: -1 }).limit(50);
    res.status(200).json({ success: true, count: history.length, history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getComparisonsHandler = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest-user';
    const data = await getBeforeAfterComparisons(userId);
    res.status(200).json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
