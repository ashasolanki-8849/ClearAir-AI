import React, { useState } from 'react';
import { CommunityData } from '../../types';
import { Search, Building, KeyRound, Globe, Users, ArrowRight } from 'lucide-react';

interface DiscoverCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: CommunityData[];
  onSelectCommunity: (communityId: string) => void;
  onJoinByCode: (code: string) => Promise<void>;
  onOpenCreateModal: () => void;
}

export const DiscoverCommunitiesModal: React.FC<DiscoverCommunitiesModalProps> = ({
  isOpen,
  onClose,
  communities,
  onSelectCommunity,
  onJoinByCode,
  onOpenCreateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isJoiningCode, setIsJoiningCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = communities.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.location.locality.toLowerCase().includes(s) ||
      c.type.toLowerCase().includes(s)
    );
  });

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      setIsJoiningCode(true);
      setCodeMessage(null);
      await onJoinByCode(inviteCode.trim());
      setCodeMessage('Successfully joined community!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setCodeMessage(`Error: ${err.message}`);
    } finally {
      setIsJoiningCode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Discover & Join Communities
            </h3>
            <p className="text-xs text-zinc-500">
              Find your residential society, campus, or local neighborhood group
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Join by Invitation Code Bar */}
        <form
          onSubmit={handleJoinWithCode}
          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
            <input
              type="text"
              placeholder="Enter Invitation Code (e.g. CLR-8A3F2)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none w-full sm:w-64 font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={isJoiningCode}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold transition-all shadow-sm shrink-0"
          >
            {isJoiningCode ? 'Joining...' : 'Join with Code'}
          </button>
        </form>

        {codeMessage && (
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-center text-zinc-700 dark:text-zinc-300">
            {codeMessage}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search communities by name, sector, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Communities Grid */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 italic">
              No matching communities found.
            </div>
          ) : (
            filtered.map((comm) => (
              <div
                key={comm._id}
                onClick={() => {
                  onSelectCommunity(comm._id);
                  onClose();
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {comm.name}
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    {comm.location.locality}, {comm.location.city} •{' '}
                    <span className="capitalize">{comm.type.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 font-medium">
                    {comm.membersCount} members
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Create Link */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
          <span className="text-zinc-500">Don't see your society or campus?</span>
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            + Create New Community
          </button>
        </div>
      </div>
    </div>
  );
};
