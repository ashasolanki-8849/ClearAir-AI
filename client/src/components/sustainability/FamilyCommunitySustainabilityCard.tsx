import React, { useState } from 'react';
import { HouseholdSustainabilityData } from '../../types';
import { Users, Home, Target, CheckCircle2, Plus, Sparkles, Building2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FamilyCommunitySustainabilityCardProps {
  household: HouseholdSustainabilityData;
  onAddGoal?: (goal: { title: string; category: string; targetDescription: string }) => void;
  onToggleGoal?: (goalId: string, isCompleted: boolean) => void;
}

export const FamilyCommunitySustainabilityCard: React.FC<FamilyCommunitySustainabilityCardProps> = ({
  household,
  onAddGoal,
  onToggleGoal,
}) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim() || !newGoalDesc.trim()) return;
    if (onAddGoal) {
      onAddGoal({
        title: newGoalTitle.trim(),
        category: 'household',
        targetDescription: newGoalDesc.trim(),
      });
      setNewGoalTitle('');
      setNewGoalDesc('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Family & Community Sustainability
              </h3>
              <Badge variant="outline">{household.memberCount} Members Active</Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Household shared targets, collective waste metrics, and society-level eco initiatives
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Family Goal</span>
        </button>
      </div>

      {/* Household Habits Overview Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Domestic Waste Segregation</span>
          <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {household.wasteManagement.segregationRatePercentage}%
          </div>
          <p className="text-[11px] text-zinc-500">
            Green bin organic waste compliance across kitchen and dining areas.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">LED Lighting Adoption</span>
          <div className="text-xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
            {household.energySavingProgress.ledPercentage}%
          </div>
          <p className="text-[11px] text-zinc-500">
            Household fixtures converted to energy-efficient LED luminaires.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Household Actions Done</span>
          <div className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
            {household.completedHouseholdActionsCount} Milestones
          </div>
          <p className="text-[11px] text-zinc-500">
            Joint milestones completed collectively by family members.
          </p>
        </div>
      </div>

      {/* Add Goal Modal / Inline Input */}
      {showAddModal && (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-3 text-xs animate-in fade-in duration-150">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Create New Household Goal</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Goal Title (e.g., Plastic-Free Groceries for 1 Month)"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2"
            />
            <input
              type="text"
              placeholder="Target Action (e.g., Bring 3 cloth totes on every vegetable market run)"
              value={newGoalDesc}
              onChange={(e) => setNewGoalDesc(e.target.value)}
              className="text-xs bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGoal}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}

      {/* Shared Household Goals List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          <span>Active Household Goals</span>
        </h4>

        <div className="space-y-2">
          {household.sharedGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{goal.title}</span>
                  {goal.isCompleted ? (
                    <Badge variant="good">Achieved</Badge>
                  ) : (
                    <Badge variant="outline">{goal.assignedMemberName || 'Family'}</Badge>
                  )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">{goal.targetDescription}</p>
              </div>

              {/* Progress Bar & Toggle */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="w-24 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-zinc-500 text-[11px] w-8 text-right">
                  {goal.progressPercentage}%
                </span>
                {onToggleGoal && (
                  <button
                    onClick={() => onToggleGoal(goal.id, !goal.isCompleted)}
                    className="p-1 rounded-md text-zinc-400 hover:text-emerald-500"
                    title="Mark status"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${goal.isCompleted ? 'text-emerald-500 fill-emerald-500/20' : ''}`}
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apartment Society & Community Initiatives (Prep for Module 8) */}
      {household.apartmentSocietyInitiatives && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Apartment Society & Community Initiatives</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {household.apartmentSocietyInitiatives.map((init, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{init.title}</span>
                  <Badge variant="satisfactory">{init.status}</Badge>
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">{init.description}</p>
                <div className="text-[10px] text-zinc-400 font-semibold pt-0.5">
                  Organized by: {init.organizer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
