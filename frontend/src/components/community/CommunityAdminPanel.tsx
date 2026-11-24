import React, { useState, useEffect } from 'react';
import { MemberRole, CommunityNotificationData } from '../../types';
import {
  Settings,
  Shield,
  Users,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Send,
  Lock,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CommunityAdminPanelProps {
  communityId: string;
  communityName: string;
  members: Array<{ memberId: string; userId: string; name: string; role: MemberRole; joinedAt: string }>;
  notifications: CommunityNotificationData[];
  auditLogs: any[];
  onUpdateRole: (userId: string, role: MemberRole) => Promise<void>;
  onRespondRequest: (userId: string, action: 'approve' | 'reject') => Promise<void>;
  onCreateAnnouncement: (data: { title: string; message: string; severity?: 'info' | 'warning' | 'critical' }) => Promise<void>;
  onClose: () => void;
}

export const CommunityAdminPanel: React.FC<CommunityAdminPanelProps> = ({
  communityId,
  communityName,
  members,
  notifications,
  auditLogs,
  onUpdateRole,
  onRespondRequest,
  onCreateAnnouncement,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'announcements' | 'audit'>('members');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [isSendingAnn, setIsSendingAnn] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      setIsSendingAnn(true);
      await onCreateAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        severity: annSeverity,
      });
      setAnnTitle('');
      setAnnMessage('');
    } finally {
      setIsSendingAnn(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Community Administration & Governance
            </h3>
            <p className="text-xs text-zinc-500">
              Manage member roles, publish verified circulars, and review audit history
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'members'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'announcements'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Broadcasts
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab 1: Member Roles Management */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Active Community Roster
          </h4>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.memberId}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{m.name}</div>
                  <div className="text-[11px] text-zinc-500">
                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    disabled={m.role === 'owner'}
                    onChange={(e) => onUpdateRole(m.userId, e.target.value as MemberRole)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="owner" disabled>
                      Owner
                    </option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Announcements & Broadcasts */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <form onSubmit={handleSendAnnouncement} className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Issue Official Community Notice / Smog Alert
            </h4>

            <div>
              <input
                type="text"
                required
                placeholder="Notice headline (e.g. Wet sweeping mandatory today; No leaves burning allowed)"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <textarea
                required
                rows={3}
                placeholder="Detailed instructions for residents, students, or employees..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <select
                value={annSeverity}
                onChange={(e) => setAnnSeverity(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
              >
                <option value="info">Info / Routine Advisory</option>
                <option value="warning">Warning / Elevated Smoke</option>
                <option value="critical">Critical / Emergency Smog Alert</option>
              </select>

              <button
                type="submit"
                disabled={isSendingAnn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingAnn ? 'Publishing...' : 'Publish Announcement'}</span>
              </button>
            </div>
          </form>

          {/* Past Announcements */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Recent Broadcast Feed
            </h4>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{n.title}</span>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400">
                      {n.severity}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Governance Audit Trail
          </h4>
          {auditLogs.length === 0 ? (
            <div className="text-xs text-zinc-500 italic py-4">No logged admin actions yet.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {log.actorName}
                    </span>{' '}
                    <span className="text-zinc-500">performed</span>{' '}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
