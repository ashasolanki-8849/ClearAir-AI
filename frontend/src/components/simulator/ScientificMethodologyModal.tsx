import React from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface ScientificMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificMethodologyModal: React.FC<ScientificMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Atmospheric Dispersion & Simulation Methodology</h3>
              <p className="text-xs text-zinc-400">
                Documentation of mathematical models, urban source apportionment, and personal exposure calculations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300 leading-relaxed">
          {/* Section 1: Source Apportionment Ratios */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              1. Urban Source Apportionment Weights
            </h4>
            <p className="text-zinc-400">
              ClearAir AI grounds its simulation coefficients in peer-reviewed comprehensive source-apportionment studies for Indian urban airsheds (TERI, ARAI, and IIT-Kanpur Delhi Air Quality Studies):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono pt-2">
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] font-sans">Transport Sector</span>
                <span className="font-bold text-white">28% PM2.5</span> / 16% PM10
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] font-sans">Road & Construction Dust</span>
                <span className="font-bold text-white">14% PM2.5</span> / 38% PM10
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] font-sans">Biomass & Waste Burning</span>
                <span className="font-bold text-white">18% PM2.5</span> / 12% PM10
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] font-sans">Industrial & Point Sources</span>
                <span className="font-bold text-white">16% PM2.5</span> / 14% PM10
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] pt-1">
              *The remaining ~24% represents regional secondary sulfates, nitrates, and transboundary background air mass.
            </p>
          </div>

          {/* Section 2: Atmospheric Box Model */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              2. Urban Box Dispersion Physics
            </h4>
            <p className="text-zinc-400">
              The ambient concentration C within an urban airshed is evaluated using the steady-state mass balance equation:
            </p>
            <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 font-mono text-emerald-400 text-center">
              C = C_background + Q / (W · u · H_pbl)
            </div>
            <p className="text-zinc-400">
              Where Q is the aggregate emission rate, W is urban crosswind width, u is ambient wind speed, and H_pbl is the planetary boundary layer mixing depth. During cold winter mornings, H_pbl collapses from ~1,500m to under 150m, concentrating ground emissions.
            </p>
          </div>

          {/* Section 3: Personal Inhalation Exposure Dose */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Micro-Environment Personal Pulmonary Dose
            </h4>
            <p className="text-zinc-400">
              Personal particulate inhalation dose is evaluated as:
            </p>
            <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 font-mono text-cyan-400 text-center">
              Inhaled Dose (µg) = ∑ [ C_micro · V_ventilation · t_exposure ]
            </div>
            <p className="text-zinc-400">
              Where V_ventilation is minute breathing volume (0.85 m³/h resting, 1.2 m³/h walking, 2.5 m³/h exercising). Shifting morning outdoor exercise away from morning inversion peaks prevents over 55% of direct commuter pulmonary deposition.
            </p>
          </div>

          {/* Section 4: Boundary Limitations */}
          <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Strict Transparency & Boundary Limitations</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-zinc-300 text-xs">
              <li>Simulation projections reflect potential outcome scenarios and must never be interpreted as real-time continuous station readings.</li>
              <li>Atmospheric dispersion models assume well-mixed urban airsheds; hyper-local street canyon wind eddies may create localized micro-variations.</li>
              <li>Individual or neighborhood community actions mitigate local exposure and tailpipe loading, but transboundary background mass remains governed by regional airshed governance.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Standards: Indian National Ambient Air Quality Standards (NAAQS) & CPCB Air Quality Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ScientificMethodologyModal;
