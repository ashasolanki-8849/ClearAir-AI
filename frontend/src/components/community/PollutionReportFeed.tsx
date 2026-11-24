import React, { useState } from 'react';
import { PollutionReportData, ReportStatus } from '../../types';
import {
  AlertTriangle,
  ThumbsUp,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Check,
  Filter,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PollutionReportFeedProps {
  reports: PollutionReportData[];
  onUpvote: (reportId: string) => void;
  onUpdateStatus?: (reportId: string, status: ReportStatus, notes: string) => void;
  canModerate?: boolean;
}

export const PollutionReportFeed: React.FC<PollutionReportFeedProps> = ({
  reports,
  onUpvote,
  onUpdateStatus,
  canModerate,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReportForNotes, setSelectedReportForNotes] = useState<string | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');

  const filtered =
    statusFilter === 'all'
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Submitted</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">Under Review</span>;
      case 'verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">Verified Incident</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">Action In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">Resolved</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">Rejected</span>;
      default:
        return null;
    }
  };

  const getSeverityPill = (sev: string) => {
    switch (sev) {
      case 'severe':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">SEVERE</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">HIGH</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">MODERATE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500 text-white">LOW</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Citizen Pollution Reports & Ground Feed
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {reports.length} Total
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Community-driven documentation, verification status, and municipal escalation logs
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 py-1"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <AlertTriangle className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No reports found</h4>
          <p className="text-xs text-zinc-500 mt-1">
            There are currently no pollution incidents matching this filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <div
              key={report._id}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(report.status)}
                  {getSeverityPill(report.severity)}
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {report.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {report.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{report.location.name}, {report.location.city}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {report.description}
              </p>

              {report.imageUrl && (
                <div className="mt-2">
                  <img
                    src={report.imageUrl}
                    alt="Incident proof"
                    className="max-h-48 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              )}

              {/* Status progression stepper indicator */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">Reported by:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 text-[11px]">
                    {report.reporterName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpvote(report._id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{report.upvotes} Corroborate</span>
                  </button>

                  {/* Moderator Actions */}
                  {canModerate && onUpdateStatus && (
                    <div className="flex items-center gap-1">
                      {report.status === 'submitted' && (
                        <button
                          onClick={() => onUpdateStatus(report._id, 'verified', 'Verified by community moderator')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all"
                        >
                          Verify
                        </button>
                      )}
                      {(report.status === 'submitted' || report.status === 'verified') && (
                        <button
                          onClick={() => onUpdateStatus(report._id, 'in_progress', 'Escalated to local ward marshals')}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all"
                        >
                          In Progress
                        </button>
                      )}
                      {report.status !== 'resolved' && (
                        <button
                          onClick={() => onUpdateStatus(report._id, 'resolved', 'Incident extinguished / doused')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Moderation Notes if present */}
              {report.moderationNotes && (
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300">
                  <b className="font-semibold text-zinc-800 dark:text-zinc-200">Moderator Note:</b> {report.moderationNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
