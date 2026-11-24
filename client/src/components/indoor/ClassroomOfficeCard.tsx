import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { School, Building, Users, Wind, CheckCircle2, Shield, Wrench } from 'lucide-react';

export const ClassroomOfficeCard: React.FC = () => {
  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-indigo-500">
            <School className="w-4 h-4" />
            Institutional Air Quality Management
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            Classrooms, Colleges, Offices & High-Occupancy Spaces
          </h3>
        </div>
        <Badge variant="satisfactory">Facility & Manager Guide</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card 1: Schools & Classrooms */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <School className="w-4 h-4 text-indigo-500" />
            <span>Schools, Colleges & Daycare Facilities</span>
          </div>

          <div className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Recess & Morning Assembly Protocol:</strong> When outdoor AQI exceeds 200, cancel outdoor morning assemblies and physical education drills. Move activities to indoor auditoriums with active filtration.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Classroom CO2 & Cognitive Focus:</strong> Classrooms with 30–40 students often reach 2,000+ ppm CO2 within 45 minutes, causing drowsiness and test-score declines. Mandate a 5-minute cross-ventilation window between lecture periods.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Chalk Dust vs. Whiteboard Markers:</strong> Avoid traditional calcium carbonate chalk which emits coarse inhalable dust. Transition to low-odor dry-erase whiteboards or damp chalk sponges.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Pre-Occupancy Wet Cleaning:</strong> Janitorial staff must damp-mop classroom floors 1 hour before students arrive, allowing surfaces to dry and settled dust to be bound.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Commercial Offices & Workspaces */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            <Building className="w-4 h-4 text-indigo-500" />
            <span>Offices, Meeting Rooms & Coworking Hubs</span>
          </div>

          <div className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>HVAC MERV-13 Upgrade:</strong> Facility managers should upgrade central air handling units (AHUs) from coarse MERV-8 to sealed MERV-13 pleated filters to capture sub-micron smog particles.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Conference Room Stagnation:</strong> Enclosed meeting rooms with glass walls accumulate high CO2. Install standalone HEPA units and ensure continuous mechanical fresh air dampers are open at minimum 15 CFM per person.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Fragrance-Free Office Policy:</strong> Restrict automatic aerosol air fresheners and chemical room diffusers in restrooms and common corridors, as they react with indoor ozone to generate secondary aldehydes.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Printer & Photocopier Isolation:</strong> Place high-volume laser printers in separate well-ventilated copy rooms to prevent ozone and carbon black toner particles from entering general desk bays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
