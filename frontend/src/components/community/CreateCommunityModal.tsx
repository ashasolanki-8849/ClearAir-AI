import React, { useState } from 'react';
import { CommunityType, CommunityPrivacy } from '../../types';
import { Building, X, MapPin, Shield, Check } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity: string;
  defaultCoords: { lat: number; lon: number };
  onCreate: (data: {
    name: string;
    type: CommunityType;
    description: string;
    location: {
      city: string;
      locality: string;
      coordinates: { lat: number; lon: number };
      address?: string;
    };
    privacy: CommunityPrivacy;
    objectives?: string[];
  }) => Promise<void>;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  defaultCity,
  defaultCoords,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CommunityType>('residential_society');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [privacy, setPrivacy] = useState<CommunityPrivacy>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !locality.trim()) {
      setError('Please fill in name, locality, and description.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({
        name: name.trim(),
        type,
        description: description.trim(),
        location: {
          city: defaultCity,
          locality: locality.trim(),
          coordinates: defaultCoords,
          address: address.trim() || undefined,
        },
        privacy,
        objectives: [
          'Monitor hyper-local winter smog & aerosol levels',
          'Coordinate door-to-door zero garbage burning enforcement',
          'Deploy collective wet-mopping and staff respiratory protection',
        ],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Create New Community Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Community Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Silver Crest Apartment Society RWA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Community Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CommunityType)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="residential_society">Residential Society / RWA</option>
                <option value="school">School</option>
                <option value="college">College / University</option>
                <option value="workplace">Workplace / Office</option>
                <option value="neighborhood">Neighborhood Group</option>
                <option value="environmental_group">Environmental Group</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as CommunityPrivacy)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="public">Public (Open to all)</option>
                <option value="private">Private (Admin approval)</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Locality / Sector *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 62"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                City
              </label>
              <input
                type="text"
                disabled
                value={defaultCity}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Description & Collective Goal *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe your residential community, school, or campus clean air initiative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
