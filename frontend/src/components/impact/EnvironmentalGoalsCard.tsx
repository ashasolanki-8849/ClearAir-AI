import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Pause, 
  X, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  Car, 
  Zap, 
  Trash2, 
  Droplet,
  Heart,
  ChevronRight
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { EnvironmentalGoal } from '../../types';

interface EnvironmentalGoalsCardProps {
  onGoalUpdated?: () => void;
}

export const EnvironmentalGoalsCard: React.FC<EnvironmentalGoalsCardProps> = ({ onGoalUpdated }) => {
  const [goals, setGoals] = useState<EnvironmentalGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // New goal form state
  const [category, setCategory] = useState<string>('transport');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetReductionKgCo2e, setTargetReductionKgCo2e] = useState<string>('20');
  const [targetValue, setTargetValue] = useState<string>('50');
  const [unit, setUnit] = useState<string>('km');
  const [period, setPeriod] = useState<string>('monthly');
  const [targetDate, setTargetDate] = useState<string>('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await impactService.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      } else {
        setError(res.error || 'Failed to fetch environmental goals');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const res = await impactService.createGoal({
        category: category as any,
        title,
        description,
        targetReductionKgCo2e: parseFloat(targetReductionKgCo2e) || 0,
        targetValue: parseFloat(targetValue) || 0,
        unit,
        period: period as any,
        targetDate: targetDate ? new Date(targetDate) : undefined
      });

      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchGoals();
        if (onGoalUpdated) onGoalUpdated();
      } else {
        alert(res.error || 'Failed to create goal');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (goalId: string, status: string) => {
    try {
      const res = await impactService.updateGoal(goalId, { status: status as any });
      if (res.success) {
        fetchGoals();
        if (onGoalUpdated) onGoalUpdated();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport': return <Car className="w-4 h-4 text-sky-400" />;
      case 'electricity': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-purple-400" />;
      case 'water': return <Droplet className="w-4 h-4 text-cyan-400" />;
      default: return <Target className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Personal Environmental Goals</h3>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Commit to targeted carbon reduction benchmarks and track verified progress over time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" />
          Set New Goal
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-2" />
          <p className="text-xs">Loading active benchmarks...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="py-12 text-center">
          <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-300">No active environmental goals set</p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            Setting clear reduction targets helps quantify your contribution to cleaner winter air.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Create Your First Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {goals.map((g) => {
            const pct = g.targetValue > 0 ? Math.min(100, (g.currentValue / g.targetValue) * 100) : 0;
            const isCompleted = g.status === 'completed' || pct >= 100;

            return (
              <div 
                key={g._id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                        {getCategoryIcon(g.category)}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {g.category} • {g.trackingFrequency || 'monthly'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : g.status === 'paused'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{g.title}</h4>
                  {g.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{g.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Progress</span>
                      <span className="font-mono font-bold text-white">
                        {g.currentValue.toFixed(1)} / {g.targetValue} {g.unit} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {(g.targetReductionKgCo2e ?? 0) > 0 && (
                    <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      Target Carbon Reduction: <strong className="font-mono">{g.targetReductionKgCo2e} kg CO₂e</strong>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {g.endDate ? `Due: ${new Date(g.endDate).toLocaleDateString()}` : 'No deadline'}
                  </span>
                  <div className="flex items-center gap-2">
                    {g.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(g._id, 'completed')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Mark Done
                      </button>
                    )}
                    {g.status === 'active' && (
                      <button
                        onClick={() => handleUpdateStatus(g._id, 'paused')}
                        className="text-zinc-400 hover:text-zinc-300"
                      >
                        Pause
                      </button>
                    )}
                    {g.status === 'paused' && (
                      <button
                        onClick={() => handleUpdateStatus(g._id, 'active')}
                        className="text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Set Environmental Goal</h3>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switch 3 commute days to Delhi Metro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value === 'transport') setUnit('km');
                      else if (e.target.value === 'electricity') setUnit('kWh');
                      else if (e.target.value === 'waste') setUnit('kg');
                      else if (e.target.value === 'water') setUnit('L');
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="transport">Transport</option>
                    <option value="electricity">Electricity</option>
                    <option value="waste">Waste</option>
                    <option value="water">Water</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Time Horizon</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Reduction (kg CO₂e)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={targetReductionKgCo2e}
                  onChange={(e) => setTargetReductionKgCo2e(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Confirm Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
