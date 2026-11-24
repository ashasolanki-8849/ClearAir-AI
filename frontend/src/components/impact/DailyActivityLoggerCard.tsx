import React, { useState } from 'react';
import { EnvironmentalActivityData, ActivityCategory } from '../../types';
import {
  ListChecks,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DailyActivityLoggerCardProps {
  activities: EnvironmentalActivityData[];
  onLogActivity: (data: {
    activityName: string;
    category: ActivityCategory;
    date?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }) => Promise<void>;
  onDeleteActivity: (id: string) => Promise<void>;
}

export const DailyActivityLoggerCard: React.FC<DailyActivityLoggerCardProps> = ({
  activities,
  onLogActivity,
  onDeleteActivity,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('transportation');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('km');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered =
    filterCategory === 'all'
      ? activities
      : activities.filter((a) => a.category === filterCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    try {
      setIsSubmitting(true);
      await onLogActivity({
        activityName: activityName.trim(),
        category,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setActivityName('');
      setQuantity('');
      setNotes('');
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Daily Environmental Activity Logger
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {activities.length} Recorded
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Log green transit, energy conservation, waste segregation, and community cleanup participation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 py-1"
            >
              <option value="all">All Categories</option>
              <option value="transportation">Transit</option>
              <option value="energy">Energy</option>
              <option value="waste">Waste</option>
              <option value="water">Water</option>
              <option value="community">Community</option>
              <option value="consumption">Consumption</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Action</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Log Green Lifestyle Action
              </h4>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Action Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Took Metro Rail instead of driving"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                    <option value="transportation">Transportation</option>
                    <option value="energy">Energy Saving</option>
                    <option value="waste">Waste Management</option>
                    <option value="water">Water Conservation</option>
                    <option value="community">Community Action</option>
                    <option value="consumption">Sustainable Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Quantity (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  placeholder="e.g. km, kWh, kg segregated, Liters"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes / Supporting Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Roundtrip between Noida Sector 62 and Rajiv Chowk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Record Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <ListChecks className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No activities logged yet</h4>
          <p className="text-xs text-zinc-500 mt-1">
            Click "+ Log Action" to record public transit trips, composting, or energy saving actions.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {item.activityName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  {item.quantity && (
                    <span>• {item.quantity} {item.unit || ''}</span>
                  )}
                  {item.notes && <span>• {item.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  {item.dataQuality?.status || 'User Entered'}
                </span>

                <button
                  onClick={() => onDeleteActivity(item._id)}
                  className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                  title="Remove activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
