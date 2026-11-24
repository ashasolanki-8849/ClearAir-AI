import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  Search,
  Filter
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { EmissionFactor } from '../../types';

interface DataSourcesMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesMethodologyModal: React.FC<DataSourcesMethodologyModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const fetchFactors = async () => {
        try {
          setLoading(true);
          const res = await impactService.getEmissionFactors();
          if (res.success && res.data) {
            setFactors(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchFactors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFactors = factors.filter(f => {
    const matchesCat = filterCategory === 'all' || f.category === filterCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (f.code ? f.code.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    return matchesCat && matchesSearch;
  });

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
              <h3 className="text-lg font-bold text-white">Emission Factors & Calculation Methodology</h3>
              <p className="text-xs text-zinc-400">
                Transparent registry of verified government, academic, and multilateral emission coefficients.
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

        {/* Filters Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search factors or authorities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'electricity', 'transport', 'household_fuel', 'waste', 'water'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Factors */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-16 text-center text-zinc-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-2" />
              <p className="text-xs">Loading coefficient ledger...</p>
            </div>
          ) : filteredFactors.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No matching emission factors found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 uppercase font-semibold text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Item / Activity</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Factor Value</th>
                    <th className="py-3 px-3">Unit</th>
                    <th className="py-3 px-3">Authority / Source</th>
                    <th className="py-3 px-3 text-right">Data Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredFactors.map((f) => (
                    <tr key={f._id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 font-sans font-medium text-white">
                        {f.name}
                        {f.description && (
                          <div className="text-[10px] text-zinc-500 font-normal">{f.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 capitalize font-sans text-zinc-400">
                        {f.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {f.factorValue}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {f.unit}
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-300">
                        {f.source}
                        {f.year && <span className="text-zinc-500 text-[10px] ml-1">({f.year})</span>}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {f.dataQuality}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 flex items-center justify-between">
          <span>Standards Compliance: GHG Protocol Corporate Standard & IPCC Guidelines for National Greenhouse Gas Inventories.</span>
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
