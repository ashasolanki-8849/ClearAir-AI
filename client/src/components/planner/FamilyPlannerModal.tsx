import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { FamilyProfileData, FamilyGuidanceItem } from '../../types';
import { plannerService } from '../../services/plannerService';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Trash2, Shield, HeartPulse, UserCheck, AlertTriangle } from 'lucide-react';

interface FamilyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: { lat: number; lon: number; name: string };
  language?: string;
}

export const FamilyPlannerModal: React.FC<FamilyPlannerModalProps> = ({
  isOpen,
  onClose,
  location,
  language = 'en',
}) => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<FamilyProfileData[]>([]);
  const [guidance, setGuidance] = useState<FamilyGuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [category, setCategory] = useState<'children' | 'adults' | 'elderly'>('children');
  const [relationship, setRelationship] = useState('child');
  const [healthNotes, setHealthNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, guidanceRes] = await Promise.all([
        plannerService.getFamilyProfiles(),
        plannerService.getFamilyRecommendations(location, language),
      ]);
      if (membersRes.success) setMembers(membersRes.members);
      if (guidanceRes.success) setGuidance(guidanceRes.guidance);
    } catch (e: any) {
      showToast(e.message || 'Could not load family data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, location, language]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) return;

    setAdding(true);
    try {
      const res = await plannerService.createFamilyProfile({
        name: name.trim(),
        age: Number(age),
        category,
        relationship,
        healthNotes,
      });

      if (res.success && res.member) {
        setMembers((prev) => [res.member, ...prev]);
        setName('');
        setAge('');
        setHealthNotes('');
        setShowAddForm(false);
        showToast('Family member added to daily planner.', 'success');
        loadData();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to add family member', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await plannerService.deleteFamilyProfile(id);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      setGuidance((prev) => prev.filter((g) => g.memberId !== id));
      showToast('Member removed from family planner.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Could not remove member', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Family Daily Smog Planning"
      description="Protect individual household members with personalized precautions adapted for children, adults, and elderly citizens."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Top Action */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Household Members ({members.length})
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? 'Cancel' : 'Add Household Member'}
          </Button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              New Member Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="e.g. Aarav / Dadi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Age (Years)"
                type="number"
                placeholder="e.g. 7 or 72"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                  Demographic Group
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="children">Children (Under 18)</option>
                  <option value="adults">Adult (18 - 59)</option>
                  <option value="elderly">Elderly (60+)</option>
                </select>
              </div>
              <Input
                label="Health Notes (Optional)"
                placeholder="e.g. Mild asthma, dust allergy"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" type="submit" isLoading={adding}>
                Save Member
              </Button>
            </div>
          </form>
        )}

        {/* Guidance List per Member */}
        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-400">Loading family guidance...</div>
        ) : guidance.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            No family members added yet. Click "+ Add Household Member" to configure tailored guidance for children or elderly family members.
          </div>
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {guidance.map((g) => (
              <div
                key={g.memberId}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {g.name} ({g.age} yrs • {g.category.toUpperCase()})
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteMember(g.memberId)}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs space-y-2">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-black font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                    <strong>Optimal Activity Window:</strong> {g.safeTimeWindow}
                  </div>

                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Individual Recommendations:
                    </span>
                    <ul className="space-y-1">
                      {g.recommendedActions.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {g.precautions.length > 0 && (
                    <div className="pt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{g.precautions.join(' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
