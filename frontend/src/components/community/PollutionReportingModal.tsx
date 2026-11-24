import React, { useState } from 'react';
import { PollutionCategory, ReportSeverity } from '../../types';
import {
  AlertTriangle,
  X,
  Upload,
  MapPin,
  Flame,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface PollutionReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
  defaultCity: string;
  defaultCoords: { lat: number; lon: number };
  onSubmitReport: (data: {
    communityId?: string;
    category: PollutionCategory;
    title: string;
    description: string;
    location: {
      name: string;
      city: string;
      locality?: string;
      coordinates: { lat: number; lon: number };
    };
    imageUrl?: string;
    severity?: ReportSeverity;
    isAnonymous?: boolean;
  }) => Promise<void>;
}

export const PollutionReportingModal: React.FC<PollutionReportingModalProps> = ({
  isOpen,
  onClose,
  communityId,
  defaultCity,
  defaultCoords,
  onSubmitReport,
}) => {
  const [category, setCategory] = useState<PollutionCategory>('garbage_burning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locality, setLocality] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setError('Please provide a title, description, and location name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmitReport({
        communityId,
        category,
        title: title.trim(),
        description: description.trim(),
        location: {
          name: locationName.trim(),
          city: defaultCity,
          locality: locality.trim() || undefined,
          coordinates: defaultCoords,
        },
        imageUrl: imageUrl.trim() || undefined,
        severity,
        isAnonymous,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Report Local Pollution Incident
              </h3>
              <p className="text-xs text-zinc-500">
                Log violations, open garbage fires, construction dust, or road hazards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Pollution Incident Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PollutionCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="garbage_burning">Garbage / Plastic / Leaf Burning</option>
              <option value="construction_dust">Uncovered Construction / Demolition Dust</option>
              <option value="road_dust">Unpaved Road / Resuspension Dust Plume</option>
              <option value="vehicle_smoke">Excessive Commercial Vehicle Smoke / Idling</option>
              <option value="industrial_emissions">Industrial Stack Smoke / Fugitive Plume</option>
              <option value="open_waste_dumping">Illegal Open Waste Dumping Site</option>
              <option value="excessive_smoke">Dense Smog Spike / Crop Residue</option>
              <option value="waste_management">Broken Municipal Waste Bins</option>
              <option value="other">Other Environmental Issue</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Incident Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Open plastic refuse burning behind society boundary wall"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Detailed Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe what you observed, estimated duration, whether it is ongoing, and any visible hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Location Name & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Spot / Landmark *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 62 Park Gate 3"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Locality / Sector</label>
              <input
                type="text"
                placeholder="e.g. Block C, Sector 62"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Severity & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low (Minor dust / small debris)</option>
                <option value="moderate">Moderate (Noticeable localized smoke)</option>
                <option value="high">High (Heavy smoke / burning)</option>
                <option value="severe">Severe (Hazardous toxic fire / emergency)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="anonymous-toggle"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="anonymous-toggle" className="text-zinc-600 dark:text-zinc-400 select-none">
              Submit anonymously (your name and profile will be masked for privacy)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition-all shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
