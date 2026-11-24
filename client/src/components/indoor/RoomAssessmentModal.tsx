import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { QuestionnaireResponsesData, IndoorRoomData, IndoorAssessmentData } from '../../types';
import { indoorService } from '../../services/indoorService';
import { useToast } from '../../context/ToastContext';
import { ClipboardCheck, AlertTriangle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';

interface RoomAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: IndoorRoomData | null;
  onAssessmentCompleted: (assessment: IndoorAssessmentData) => void;
  location?: { lat: number; lon: number; name: string };
  language?: string;
}

export const RoomAssessmentModal: React.FC<RoomAssessmentModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  onAssessmentCompleted,
  location,
  language = 'en',
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [responses, setResponses] = useState<QuestionnaireResponsesData>({
    roomType: selectedRoom?.roomType || 'living_room',
    windowCount: selectedRoom?.ventilation.windowCount || 1,
    ventilationAvailability: selectedRoom?.ventilation.ventilationType === 'poor' ? 'limited' : 'adequate',
    airPurifierStatus: selectedRoom?.ventilation.hasAirPurifier ? 'present_running' : 'none',
    cookingActivities: selectedRoom?.roomType === 'kitchen' ? 'heavy_frying_tadka' : 'none',
    indoorSmoking: selectedRoom?.hasSmokingExposure || false,
    incenseOrCandles: selectedRoom?.hasIncenseCandles ? 'daily_puja' : 'occasional',
    dustAccumulation: 'moderate',
    petsInRoom: selectedRoom?.hasPets || false,
    cleaningHabits: 'wet_mopping',
    dampnessOrMold: 'none',
    combustionAppliances: 'lpg_cylinder',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await indoorService.createAssessment({
        roomId: selectedRoom?._id,
        responses,
        language,
        location,
      });

      if (res.success && res.assessment) {
        showToast('Indoor air assessment completed successfully.', 'success');
        onAssessmentCompleted(res.assessment);
        onClose();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to complete assessment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Room Air Assessment: ${selectedRoom?.roomName || 'Living Space'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-zinc-700 dark:text-zinc-300">
        {/* Notice of Estimation */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Important Scientific Notice:</strong> This questionnaire identifies potential indoor pollution sources based on architectural and lifestyle factors. It is an empirical vulnerability assessment and is <strong>not a measured indoor AQI reading</strong>.
          </p>
        </div>

        {/* Question 1: Windows & Ventilation */}
        <div className="space-y-2">
          <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
            1. Natural Ventilation & Window Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'No Windows (Enclosed)' },
              { id: 'limited', label: '1 Small Window' },
              { id: 'adequate', label: '1–2 Standard Windows' },
              { id: 'cross_ventilation', label: 'Cross-Ventilation (Dual)' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setResponses((prev) => ({ ...prev, ventilationAvailability: opt.id as any }))}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  responses.ventilationAvailability === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Air Purifier */}
        <div className="space-y-2">
          <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
            2. Air Purifier in this Room
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'No Purifier' },
              { id: 'present_running', label: 'Present & Running Daily' },
              { id: 'present_idle', label: 'Present but Rarely Used' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setResponses((prev) => ({ ...prev, airPurifierStatus: opt.id as any }))}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  responses.airPurifierStatus === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Cooking Plumes & Stove */}
        <div className="space-y-2">
          <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
            3. Cooking Plumes & High-Heat Frying (in or adjacent to room)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'No Cooking' },
              { id: 'light_boiling', label: 'Light Boiling / Steaming' },
              { id: 'heavy_frying_tadka', label: 'Daily Tadka / Deep Frying' },
              { id: 'wood_kerosene', label: 'Biomass / Kerosene' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setResponses((prev) => ({ ...prev, cookingActivities: opt.id as any }))}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  responses.cookingActivities === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 4: Incense, Dhoop, Candles & Smoking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
              4. Incense (Agarbatti) or Dhoop Usage
            </label>
            <select
              value={responses.incenseOrCandles}
              onChange={(e) => setResponses((prev) => ({ ...prev, incenseOrCandles: e.target.value as any }))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="never">Never burn incense</option>
              <option value="occasional">Occasional / Festivals only</option>
              <option value="daily_puja">Daily morning/evening Puja (1–2 sticks)</option>
              <option value="heavy">Heavy smoldering dhoop / sambrani</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
              5. Tobacco Smoking Exposure
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResponses((prev) => ({ ...prev, indoorSmoking: false }))}
                className={`flex-1 p-2.5 rounded-lg border text-center ${
                  !responses.indoorSmoking
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                Zero Smoke (100% Smoke-Free)
              </button>
              <button
                type="button"
                onClick={() => setResponses((prev) => ({ ...prev, indoorSmoking: true }))}
                className={`flex-1 p-2.5 rounded-lg border text-center ${
                  responses.indoorSmoking
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                Smoking Occurs (Indoor/Balcony)
              </button>
            </div>
          </div>
        </div>

        {/* Question 5: Dust & Floor Cleaning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
              6. Routine Cleaning Method
            </label>
            <select
              value={responses.cleaningHabits}
              onChange={(e) => setResponses((prev) => ({ ...prev, cleaningHabits: e.target.value as any }))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="wet_mopping">Damp Mopping (Wet Pocha)</option>
              <option value="dry_sweeping">Dry Broom Sweeping (Jhadu)</option>
              <option value="vacuum_hepa">Sealed HEPA Vacuum Cleaner</option>
              <option value="irregular">Irregular / Weekly only</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold block text-zinc-900 dark:text-zinc-100">
              7. Visible Dampness or Mold Spots
            </label>
            <select
              value={responses.dampnessOrMold}
              onChange={(e) => setResponses((prev) => ({ ...prev, dampnessOrMold: e.target.value as any }))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="none">No dampness; completely dry</option>
              <option value="musty_odor">Faint musty odor during humid weather</option>
              <option value="visible_damp_patches">Visible damp paint peeling / seepage</option>
              <option value="visible_black_mold">Visible black mold clusters on walls</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="gap-1.5">
            <ClipboardCheck className="w-4 h-4" />
            <span>{loading ? 'Evaluating Sources...' : 'Generate Room Assessment'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
