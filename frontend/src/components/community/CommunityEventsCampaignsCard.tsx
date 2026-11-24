import React, { useState } from 'react';
import {
  CommunityEventData,
  CommunityCampaignData,
  EventCategory,
  CampaignCategory,
} from '../../types';
import {
  Calendar,
  CheckCircle,
  Users,
  Target,
  Sparkles,
  Plus,
  TreePine,
  Trash2,
  BookOpen,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CommunityEventsCampaignsCardProps {
  events: CommunityEventData[];
  campaigns: CommunityCampaignData[];
  onRegisterEvent: (eventId: string) => void;
  onCancelEvent: (eventId: string) => void;
  onCreateEventModal: () => void;
  onCreateCampaignModal: () => void;
  onLogCampaignProgress?: (campaignId: string, increment: number) => void;
  canOrganize?: boolean;
}

export const CommunityEventsCampaignsCard: React.FC<CommunityEventsCampaignsCardProps> = ({
  events,
  campaigns,
  onRegisterEvent,
  onCancelEvent,
  onCreateEventModal,
  onCreateCampaignModal,
  onLogCampaignProgress,
  canOrganize,
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'events'>('campaigns');

  const getEventCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'tree_planting':
        return <TreePine className="w-4 h-4 text-emerald-500" />;
      case 'recycling_camp':
      case 'clean_drive':
        return <Trash2 className="w-4 h-4 text-teal-500" />;
      case 'workshop':
      case 'smog_awareness':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Nav Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Community Green Drives & Collective Campaigns
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Organize neighbourhood cleanups, tree canopy care, recycling camps, and verifiable campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Active Campaigns ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'events'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Upcoming Events ({events.length})
            </button>
          </div>

          {/* Create CTA */}
          {canOrganize && (
            <button
              onClick={activeTab === 'campaigns' ? onCreateCampaignModal : onCreateEventModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeTab === 'campaigns' ? 'New Campaign' : 'New Event'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No campaigns active</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Start a collective goal like "1,000 kg Waste Segregation Drive" or "Zero Burning Vigilance Week".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => {
                const progressPct =
                  camp.progressPercentage ??
                  Math.min(100, Math.round((camp.currentValue / (camp.targetValue || 1)) * 100));

                return (
                  <div
                    key={camp._id}
                    className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        {camp.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-500">
                        Ends {new Date(camp.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {camp.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{camp.objective}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">
                          Progress: <b className="text-zinc-900 dark:text-zinc-100">{camp.currentValue}</b> / {camp.targetValue} {camp.targetMetric}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        {camp.participantsCount} Contributors
                      </span>

                      {onLogCampaignProgress && (
                        <button
                          onClick={() => onLogCampaignProgress(camp._id, 10)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
                        >
                          + Log Contribution
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No upcoming events</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Schedule a weekend park cleanup drive or an indoor smog protection workshop.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {getEventCategoryIcon(event.category)}
                      {event.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {event.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {event.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{event.description}</p>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{event.registeredCount} / {event.maxParticipants} Attendees Registered</span>
                    </div>
                  </div>

                  {/* Registered Button */}
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">By {event.organizerName}</span>

                    {event.isUserRegistered ? (
                      <button
                        onClick={() => onCancelEvent(event._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold"
                      >
                        ✓ Registered (Cancel)
                      </button>
                    ) : (
                      <button
                        onClick={() => onRegisterEvent(event._id)}
                        className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm"
                      >
                        RSVP Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
