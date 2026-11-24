import { SustainableRecommendation, ISustainableRecommendation } from '../models/SustainableRecommendation.js';
import { BudgetPreference } from '../models/UserSustainabilityProfile.js';
import { seedDefaultRecommendations } from './sustainabilityRecommendationService.js';

export interface BudgetAlternativeItem {
  id: string;
  category: string;
  costCategory: BudgetPreference;
  costCategoryLabel: string;
  currentHabit: string;
  suggestedReplacement: string;
  implementationDifficulty: 'easy' | 'moderate' | 'advanced';
  expectedPracticalBenefit: string;
  maintenanceRequirements: string;
  environmentalConsiderations: string;
  estimatedSavings: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  } | null;
  implementationSteps: string[];
  limitations: string[];
  citation: string;
}

export const getBudgetAlternatives = async (
  budget?: BudgetPreference
): Promise<BudgetAlternativeItem[]> => {
  await seedDefaultRecommendations();

  const query: any = { isActive: true };
  if (budget && budget !== 'all') {
    query.costCategory = budget;
  }

  const recs: any[] = await SustainableRecommendation.find(query).lean();

  const budgetLabels: Record<string, string> = {
    free: 'Zero-Cost Habit Change',
    low_cost: 'Low-Cost Everyday Alternative (< ₹500)',
    medium_budget: 'Medium Investment (₹500 – ₹5,000)',
    high_investment: 'Long-Term Infrastructure Investment (> ₹5,000)',
    all: 'All Budget Tiers',
  };

  return recs.map((r) => ({
    id: (r as any)._id.toString(),
    category: r.category,
    costCategory: r.costCategory,
    costCategoryLabel: budgetLabels[r.costCategory] || 'Standard Alternative',
    currentHabit: r.currentHabit,
    suggestedReplacement: r.recommendedAlternative,
    implementationDifficulty: r.implementationDifficulty,
    expectedPracticalBenefit: r.personalBenefit,
    maintenanceRequirements: r.maintenanceRequirements,
    environmentalConsiderations: r.environmentalBenefit,
    estimatedSavings: r.estimatedSavings?.amount ? r.estimatedSavings : null,
    implementationSteps: r.implementationSteps,
    limitations: r.limitations,
    citation: r.dataSource.name,
  }));
};
