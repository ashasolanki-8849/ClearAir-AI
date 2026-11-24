import mongoose from 'mongoose';
import EnvironmentalGoal, {
  IEnvironmentalGoal,
  GoalCategory,
  GoalStatus,
} from '../models/EnvironmentalGoal.js';

export const createGoal = async (
  userId: string,
  input: {
    title: string;
    category: GoalCategory;
    targetValue: number;
    unit: string;
    startDate: Date | string;
    endDate: Date | string;
    trackingFrequency?: 'daily' | 'weekly' | 'monthly';
    remindersEnabled?: boolean;
    notes?: string;
    householdId?: string;
  }
): Promise<IEnvironmentalGoal> => {
  const goal = new EnvironmentalGoal({
    userId: new mongoose.Types.ObjectId(userId),
    householdId: input.householdId ? new mongoose.Types.ObjectId(input.householdId) : undefined,
    title: input.title,
    category: input.category,
    targetValue: input.targetValue,
    currentValue: 0,
    unit: input.unit,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    status: 'active',
    trackingFrequency: input.trackingFrequency || 'weekly',
    remindersEnabled: input.remindersEnabled ?? true,
    notes: input.notes || '',
  });

  return goal.save();
};

export const getGoals = async (userId: string, status?: string) => {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) };
  if (status && status !== 'all') {
    query.status = status;
  }
  return EnvironmentalGoal.find(query).sort({ createdAt: -1 }).lean();
};

export const updateGoalProgress = async (
  goalId: string,
  incrementValue: number
): Promise<IEnvironmentalGoal> => {
  const goal = await EnvironmentalGoal.findById(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }

  goal.currentValue += incrementValue;
  if (goal.currentValue >= goal.targetValue) {
    goal.status = 'completed';
  }
  await goal.save();
  return goal;
};

export const updateGoalStatus = async (
  goalId: string,
  status: GoalStatus
): Promise<IEnvironmentalGoal> => {
  const goal = await EnvironmentalGoal.findById(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }
  goal.status = status;
  await goal.save();
  return goal;
};

export const deleteGoal = async (goalId: string, userId: string) => {
  const result = await EnvironmentalGoal.deleteOne({
    _id: new mongoose.Types.ObjectId(goalId),
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (result.deletedCount === 0) {
    throw new Error('Goal not found or unauthorized');
  }
  return { success: true, message: 'Goal removed' };
};
