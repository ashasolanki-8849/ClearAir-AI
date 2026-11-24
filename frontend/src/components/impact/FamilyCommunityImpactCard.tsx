import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  Building, 
  Leaf, 
  ShieldCheck, 
  Info, 
  Flame, 
  Share2, 
  Calendar, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { FamilyFootprintSummary, CommunityImpactSummary } from '../../types';

export const FamilyCommunityImpactCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'family' | 'community'>('family');
  const [familyData, setFamilyData] = useState<FamilyFootprintSummary | null>(null);
  const [communityData, setCommunityData] = useState<CommunityImpactSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fRes, cRes] = await Promise.all([
          impactService.getFamilyFootprint('this_month'),
          impactService.getCommunityImpact(undefined, 'this_month')
        ]);
        if (fRes.success && fRes.data) setFamilyData(fRes.data);
        if (cRes.success && cRes.data) setCommunityData(cRes.data);
      } catch (err) {
        console.error('Error fetching family/community impact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Collective Impact Intelligence</h3>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Household aggregation without double-counting and community air quality action drives.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'family'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Family Household
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'community'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Community & Society
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-2" />
          <p className="text-xs">Aggregating collective environmental metrics...</p>
        </div>
      ) : activeTab === 'family' ? (
        /* Family Household Tab */
        <div className="mt-6 space-y-6">
          {!familyData ? (
            <div className="py-10 text-center text-zinc-500 text-sm">
              No family profile connected. Create or join a family profile in Settings to enable household aggregation.
            </div>
          ) : (
            <>
              {/* Household KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Household Total Footprint</div>
                  <div className="text-2xl font-black text-white mt-1 font-mono">
                    {(familyData.totalHouseholdFootprintKg ?? 0).toFixed(1)} <span className="text-sm font-normal text-zinc-400">kg CO₂e</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">This month across all members</div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Per-Capita Footprint</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    {(familyData.perCapitaFootprintKg ?? 0).toFixed(1)} <span className="text-sm font-normal text-zinc-400">kg/person</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Normalized per individual member</div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Household Members</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {familyData.memberCount || familyData.familyMembersCount || 1} <span className="text-sm font-normal text-zinc-400">Members</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">{familyData.familyName || 'Family Household'}</div>
                </div>
              </div>

              {/* Shared Metering Non-Double-Counting Notice */}
              <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Strict Household Disaggregation Rule:</strong> Shared residential meters (e.g., utility electricity bill, central piped gas, or water meter) are accounted for as a single household pool and divided across members. Individual commute and personal travel are logged separately to prevent double-counting.
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Community Society Tab */
        <div className="mt-6 space-y-6">
          {!communityData ? (
            <div className="py-10 text-center text-zinc-500 text-sm">
              No community data available. Join your local society or ward in the Community Hub (Module 8).
            </div>
          ) : (
            <>
              {/* Community Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Collective Carbon Reduction</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    {(communityData.totalVerifiedReductionKg ?? 0).toFixed(1)} <span className="text-sm font-normal text-zinc-400">kg CO₂e</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Verified community green actions</div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Waste Diverted from Dumpsites</div>
                  <div className="text-2xl font-black text-white mt-1 font-mono">
                    {(communityData.totalWasteDivertedKg ?? 0).toFixed(1)} <span className="text-sm font-normal text-zinc-400">kg</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Composted & recycled organically</div>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Active Green Campaigns</div>
                  <div className="text-2xl font-black text-sky-400 mt-1">
                    {communityData.activeCampaignsCount} <span className="text-sm font-normal text-zinc-400">Drives</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Carpooling, clean air & tree drives</div>
                </div>
              </div>

              {/* Active Campaigns List */}
              {communityData.campaigns && communityData.campaigns.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Featured Neighborhood Campaigns</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {communityData.campaigns.slice(0, 4).map((c: any) => (
                      <div key={c._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-white">{c.title}</h5>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {c.participantsCount} participants • {c.verifiedReductionsKgCo2e.toFixed(1)} kg CO₂e saved
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
