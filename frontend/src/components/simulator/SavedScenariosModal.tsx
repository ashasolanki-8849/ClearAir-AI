import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  GitCompare,
  Plus
} from 'lucide-react';
import { 
  SavedScenarioData, 
  SimulationParametersData, 
  ScenarioComparisonItem 
} from '../../types';
import { simulationService } from '../../services/simulationService';

interface SavedScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParameters?: SimulationParametersData;
  onLoadScenario: (scenario: SavedScenarioData) => void;
}

export const SavedScenariosModal: React.FC<SavedScenariosModalProps> = ({
  isOpen,
  onClose,
  currentParameters,
  onLoadScenario,
}) => {
  const [scenarios, setScenarios] = useState<SavedScenarioData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Save new scenario state
  const [isSavingNew, setIsSavingNew] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Compare multiple state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<ScenarioComparisonItem[] | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);

  const fetchSavedScenarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await simulationService.getSavedScenarios();
      if (res.success && res.scenarios) {
        setScenarios(res.scenarios);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load saved scenarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedScenarios();
      setComparisons(null);
      setSelectedIds([]);
      setIsSavingNew(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentParameters) return;

    try {
      setSaving(true);
      const res = await simulationService.saveScenario({
        name,
        description,
        parameters: currentParameters,
        tags: ['custom', 'user-saved'],
      });

      if (res.success) {
        setName('');
        setDescription('');
        setIsSavingNew(false);
        fetchSavedScenarios();
      } else {
        alert(res.error || 'Failed to save scenario');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving scenario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saved scenario?')) return;
    try {
      const res = await simulationService.deleteScenario(id);
      if (res.success) {
        setScenarios((prev) => prev.filter((s) => s._id !== id));
        setSelectedIds((prev) => prev.filter((sId) => sId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSelectForCompare = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id].slice(-4)
    );
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 scenarios to compare.');
      return;
    }
    try {
      setComparing(true);
      const res = await simulationService.compareScenarios(selectedIds);
      if (res.success && res.comparisons) {
        setComparisons(res.comparisons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Saved What-if Scenarios</h3>
              <p className="text-xs text-zinc-400">
                Manage, reload, or compare your saved hypothetical air quality scenarios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSavingNew && currentParameters && (
              <button
                onClick={() => setIsSavingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Current
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Save New Scenario Form */}
          {isSavingNew && (
            <form onSubmit={handleSaveCurrent} className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Save Active Simulation Parameters</span>
                <button
                  type="button"
                  onClick={() => setIsSavingNew(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1">Scenario Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 50% Transit Shift with Balcony Composting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Notes on who is participating or specific goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Scenario'}
                </button>
              </div>
            </form>
          )}

          {/* Comparison Table View (If active) */}
          {comparisons && (
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-emerald-400" />
                  Side-by-Side Scenario Comparison ({comparisons.length} Scenarios)
                </span>
                <button
                  onClick={() => setComparisons(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Close Comparison
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900 uppercase font-semibold text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-3">Metric</th>
                      {comparisons.map((c) => (
                        <th key={c.id} className="py-2.5 px-3 font-bold text-white">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-400">Simulated AQI</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3 font-bold text-emerald-400">
                          {c.simulatedAqi} ({c.aqiChange > 0 ? '+' : ''}{c.aqiChange})
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-400">PM2.5 Reduction</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3 text-white">
                          -{c.pm25ReductionPct}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-400">Tailpipe CO₂e Saved</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3 text-white">
                          {c.tailpipeEmissionsAvoidedKgCO2e} kg/day
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-medium text-zinc-400">Inhaled Dose Avoided</td>
                      {comparisons.map((c) => (
                        <td key={c.id} className="py-2.5 px-3 text-white">
                          {(c.personalInhaledDoseAvoidedGrams * 1000).toFixed(2)} mg PM2.5
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Bar for Comparisons */}
          {selectedIds.length > 0 && !comparisons && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-300">
                <strong className="text-emerald-400">{selectedIds.length}</strong> scenario{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleRunComparison}
                disabled={comparing || selectedIds.length < 2}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-40"
              >
                {comparing ? 'Comparing...' : 'Compare Side-by-Side'}
              </button>
            </div>
          )}

          {/* Saved Scenarios List */}
          {loading ? (
            <div className="py-12 text-center text-zinc-400">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-500 border-t-transparent mb-2" />
              <p className="text-xs">Loading scenario archives...</p>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
              <p className="font-semibold text-zinc-300">No saved simulation scenarios yet</p>
              <p className="mt-1">Adjust sliders on the simulator dashboard and click Save Scenario.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((sc) => {
                const isSelected = selectedIds.includes(sc._id);
                return (
                  <div
                    key={sc._id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500/50'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectForCompare(sc._id)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer rounded mt-0.5"
                        title="Select for comparison"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{sc.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                            {sc.scenarioType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {sc.description && (
                          <p className="text-xs text-zinc-400 mt-0.5">{sc.description}</p>
                        )}
                        <div className="text-[11px] text-zinc-500 mt-1 font-mono flex items-center gap-3">
                          <span>Simulated AQI: <strong className="text-emerald-400">{sc.results.simulatedAqi}</strong></span>
                          <span>PM2.5: <strong className="text-zinc-300">-{sc.results.pm25ReductionPct}%</strong></span>
                          <span>Saved: {new Date(sc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onLoadScenario(sc);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold transition-all border border-zinc-700"
                        title="Load this scenario into simulator"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(sc._id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SavedScenariosModal;
