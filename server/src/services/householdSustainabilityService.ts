import mongoose from 'mongoose';
import {
  HouseholdSustainability,
  IHouseholdSustainability,
  IHouseholdGoal,
} from '../models/HouseholdSustainability.js';

export const getOrCreateHouseholdSustainability = async (
  userId: string | mongoose.Types.ObjectId
): Promise<IHouseholdSustainability> => {
  let record = await HouseholdSustainability.findOne({ userId });
  if (!record) {
    record = await HouseholdSustainability.create({
      userId,
      householdName: 'My Eco-Household',
      memberCount: 3,
      sharedGoals: [
        {
          id: 'goal-1',
          title: 'Achieve 90% Kitchen Waste Segregation',
          category: 'waste',
          targetDescription: 'Ensure green bin is strictly used for organic peels and food scraps without plastic liners.',
          progressPercentage: 80,
          assignedMemberName: 'Family Shared',
          isCompleted: false,
          targetDate: 'End of Month',
        },
        {
          id: 'goal-2',
          title: 'AC 24°C Thermostat Rule in All Bedrooms',
          category: 'energy',
          targetDescription: 'Maintain air conditioner set-points at 24°C with ceiling fans to cut monthly power consumption.',
          progressPercentage: 90,
          assignedMemberName: 'Parents',
          isCompleted: false,
          targetDate: 'Ongoing',
        },
        {
          id: 'goal-3',
          title: 'RO Reject Water Reuse for Wet-Mopping',
          category: 'water',
          targetDescription: 'Collect membrane reject water in the 20L kitchen bucket daily for floor cleaning.',
          progressPercentage: 100,
          assignedMemberName: 'Homemaker',
          isCompleted: true,
          targetDate: 'Achieved',
        },
      ],
      wasteManagement: {
        segregationRatePercentage: 80,
        compostingActive: false,
        eWasteDropOffsCount: 1,
      },
      energySavingProgress: {
        ledPercentage: 85,
        offPeakUsageHabit: true,
        starRatedAppliancesInstalled: true,
      },
      completedHouseholdActionsCount: 7,
    });
  }
  return record;
};

export const addHouseholdGoal = async (
  userId: string | mongoose.Types.ObjectId,
  goal: {
    title: string;
    category?: string;
    targetDescription: string;
    assignedMemberName?: string;
    targetDate?: string;
  }
): Promise<IHouseholdSustainability> => {
  const record = await getOrCreateHouseholdSustainability(userId);
  const newGoal: IHouseholdGoal = {
    id: `goal-${Date.now()}`,
    title: goal.title,
    category: goal.category || 'general',
    targetDescription: goal.targetDescription,
    progressPercentage: 0,
    assignedMemberName: goal.assignedMemberName || 'Family Shared',
    isCompleted: false,
    targetDate: goal.targetDate || 'Next 30 Days',
  };

  record.sharedGoals.push(newGoal);
  await record.save();
  return record;
};

export const updateHouseholdGoal = async (
  userId: string | mongoose.Types.ObjectId,
  goalId: string,
  updates: {
    progressPercentage?: number;
    isCompleted?: boolean;
    assignedMemberName?: string;
  }
): Promise<IHouseholdSustainability> => {
  const record = await getOrCreateHouseholdSustainability(userId);
  const target = record.sharedGoals.find((g) => g.id === goalId);
  if (target) {
    if (typeof updates.progressPercentage === 'number') {
      target.progressPercentage = Math.min(100, Math.max(0, updates.progressPercentage));
      if (target.progressPercentage >= 100) target.isCompleted = true;
    }
    if (typeof updates.isCompleted === 'boolean') {
      target.isCompleted = updates.isCompleted;
      if (updates.isCompleted) target.progressPercentage = 100;
    }
    if (updates.assignedMemberName) {
      target.assignedMemberName = updates.assignedMemberName;
    }
  }

  await record.save();
  return record;
};
