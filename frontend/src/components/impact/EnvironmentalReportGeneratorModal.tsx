import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Table,
  Zap,
  Car,
  Trash2,
  Droplet
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { EnvironmentalReportRecord } from '../../types';

interface EnvironmentalReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentalReportGeneratorModal: React.FC<EnvironmentalReportGeneratorModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [period, setPeriod] = useState<string>('this_month');
  const [generating, setGenerating] = useState<boolean>(false);
  const [report, setReport] = useState<EnvironmentalReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await impactService.generateReport(period, 'json');
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        setError(res.error || 'Failed to generate audit report');
      }
    } catch (err: any) {
      setError(err.message || 'Error compiling environmental audit report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const csvData = await impactService.exportCsv(period);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ClearAir_AI_Environmental_Impact_${period}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Error exporting CSV');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Environmental Impact Audit Report</h3>
              <p className="text-xs text-zinc-400">Generate auditable summary of GHG footprints, avoided criteria pollutants, and activity logs.</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar (Print Hidden) */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-zinc-400 whitespace-nowrap">Audit Period:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
              </select>
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
              >
                {generating ? 'Compiling Audit...' : 'Generate Audit'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export CSV Ledger
              </button>
              {report && (
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  Print / PDF
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Printable Report Document */}
          {!report ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Select a reporting period and click <strong className="text-zinc-300">Generate Audit</strong> to compile your environmental statement.
            </div>
          ) : (
            <div className="space-y-6 print:text-black">
              {/* Document Header */}
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-white print:text-black">
                      CLEARAIR AI • PERSONAL ENVIRONMENTAL STATEMENT
                    </h2>
                    <p className="text-xs text-zinc-400 print:text-zinc-600 mt-1">
                      Audit Reference: {report._id} • Issued: {new Date(report.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:border-black print:text-black">
                      Period: {(report.period || 'current').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 print:border-zinc-300 print:bg-zinc-50">
                  <div className="text-xs text-zinc-400 uppercase font-bold">Total Carbon Footprint</div>
                  <div className="text-2xl font-black text-white print:text-black mt-1 font-mono">
                    {(report.totalCarbonFootprintKg ?? 0).toFixed(2)} <span className="text-xs font-normal">kg CO₂e</span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 print:border-zinc-300 print:bg-zinc-50">
                  <div className="text-xs text-zinc-400 uppercase font-bold">Transport Emissions</div>
                  <div className="text-2xl font-black text-white print:text-black mt-1 font-mono">
                    {(report.breakdownByScope?.scope1TransportKg ?? 0).toFixed(2)} <span className="text-xs font-normal">kg CO₂e</span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 print:border-zinc-300 print:bg-zinc-50">
                  <div className="text-xs text-zinc-400 uppercase font-bold">Electricity Emissions</div>
                  <div className="text-2xl font-black text-white print:text-black mt-1 font-mono">
                    {(report.breakdownByScope?.scope2ElectricityKg ?? 0).toFixed(2)} <span className="text-xs font-normal">kg CO₂e</span>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 print:border-zinc-300 print:bg-zinc-50">
                  <div className="text-xs text-zinc-400 uppercase font-bold">Waste Diverted</div>
                  <div className="text-2xl font-black text-emerald-400 print:text-black mt-1 font-mono">
                    {(report.totalWasteDivertedKg ?? 0).toFixed(2)} <span className="text-xs font-normal">kg</span>
                  </div>
                </div>
              </div>

              {/* Verified Sources & Factors Used */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 text-xs space-y-2 print:border-zinc-300">
                <div className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Calculation Methodology & Authority Factor Citations
                </div>
                <div className="text-zinc-400 leading-relaxed">
                  Emissions calculated using the Central Electricity Authority (CEA) Baseline Database for the Indian Power Sector (v19 grid emission factor: 0.716 kg CO₂e/kWh), IPCC AR6 Global Warming Potentials (GWP-100), and CPCB/DMRC certified commuter transport factors.
                </div>
              </div>

              {/* Key Recommendations in Report */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Auditor Notes & Recommendations</div>
                  <ul className="list-disc pl-5 text-xs text-zinc-300 space-y-1">
                    {report.recommendations.map((rec: string, rIdx: number) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
