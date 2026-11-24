import React, { useState } from 'react';
import { CommunityData, MemberRole } from '../../types';
import {
  Users,
  MapPin,
  Shield,
  Lock,
  Globe,
  KeyRound,
  Check,
  Copy,
  LogOut,
  UserPlus,
  Sparkles,
  Settings,
  Building,
  GraduationCap,
  Briefcase,
  Home,
  TreePine,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CommunityHeaderCardProps {
  community: CommunityData;
  userRole?: MemberRole | null;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onOpenAdmin: () => void;
  onOpenAdvisor: () => void;
}

export const CommunityHeaderCard: React.FC<CommunityHeaderCardProps> = ({
  community,
  userRole,
  isMember,
  onJoin,
  onLeave,
  onOpenAdmin,
  onOpenAdvisor,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(community.invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'residential_society':
        return <Home className="w-5 h-5 text-emerald-500" />;
      case 'school':
      case 'college':
        return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'workplace':
        return <Briefcase className="w-5 h-5 text-purple-500" />;
      case 'environmental_group':
        return <TreePine className="w-5 h-5 text-teal-500" />;
      default:
        return <Building className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'residential_society':
        return 'Residential Society / RWA';
      case 'school':
        return 'School Campus';
      case 'college':
        return 'College / University';
      case 'workplace':
        return 'Workplace / Office Park';
      case 'environmental_group':
        return 'Environmental Citizen Group';
      default:
        return 'Neighborhood Community';
    }
  };

  const canAdmin = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none rounded-bl-full" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-3 max-w-3xl">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              {getTypeIcon(community.type)}
              {getTypeName(community.type)}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Users className="w-3.5 h-3.5" />
              {community.membersCount} {community.membersCount === 1 ? 'member' : 'members'}
            </span>

            {community.privacy === 'public' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-zinc-500" /> Public Community
              </span>
            )}
            {community.privacy === 'private' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Private (Approval Required)
              </span>
            )}
            {community.privacy === 'invite_only' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">
                <KeyRound className="w-3.5 h-3.5 text-purple-500" /> Invite Only
              </span>
            )}

            {userRole && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                <Shield className="w-3 h-3 text-blue-500" /> Role: {userRole}
              </span>
            )}
          </div>

          {/* Title & Location */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {community.name}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {community.location.locality}, {community.location.city}
              </span>
              {community.location.address && (
                <span className="text-xs text-zinc-600 dark:text-zinc-400">({community.location.address})</span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {community.description}
          </p>

          {/* Invite Code Pill */}
          <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500">Invite Code:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {community.invitationCode}
            </span>
            <button
              onClick={handleCopyInvite}
              title="Copy invite code"
              className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-start lg:self-center">
          {/* Smart AI Co-pilot trigger */}
          <button
            onClick={onOpenAdvisor}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Ask Community AI</span>
          </button>

          {/* Admin Panel button if owner/admin */}
          {canAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Community Admin</span>
            </button>
          )}

          {/* Join / Leave Button */}
          {!isMember ? (
            <button
              onClick={onJoin}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join Community</span>
            </button>
          ) : (
            userRole !== 'owner' && (
              <button
                onClick={onLeave}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
