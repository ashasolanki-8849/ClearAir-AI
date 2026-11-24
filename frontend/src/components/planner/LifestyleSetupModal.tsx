import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LifestyleProfileData } from '../../types';

interface LifestyleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: LifestyleProfileData | null;
  onSave: (updated: Partial<LifestyleProfileData>) => Promise<void>;
}

export const LifestyleSetupModal: React.FC<LifestyleSetupModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [userCategory, setUserCategory] = useState(profile?.userCategory || 'professional');
  const [wakeUpTime, setWakeUpTime] = useState(profile?.schedule?.wakeUpTime || '06:30');
  const [sleepTime, setSleepTime] = useState(profile?.schedule?.sleepTime || '22:30');
  const [workStart, setWorkStart] = useState(profile?.schedule?.workOrSchoolStart || '09:00');
  const [workEnd, setWorkEnd] = useState(profile?.schedule?.workOrSchoolEnd || '17:30');
  const [exerciseTime, setExerciseTime] = useState(profile?.schedule?.exerciseTime || '07:00');
  const [transport, setTransport] = useState<string[]>(
    profile?.transportationPreferences || ['public_transport', 'walking']
  );
  const [saving, setSaving] = useState(false);

  const handleToggleTransport = (mode: string) => {
    setTransport((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        userCategory,
        schedule: {
          wakeUpTime,
          sleepTime,
          workOrSchoolStart: workStart,
          workOrSchoolEnd: workEnd,
          exerciseTime,
          mealTimings: profile?.schedule?.mealTimings || {
            breakfast: '08:00',
            lunch: '13:00',
            dinner: '20:30',
          },
          travelTimings: {
            morningCommute: workStart,
            eveningCommute: workEnd,
          },
        },
        transportationPreferences: transport,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Lifestyle & Schedule"
      description="Personalize your daily schedule so ClearAir AI can generate safe, pollution-adapted activity recommendations."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
            User Category
          </label>
          <select
            value={userCategory}
            onChange={(e) => setUserCategory(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
          >
            <option value="student">Student (School / College)</option>
            <option value="professional">Working Professional (Daily Commuter)</option>
            <option value="homemaker">Homemaker</option>
            <option value="elderly">Elderly Person / Senior Citizen</option>
            <option value="outdoor_worker">Outdoor Worker</option>
            <option value="fitness_enthusiast">Fitness Enthusiast</option>
            <option value="family">Family (Parents & Children)</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Input
            label="Wake-up Time"
            type="time"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
          />
          <Input
            label="Sleep Time"
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
          />
          <Input
            label="Exercise Time"
            type="time"
            value={exerciseTime}
            onChange={(e) => setExerciseTime(e.target.value)}
          />
          <Input
            label="Work/School Start"
            type="time"
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
          />
          <Input
            label="Work/School End"
            type="time"
            value={workEnd}
            onChange={(e) => setWorkEnd(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
            Transportation Preferences
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'walking', label: 'Walking' },
              { id: 'bicycle', label: 'Bicycle / Cycling' },
              { id: 'two_wheeler', label: 'Two-Wheeler / Scooter' },
              { id: 'car', label: 'Car (Personal)' },
              { id: 'public_transport', label: 'Public Transport (Metro/Bus)' },
              { id: 'carpooling', label: 'Carpooling' },
            ].map((mode) => (
              <label
                key={mode.id}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  transport.includes(mode.id)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={transport.includes(mode.id)}
                  onChange={() => handleToggleTransport(mode.id)}
                  className="rounded accent-emerald-500"
                />
                <span>{mode.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={saving}>
            Save Lifestyle Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};
