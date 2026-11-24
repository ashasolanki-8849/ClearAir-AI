import mongoose from 'mongoose';
import {
  GreenChallenge,
  ChallengeProgress,
  IGreenChallenge,
  IChallengeProgress,
  IChallengeDayItem,
} from '../models/GreenChallenge.js';
import { SustainabilityCategory } from '../models/UserSustainabilityProfile.js';

export const DEFAULT_7_DAY_CHALLENGE = {
  title: '7-Day ClearAir Sustainable Living Challenge',
  description:
    'A realistic, progressive habit builder tailored for Indian urban households to curtail unnecessary pollution, conserve energy, and build sustainable daily resilience.',
  durationDays: 7,
  category: 'holistic' as const,
  difficulty: 'beginner' as const,
  instructions: [
    'Complete one specific micro-action each day.',
    'Outdoor activities are strictly scheduled during safe midday solar mixing windows, never during severe morning inversion smog.',
    'Mark the day completed to track your progress and unlock the Green Habit Champion badge.',
  ],
  days: [
    {
      dayNumber: 1,
      title: 'Vampire Power & AC 24°C Optimization',
      description: 'Set air conditioning to 24°C and switch off standby power strips before retiring.',
      category: 'energy' as SustainabilityCategory,
      practicalAction: 'Adjust master bedroom thermostat to 24°C and unplug unused device chargers.',
      estimatedTimeMinutes: 5,
      expectedBenefit: 'Saves ~2.8 kWh per unit and avoids 2.0 kg CO2e.',
      isCompleted: false,
    },
    {
      dayNumber: 2,
      title: 'Zero-Plastic Carry Habit',
      description: 'Place 2 reusable cloth bags in your backpack or near the front door; carry a stainless steel water bottle.',
      category: 'shopping' as SustainabilityCategory,
      practicalAction: 'Ditch single-use plastic carry bags during your daily vegetable or grocery run.',
      estimatedTimeMinutes: 5,
      expectedBenefit: 'Diverts 2–4 polybags and avoids microplastic exposure.',
      isCompleted: false,
    },
    {
      dayNumber: 3,
      title: 'Two-Bin Domestic Waste Segregation',
      description: 'Set up distinct green (wet organic) and blue (clean dry recyclable) bins at home.',
      category: 'waste' as SustainabilityCategory,
      practicalAction: 'Rinse milk pouches and food plastic before placing them into the dry recyclable bin.',
      estimatedTimeMinutes: 10,
      expectedBenefit: 'Enables 100% recycling of dry polymers and prevents landfill methane fires.',
      isCompleted: false,
    },
    {
      dayNumber: 4,
      title: 'Smart Commute & Trip Chaining',
      description: 'Combine two errands into one trip and opt for mass transit or carpooling.',
      category: 'transportation' as SustainabilityCategory,
      practicalAction: 'Travel via Metro or electric feeder bus; avoid cold-start solo vehicle trips.',
      estimatedTimeMinutes: 20,
      expectedBenefit: 'Avoids roadway micro-environment PM2.5 spikes and saves fuel.',
      isCompleted: false,
    },
    {
      dayNumber: 5,
      title: 'Clean Kitchen Ventilation & Food Care',
      description: 'Cook with covered lids, operate kitchen range hoods actively, and freeze or repurpose dinner leftovers.',
      category: 'cooking' as SustainabilityCategory,
      practicalAction: 'Run exhaust fan 2 minutes before igniting burners and keep lids firmly on simmering pots.',
      estimatedTimeMinutes: 15,
      expectedBenefit: 'Cuts LPG fuel consumption by up to 25% and purges indoor cooking VOCs.',
      isCompleted: false,
    },
    {
      dayNumber: 6,
      title: 'Water Aerator & Wet-Mopping Day',
      description: 'Inspect faucets for leaks, collect RO reject brine water, and replace dry broom sweeping with damp mopping.',
      category: 'water' as SustainabilityCategory,
      practicalAction: 'Use collected water for wet-mopping (pocha) with microfiber cloths.',
      estimatedTimeMinutes: 15,
      expectedBenefit: 'Conserves 20–30 liters of municipal water and cuts indoor suspended dust by 60%.',
      isCompleted: false,
    },
    {
      dayNumber: 7,
      title: 'Household Sustainability Review & Society Sharing',
      description: 'Review your 7-day impact metrics and share one practical tip with a neighbor or family member.',
      category: 'environment' as SustainabilityCategory,
      practicalAction: 'Check your ClearAir Sustainability Score and identify 2 persistent daily habits to retain.',
      estimatedTimeMinutes: 10,
      expectedBenefit: 'Consolidates long-term sustainable lifestyle habits and strengthens community resilience.',
      isCompleted: false,
    },
  ],
  badgeName: 'Green Habit Champion',
  badgeDescription: 'Successfully finished the 7-Day ClearAir Sustainable Living Challenge',
  badgeIcon: 'Award',
  isDefault: true,
};

export const seedDefaultChallenge = async (): Promise<IGreenChallenge> => {
  let challenge = await GreenChallenge.findOne({ isDefault: true });
  if (!challenge) {
    challenge = await GreenChallenge.create(DEFAULT_7_DAY_CHALLENGE);
  }
  return challenge;
};

export const getOrCreateUserChallengeProgress = async (
  userId: string | mongoose.Types.ObjectId
): Promise<IChallengeProgress> => {
  const challenge = await seedDefaultChallenge();

  let progress = await ChallengeProgress.findOne({
    userId,
    status: 'active',
  });

  if (!progress) {
    progress = await ChallengeProgress.create({
      userId,
      challengeId: challenge._id,
      challengeTitle: challenge.title,
      startedAt: new Date(),
      status: 'active',
      daysProgress: challenge.days.map((d) => ({
        dayNumber: d.dayNumber,
        title: d.title,
        description: d.description,
        category: d.category,
        practicalAction: d.practicalAction,
        estimatedTimeMinutes: d.estimatedTimeMinutes,
        expectedBenefit: d.expectedBenefit,
        isCompleted: false,
      })),
      completedDaysCount: 0,
      totalDays: 7,
      badgeAwarded: false,
    });
  }

  return progress;
};

export const updateChallengeDayProgress = async (
  userId: string | mongoose.Types.ObjectId,
  dayNumber: number,
  isCompleted: boolean
): Promise<IChallengeProgress> => {
  const progress = await getOrCreateUserChallengeProgress(userId);

  const targetDay = progress.daysProgress.find((d) => d.dayNumber === dayNumber);
  if (targetDay) {
    targetDay.isCompleted = isCompleted;
    targetDay.completedAt = isCompleted ? new Date() : undefined;
  }

  const completedCount = progress.daysProgress.filter((d) => d.isCompleted).length;
  progress.completedDaysCount = completedCount;

  if (completedCount >= progress.totalDays) {
    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.badgeAwarded = true;
  }

  await progress.save();
  return progress;
};
