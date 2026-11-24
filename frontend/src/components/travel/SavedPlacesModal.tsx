import React, { useState } from 'react';
import { SavedPlaceData, PlaceLabel } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Home, Briefcase, GraduationCap, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: SavedPlaceData[];
  onAddPlace: (place: Partial<SavedPlaceData>) => Promise<void>;
  onDeletePlace: (id: string) => Promise<void>;
  onSelectAsOrigin?: (place: SavedPlaceData) => void;
  onSelectAsDestination?: (place: SavedPlaceData) => void;
}

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  isOpen,
  onClose,
  places,
  onAddPlace,
  onDeletePlace,
  onSelectAsOrigin,
  onSelectAsDestination,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<PlaceLabel>('home');
  const [customName, setCustomName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('28.6139');
  const [lon, setLon] = useState('77.2090');
  const [isDefaultOrigin, setIsDefaultOrigin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddPlace({
        label,
        customName: customName.trim() || undefined,
        address: address.trim(),
        coordinates: {
          lat: parseFloat(lat) || 28.6139,
          lon: parseFloat(lon) || 77.2090,
        },
        isDefaultOrigin,
      });
      setShowAddForm(false);
      setAddress('');
      setCustomName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (lbl: PlaceLabel) => {
    switch (lbl) {
      case 'home':
        return Home;
      case 'office':
        return Briefcase;
      case 'college':
      case 'school':
        return GraduationCap;
      default:
        return MapPin;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saved Places & Locations" maxWidth="lg">
      <div className="space-y-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Save your frequent destinations (Home, Office, University) for 1-click low-emission route comparisons.
        </p>

        {/* List of places */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {places.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No saved places yet. Add your home or office below!
            </div>
          ) : (
            places.map((place) => {
              const Icon = getIcon(place.label);
              return (
                <div
                  key={place._id}
                  className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                        <span className="capitalize">{place.customName || place.label}</span>
                        {place.isDefaultOrigin && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded font-semibold">
                            Default Start
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 line-clamp-1">{place.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onSelectAsOrigin && (
                      <button
                        onClick={() => {
                          onSelectAsOrigin(place);
                          onClose();
                        }}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600"
                      >
                        Set Start
                      </button>
                    )}
                    {onSelectAsDestination && (
                      <button
                        onClick={() => {
                          onSelectAsDestination(place);
                          onClose();
                        }}
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                      >
                        Set Dest
                      </button>
                    )}
                    <button
                      onClick={() => onDeletePlace(place._id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete place"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Place Form */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Add New Place</h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Place Type
                </label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value as PlaceLabel)}
                  className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                >
                  <option value="home">Home</option>
                  <option value="office">Office / Work</option>
                  <option value="college">College / University</option>
                  <option value="school">School</option>
                  <option value="family">Family Residence</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Custom Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Gurugram Branch"
                  className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Full Address / Landmark
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sector 29, Gurugram"
                className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full py-1.5 px-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="defaultOrigin"
                checked={isDefaultOrigin}
                onChange={(e) => setIsDefaultOrigin(e.target.checked)}
                className="accent-emerald-500"
              />
              <label htmlFor="defaultOrigin" className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Set as my default starting location
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              >
                Cancel
              </button>
              <Button type="submit" isLoading={isSubmitting} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg">
                Save Place
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Place</span>
          </button>
        )}
      </div>
    </Modal>
  );
};
