import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PlannerReminderData } from '../../types';
import { plannerService } from '../../services/plannerService';
import { useToast } from '../../context/ToastContext';
import { Bell, Clock, Check } from 'lucide-react';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [reminders, setReminders] = useState<PlannerReminderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReminders();
    }
  }, [isOpen]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await plannerService.getReminders();
      if (res.success && res.reminders) {
        setReminders(res.reminders);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean, time: string) => {
    try {
      const res = await plannerService.toggleReminder(id, !currentEnabled, time);
      if (res.success && res.reminder) {
        setReminders((prev) =>
          prev.map((r) => (r._id === id ? { ...r, enabled: res.reminder.enabled } : r))
        );
        showToast(
          `Reminder ${res.reminder.enabled ? 'activated' : 'deactivated'}.`,
          'info'
        );
      }
    } catch (e: any) {
      showToast(e.message || 'Could not update reminder', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Air Quality Reminders"
      description="Configure timely alerts to check ambient smog conditions before workouts, commutes, and bedtime."
      maxWidth="md"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-xs text-zinc-400">Loading reminders...</div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem._id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell
                      className={`w-4 h-4 ${
                        rem.enabled ? 'text-emerald-500' : 'text-zinc-400'
                      }`}
                    />
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {rem.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Scheduled: {rem.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(rem._id, rem.enabled, rem.time)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    rem.enabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500'
                  }`}
                >
                  {rem.enabled ? 'Active' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
