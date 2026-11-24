import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    period: string;
    activity: string;
    recommendedTime: string;
    indoorOutdoor: string;
  }) => Promise<void>;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [period, setPeriod] = useState('afternoon');
  const [activity, setActivity] = useState('');
  const [time, setTime] = useState('14:00');
  const [indoorOutdoor, setIndoorOutdoor] = useState('indoor');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        period,
        activity: activity.trim(),
        recommendedTime: time,
        indoorOutdoor,
      });
      setActivity('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Schedule Entry"
      description="Insert a personalized routine activity into today's timeline."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
            Time Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
          >
            <option value="early_morning">Early Morning (06:00 - 08:00)</option>
            <option value="morning">Morning (08:30 - 11:30)</option>
            <option value="afternoon">Afternoon (12:00 - 16:00)</option>
            <option value="evening">Evening (17:30 - 20:30)</option>
            <option value="night">Night (21:00 - 23:00)</option>
          </select>
        </div>

        <Input
          label="Activity Name"
          placeholder="e.g. Grocery shopping / Gym session"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Scheduled Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Exposure Environment
            </label>
            <select
              value={indoorOutdoor}
              onChange={(e) => setIndoorOutdoor(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
            >
              <option value="indoor">Indoor (Sealed)</option>
              <option value="outdoor">Outdoor</option>
              <option value="transit">Transit / Commuting</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={loading}>
            Add to Timeline
          </Button>
        </div>
      </form>
    </Modal>
  );
};
