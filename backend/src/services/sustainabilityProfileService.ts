import mongoose from 'mongoose';
import { UserSustainabilityProfile, IUserSustainabilityProfile } from '../models/UserSustainabilityProfile.js';
import { SustainableAction } from '../models/SustainableAction.js';
import { ChallengeProgress } from '../models/GreenChallenge.js';
import { HouseholdSustainability } from '../models/HouseholdSustainability.js';

export const getOrCreateSustainabilityProfile = async (
  userId: string | mongoose.Types.ObjectId
): Promise<IUserSustainabilityProfile> => {
  let profile = await UserSustainabilityProfile.findOne({ userId });
  if (!profile) {
    profile = await UserSustainabilityProfile.create({
      userId,
      budgetPreference: 'all',
      focusCategories: ['transportation', 'energy', 'waste', 'cooking'],
      transportationHabits: {
        primaryCommuteMode: 'public_transit',
        hasBicycle: false,
        hasElectricVehicle: false,
        willingToCarpool: true,
        dailyCommuteDistanceKm: 12,
      },
      householdHabits: {
        cookingFuel: 'piped_natural_gas',
        wasteSegregationPracticed: true,
        compostingActive: false,
        airConditioningUsageHoursPerDay: 4,
        solarPanelsInstalled: false,
        waterPurifierRejectWaterReused: false,
        appliancesStarRatingAvg: 3,
      },
      sustainabilityGoals: [
        'Reduce single-use plastic',
        'Optimize AC temperature to 24°C',
        'Segregate household waste',
      ],
      sustainabilityScore: {
        overall: 58,
        actionCompletionScore: 22,
        challengeScore: 14,
        diversityScore: 12,
        householdScore: 10,
        lastCalculatedAt: new Date(),
        calculationExplanation:
          'Transparent Criteria: Score = (Completed Actions / Total Actions * 40) + (Challenge Days / 7 * 25) + (Active Categories / 7 * 20) + (Household Practices * 15)',
      },
    });
  }
  return profile;
};

export const updateSustainabilityProfile = async (
  userId: string | mongoose.Types.ObjectId,
  updates: Partial<IUserSustainabilityProfile>
): Promise<IUserSustainabilityProfile> => {
  const profile = await getOrCreateSustainabilityProfile(userId);
  if (updates.budgetPreference) profile.budgetPreference = updates.budgetPreference;
  if (updates.focusCategories) profile.focusCategories = updates.focusCategories;
  if (updates.transportationHabits) {
    profile.transportationHabits = { ...profile.transportationHabits, ...updates.transportationHabits };
  }
  if (updates.householdHabits) {
    profile.householdHabits = { ...profile.householdHabits, ...updates.householdHabits };
  }
  if (updates.sustainabilityGoals) profile.sustainabilityGoals = updates.sustainabilityGoals;

  await profile.save();
  return recalculateSustainabilityScore(userId);
};

export const recalculateSustainabilityScore = async (
  userId: string | mongoose.Types.ObjectId
): Promise<IUserSustainabilityProfile> => {
  const profile = await getOrCreateSustainabilityProfile(userId);

  // 1. Action Completion (up to 40 pts)
  const totalActions = await SustainableAction.countDocuments({ userId });
  const completedActions = await SustainableAction.countDocuments({ userId, status: 'completed' });
  const actionCompletionScore =
    totalActions > 0 ? Math.min(40, Math.round((completedActions / totalActions) * 40)) : 15;

  // 2. Challenge Progress (up to 25 pts)
  const activeChallenge = await ChallengeProgress.findOne({ userId, status: { $in: ['active', 'completed'] } });
  const challengeDaysCount = activeChallenge ? activeChallenge.completedDaysCount : 2;
  const challengeScore = Math.min(25, Math.round((challengeDaysCount / 7) * 25));

  // 3. Category Breadth (up to 20 pts)
  const distinctCategories = await SustainableAction.distinct('category', { userId, status: 'completed' });
  const diversityCount = Math.max(distinctCategories.length, profile.focusCategories.length > 0 ? 3 : 1);
  const diversityScore = Math.min(20, Math.round((diversityCount / 7) * 20));

  // 4. Household practices (up to 15 pts)
  let householdScore = 0;
  if (profile.householdHabits.wasteSegregationPracticed) householdScore += 4;
  if (profile.householdHabits.compostingActive) householdScore += 4;
  if (profile.householdHabits.solarPanelsInstalled) householdScore += 3;
  if (profile.householdHabits.waterPurifierRejectWaterReused) householdScore += 2;
  if (profile.householdHabits.appliancesStarRatingAvg >= 4) householdScore += 2;
  householdScore = Math.min(15, householdScore);

  const overall = actionCompletionScore + challengeScore + diversityScore + householdScore;

  profile.sustainabilityScore = {
    overall: Math.min(100, Math.max(0, overall)),
    actionCompletionScore,
    challengeScore,
    diversityScore,
    householdScore,
    lastCalculatedAt: new Date(),
    calculationExplanation: `Transparent Score = Action Completion (${actionCompletionScore}/40) + Challenge Progress (${challengeScore}/25) + Category Breadth (${diversityScore}/20) + Household Habits (${householdScore}/15).`,
  };

  await profile.save();
  return profile;
};
