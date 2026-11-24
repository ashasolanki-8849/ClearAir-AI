import React from 'react';
import { CommunityLeaderboardEntryData, CommunityImpactData } from '../../types';
import {
  Trophy,
  Award,
  Medal,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CommunityChallengesLeaderboardProps {
  leaderboard: CommunityLeaderboardEntryData[];
  impact?: CommunityImpactData;
}

export const CommunityChallengesLeaderboard: React.FC<CommunityChallengesLeaderboardProps> = ({
  leaderboard,
  impact,
}) => {
  const getRankBadge = (index: number) => {
    if (index === 0)
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md">
          1
        </div>
      );
    if (index === 1)
      return (
        <div className="w-7 h-7 rounded-full bg-zinc-300 dark:bg-zinc-600 text-zinc-950 dark:text-zinc-100 flex items-center justify-center font-black text-xs shadow-md">
          2
        </div>
      );
    if (index === 2)
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center font-black text-xs shadow-md">
          3
        </div>
      );
    return (
      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-semibold text-xs">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Community Action Leaderboard
            </h3>
            <p className="text-xs text-zinc-500">
              Verified physical contributions: clean drives, reports resolved, and active participation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-semibold self-start sm:self-auto">
          Transparent Logged Activities
        </span>
      </div>

      {/* Aggregate Physical Impact Bar if available */}
      {impact && impact.recordedImpact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
          <div>
            <div className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {impact.recordedImpact.wasteSegregatedKg} kg
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Waste Segregated</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-teal-600 dark:text-teal-400">
              {impact.recordedImpact.treesPlanted}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Trees Planted</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {impact.recordedImpact.totalAttendees}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Event Attendees</div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-extrabold text-purple-600 dark:text-purple-400">
              {impact.recordedImpact.resolvedPollutionHotspots}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Hotspots Resolved</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <Award className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            No activity points logged yet
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Be the first to RSVP for an event, submit a ground pollution report, or start a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((user, idx) => (
            <div
              key={user.userId}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 text-xs"
            >
              <div className="flex items-center gap-3">
                {getRankBadge(idx)}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {user.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-zinc-600 dark:text-zinc-400">
                      ({user.role})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                    <span>{user.eventsAttendedCount} Events</span>
                    <span>•</span>
                    <span>{user.reportsSubmittedCount} Reports</span>
                    <span>•</span>
                    <span>{user.discussionPostsCount} Posts</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {user.totalActivityScore} pts
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  {user.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transparency Guarantee */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
        <Info className="w-4 h-4 text-zinc-400 shrink-0" />
        <span>
          Leaderboard strictly credits verified physical actions and attendance. ClearAir AI never fabricates ambient AQI displacement claims or hypothetical emissions math.
        </span>
      </div>
    </div>
  );
};
