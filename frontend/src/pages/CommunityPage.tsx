import React, { useState, useEffect } from 'react';
import { communityService } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import {
  CommunityData,
  PollutionReportData,
  HotspotMapPoint,
  CommunityEventData,
  CommunityCampaignData,
  CommunityPostData,
  CommunityCommentData,
  CommunityNotificationData,
  CommunityImpactData,
  CommunityLeaderboardEntryData,
  CommunityAIData,
  InstitutionSpecificViewData,
  MemberRole,
} from '../types';
import {
  Users,
  Compass,
  Plus,
  MapPin,
  Sparkles,
  Shield,
  Activity,
  Flame,
  MessageSquare,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import { CommunityHeaderCard } from '../components/community/CommunityHeaderCard';
import { CommunityAirQualityCard } from '../components/community/CommunityAirQualityCard';
import { NeighbourhoodPollutionMap } from '../components/community/NeighbourhoodPollutionMap';
import { PollutionReportingModal } from '../components/community/PollutionReportingModal';
import { PollutionReportFeed } from '../components/community/PollutionReportFeed';
import { CommunityEventsCampaignsCard } from '../components/community/CommunityEventsCampaignsCard';
import { CommunityChallengesLeaderboard } from '../components/community/CommunityChallengesLeaderboard';
import { CommunityDiscussionBoard } from '../components/community/CommunityDiscussionBoard';
import { AskCommunityAIModal } from '../components/community/AskCommunityAIModal';
import { InstitutionSpecificView } from '../components/community/InstitutionSpecificView';
import { CommunityAdminPanel } from '../components/community/CommunityAdminPanel';
import { CreateCommunityModal } from '../components/community/CreateCommunityModal';
import { DiscoverCommunitiesModal } from '../components/community/DiscoverCommunitiesModal';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'events' | 'discussion' | 'admin'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Community state
  const [allCommunities, setAllCommunities] = useState<CommunityData[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<CommunityData | null>(null);
  const [communityMembers, setCommunityMembers] = useState<Array<{ memberId: string; userId: string; name: string; role: MemberRole; joinedAt: string }>>([]);
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);

  // Associated Community Modules
  const [aqiOverview, setAqiOverview] = useState<any>(null);
  const [hotspots, setHotspots] = useState<HotspotMapPoint[]>([]);
  const [reports, setReports] = useState<PollutionReportData[]>([]);
  const [events, setEvents] = useState<CommunityEventData[]>([]);
  const [campaigns, setCampaigns] = useState<CommunityCampaignData[]>([]);
  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntryData[]>([]);
  const [impactData, setImpactData] = useState<CommunityImpactData | undefined>(undefined);
  const [institutionView, setInstitutionView] = useState<InstitutionSpecificViewData | undefined>(undefined);
  const [notifications, setNotifications] = useState<CommunityNotificationData[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState<boolean>(false);

  // Inline Quick Event / Campaign Form
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showCreateCampaignDialog, setShowCreateCampaignDialog] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    category: 'clean_drive' as any,
    description: '',
    locationName: '',
    startDate: '',
    endDate: '',
  });
  const [campaignFormData, setCampaignFormData] = useState({
    title: '',
    objective: '',
    category: 'waste_segregation' as any,
    targetMetric: 'kg segregated',
    targetValue: 500,
    startDate: '',
    endDate: '',
  });

  // Default coords (Delhi NCR default)
  const defaultCity = user?.city || 'Delhi';
  const defaultCoords = { lat: 28.6139, lon: 77.209 };

  // Initial Load: Fetch or seed communities
  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async (selectId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch communities
      const res = await communityService.getCommunities({ city: defaultCity, limit: 30 });
      let commList = res.communities || [];

      // If no communities in DB yet, create a robust default demonstration residential society
      if (commList.length === 0 && user) {
        try {
          const created = await communityService.createCommunity({
            name: 'Green Meadows Apartment Society RWA',
            type: 'residential_society',
            description:
              'A proactive residential society in Sector 62 actively mitigating winter smog through wet-sweeping, N95 guard provisions, and strict zero-leaf-burning vigilance.',
            location: {
              city: defaultCity,
              locality: 'Sector 62',
              coordinates: { lat: 28.628, lon: 77.365 },
              address: 'Block B, Sector 62',
            },
            privacy: 'public',
            objectives: [
              'Zero open garbage and leaf burning policy',
              'Wet-misting along society perimeter twice daily',
              'Heated guard kiosks to prevent warming bonfires',
            ],
          });
          commList = [created.community];
        } catch (e) {
          // ignore seed error
        }
      }

      setAllCommunities(commList);

      const targetId = selectId || commList[0]?._id;
      if (targetId) {
        await loadCommunityDetails(targetId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load community platform');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunityDetails = async (communityId: string) => {
    try {
      const details = await communityService.getCommunityDetails(communityId);
      setCurrentCommunity(details.community);
      setCommunityMembers(details.members || []);

      const memStatus = details.userMembership;
      setIsMember(!!memStatus && memStatus.status === 'active');
      setUserRole(memStatus ? memStatus.role : null);

      // Fetch ancillary data in parallel
      const [
        aqiRes,
        hotspotsRes,
        reportsRes,
        eventsRes,
        campaignsRes,
        postsRes,
        leaderboardRes,
        impactRes,
        instRes,
        notifRes,
      ] = await Promise.allSettled([
        communityService.getCommunityAQI(communityId),
        communityService.getHotspots({ city: details.community.location.city }),
        communityService.getPollutionReports({ communityId }),
        communityService.getEvents(communityId),
        communityService.getCampaigns(communityId),
        communityService.getPosts(communityId),
        communityService.getCommunityLeaderboard(communityId),
        communityService.getCommunityImpact(communityId),
        communityService.getInstitutionView(communityId),
        communityService.getNotifications(communityId),
      ]);

      if (aqiRes.status === 'fulfilled') setAqiOverview(aqiRes.value.aqi);
      if (hotspotsRes.status === 'fulfilled') setHotspots(hotspotsRes.value.hotspots || []);
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.reports || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.events || []);
      if (campaignsRes.status === 'fulfilled') setCampaigns(campaignsRes.value.campaigns || []);
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value.posts || []);
      if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value.leaderboard || []);
      if (impactRes.status === 'fulfilled') setImpactData(impactRes.value.impact);
      if (instRes.status === 'fulfilled') setInstitutionView(instRes.value.viewData);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.notifications || []);

      // If user has admin rights, load audit logs
      if (memStatus && (memStatus.role === 'owner' || memStatus.role === 'admin')) {
        try {
          const logsRes = await communityService.getAuditLogs(communityId);
          setAuditLogs(logsRes.logs || []);
        } catch (e) {
          // ignore audit log error
        }
      }
    } catch (err: any) {
      console.error('Error loading community details:', err);
    }
  };

  // Actions
  const handleJoinCommunity = async () => {
    if (!currentCommunity) return;
    try {
      await communityService.joinCommunity(currentCommunity._id);
      await loadCommunityDetails(currentCommunity._id);
    } catch (err: any) {
      alert(err.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!currentCommunity) return;
    if (!confirm('Are you sure you want to leave this community?')) return;
    try {
      await communityService.leaveCommunity(currentCommunity._id);
      await loadCommunityDetails(currentCommunity._id);
    } catch (err: any) {
      alert(err.message || 'Failed to leave community');
    }
  };

  const handleJoinByCode = async (code: string) => {
    const res = await communityService.joinByInviteCode(code);
    await loadCommunities();
  };

  const handleCreateReport = async (payload: any) => {
    await communityService.createPollutionReport(payload);
    if (currentCommunity) {
      const reps = await communityService.getPollutionReports({ communityId: currentCommunity._id });
      setReports(reps.reports || []);
      const spots = await communityService.getHotspots({ city: currentCommunity.location.city });
      setHotspots(spots.hotspots || []);
    }
  };

  const handleUpvoteReport = async (reportId: string) => {
    try {
      await communityService.toggleReportUpvote(reportId);
      if (currentCommunity) {
        const reps = await communityService.getPollutionReports({ communityId: currentCommunity._id });
        setReports(reps.reports || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: any, notes: string) => {
    try {
      await communityService.updateReportStatus(reportId, status, notes);
      if (currentCommunity) {
        const reps = await communityService.getPollutionReports({ communityId: currentCommunity._id });
        setReports(reps.reports || []);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update report status');
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await communityService.registerForEvent(eventId);
      if (currentCommunity) {
        const evs = await communityService.getEvents(currentCommunity._id);
        setEvents(evs.events || []);
      }
    } catch (e: any) {
      alert(e.message || 'Could not register for event');
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await communityService.cancelEventRegistration(eventId);
      if (currentCommunity) {
        const evs = await communityService.getEvents(currentCommunity._id);
        setEvents(evs.events || []);
      }
    } catch (e: any) {
      alert(e.message || 'Could not cancel registration');
    }
  };

  const handleCreatePost = async (data: any) => {
    if (!currentCommunity) return;
    await communityService.createPost(currentCommunity._id, data);
    const p = await communityService.getPosts(currentCommunity._id);
    setPosts(p.posts || []);
  };

  const handleSelectPostComments = async (postId: string): Promise<CommunityCommentData[]> => {
    const res = await communityService.getPostComments(postId);
    return res.comments || [];
  };

  const handleAddComment = async (postId: string, content: string) => {
    await communityService.addPostComment(postId, content);
  };

  const handleToggleLikePost = async (postId: string) => {
    await communityService.toggleLikePost(postId);
    if (currentCommunity) {
      const p = await communityService.getPosts(currentCommunity._id);
      setPosts(p.posts || []);
    }
  };

  const handleFlagPost = async (postId: string, reason: string) => {
    await communityService.flagPost(postId, reason);
    alert('Post flagged for moderator review');
  };

  const handleAskAIAdvice = async (query?: string): Promise<CommunityAIData> => {
    if (!currentCommunity) throw new Error('No community selected');
    const res = await communityService.getAIAdvice(currentCommunity._id, query);
    return res.advice;
  };

  const handleCreateCommunitySubmit = async (data: any) => {
    const res = await communityService.createCommunity(data);
    await loadCommunities(res.community._id);
  };

  const handleUpdateRole = async (targetUserId: string, role: MemberRole) => {
    if (!currentCommunity) return;
    await communityService.updateMemberRole(currentCommunity._id, targetUserId, role);
    await loadCommunityDetails(currentCommunity._id);
  };

  const handleRespondJoinRequest = async (targetUserId: string, action: 'approve' | 'reject') => {
    if (!currentCommunity) return;
    await communityService.respondToJoinRequest(currentCommunity._id, targetUserId, action);
    await loadCommunityDetails(currentCommunity._id);
  };

  const handleCreateAnnouncement = async (data: any) => {
    if (!currentCommunity) return;
    await communityService.createAnnouncement(currentCommunity._id, data);
    const notifs = await communityService.getNotifications(currentCommunity._id);
    setNotifications(notifs.notifications || []);
  };

  const handleLogCampaignProgress = async (campaignId: string, increment: number) => {
    await communityService.recordCampaignProgress(campaignId, increment, 1);
    if (currentCommunity) {
      const c = await communityService.getCampaigns(currentCommunity._id);
      setCampaigns(c.campaigns || []);
    }
  };

  const canAdmin = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';

  if (isLoading && !currentCommunity) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-zinc-500 text-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
          <span>Loading Community & Society Intelligence Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Control Bar: Title & Community Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                MODULE 8
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Community & Society Hub
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Collective smog protection, ground incident mapping, verified green campaigns, and RWA governance
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDiscoverModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition-all shadow-xs"
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Switch Hub</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Hub</span>
            </button>
          </div>
        </div>

        {/* Main Community Header */}
        {currentCommunity && (
          <CommunityHeaderCard
            community={currentCommunity}
            userRole={userRole}
            isMember={isMember}
            onJoin={handleJoinCommunity}
            onLeave={handleLeaveCommunity}
            onOpenAdmin={() => setActiveTab('admin')}
            onOpenAdvisor={() => setShowAdvisorModal(true)}
          />
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-zinc-200/60 dark:bg-zinc-900 rounded-2xl overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Dashboard & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'map'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Hotspot Map & Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'events'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-500" />
            <span>Events & Campaigns ({events.length + campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
              activeTab === 'discussion'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Discussion Forum ({posts.length})</span>
          </button>

          {canAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-500" />
              <span>Admin & Roles</span>
            </button>
          )}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && currentCommunity && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Real-time Community AQI & Severe Smog Banner */}
            <CommunityAirQualityCard
              aqiData={aqiOverview?.aqiData}
              severeConditionActive={aqiOverview?.severeConditionActive}
              alertThreshold={aqiOverview?.alertThreshold}
              dataSourceLabel={aqiOverview?.dataSourceLabel}
              lastUpdated={aqiOverview?.lastUpdated}
            />

            {/* Institution Specific Guidance (RWA vs School vs Workplace) */}
            {institutionView && (
              <InstitutionSpecificView
                viewData={institutionView}
                communityType={currentCommunity.type}
              />
            )}

            {/* Verified Leaderboard & Physical Impact */}
            <CommunityChallengesLeaderboard
              leaderboard={leaderboard}
              impact={impactData}
            />
          </div>
        )}

        {/* Tab 2: Map & Reports */}
        {activeTab === 'map' && currentCommunity && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <NeighbourhoodPollutionMap
              center={currentCommunity.location.coordinates}
              communityName={currentCommunity.name}
              hotspots={hotspots}
              onOpenReportModal={() => setShowReportModal(true)}
              onUpvoteReport={handleUpvoteReport}
            />

            <PollutionReportFeed
              reports={reports}
              onUpvote={handleUpvoteReport}
              onUpdateStatus={canAdmin ? handleUpdateReportStatus : undefined}
              canModerate={canAdmin}
            />
          </div>
        )}

        {/* Tab 3: Events & Campaigns */}
        {activeTab === 'events' && currentCommunity && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CommunityEventsCampaignsCard
              events={events}
              campaigns={campaigns}
              onRegisterEvent={handleRegisterEvent}
              onCancelEvent={handleCancelEvent}
              onCreateEventModal={() => setShowCreateEventDialog(true)}
              onCreateCampaignModal={() => setShowCreateCampaignDialog(true)}
              onLogCampaignProgress={handleLogCampaignProgress}
              canOrganize={canAdmin || isMember}
            />
          </div>
        )}

        {/* Tab 4: Discussion Forum */}
        {activeTab === 'discussion' && currentCommunity && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CommunityDiscussionBoard
              posts={posts}
              onSelectPost={handleSelectPostComments}
              onCreatePost={handleCreatePost}
              onAddComment={handleAddComment}
              onToggleLike={handleToggleLikePost}
              onFlagPost={handleFlagPost}
            />
          </div>
        )}

        {/* Tab 5: Admin Panel */}
        {activeTab === 'admin' && currentCommunity && canAdmin && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <CommunityAdminPanel
              communityId={currentCommunity._id}
              communityName={currentCommunity.name}
              members={communityMembers}
              notifications={notifications}
              auditLogs={auditLogs}
              onUpdateRole={handleUpdateRole}
              onRespondRequest={handleRespondJoinRequest}
              onCreateAnnouncement={handleCreateAnnouncement}
              onClose={() => setActiveTab('overview')}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {currentCommunity && (
        <>
          <PollutionReportingModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            communityId={currentCommunity._id}
            defaultCity={currentCommunity.location.city}
            defaultCoords={currentCommunity.location.coordinates}
            onSubmitReport={handleCreateReport}
          />

          <AskCommunityAIModal
            isOpen={showAdvisorModal}
            onClose={() => setShowAdvisorModal(false)}
            communityName={currentCommunity.name}
            communityType={currentCommunity.type}
            onAskAdvice={handleAskAIAdvice}
          />
        </>
      )}

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultCity={defaultCity}
        defaultCoords={defaultCoords}
        onCreate={handleCreateCommunitySubmit}
      />

      <DiscoverCommunitiesModal
        isOpen={showDiscoverModal}
        onClose={() => setShowDiscoverModal(false)}
        communities={allCommunities}
        onSelectCommunity={(id) => {
          loadCommunityDetails(id);
        }}
        onJoinByCode={handleJoinByCode}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Quick Event Dialog */}
      {showCreateEventDialog && currentCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Organize Community Event
              </h4>
              <button onClick={() => setShowCreateEventDialog(false)} className="text-zinc-400 font-bold">✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await communityService.createEvent(currentCommunity._id, {
                  title: eventFormData.title,
                  category: eventFormData.category,
                  description: eventFormData.description,
                  location: { name: eventFormData.locationName || currentCommunity.name },
                  startDate: eventFormData.startDate || new Date(Date.now() + 86400000).toISOString(),
                  endDate: eventFormData.endDate || new Date(Date.now() + 90000000).toISOString(),
                });
                setShowCreateEventDialog(false);
                const evs = await communityService.getEvents(currentCommunity._id);
                setEvents(evs.events || []);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-semibold block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Society Wet-Misting & Park Cleanup Drive"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={eventFormData.category}
                  onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <option value="clean_drive">Clean Drive / Anti-Dust</option>
                  <option value="tree_planting">Tree Canopy Care / Misting</option>
                  <option value="recycling_camp">Recycling Camp</option>
                  <option value="workshop">Smog Protection Workshop</option>
                  <option value="carpool_initiative">Carpool Drive</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="What volunteers should bring, timing, safety instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateEventDialog(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Campaign Dialog */}
      {showCreateCampaignDialog && currentCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Launch Collective Campaign
              </h4>
              <button onClick={() => setShowCreateCampaignDialog(false)} className="text-zinc-400 font-bold">✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await communityService.createCampaign(currentCommunity._id, {
                  title: campaignFormData.title,
                  objective: campaignFormData.objective,
                  category: campaignFormData.category,
                  targetMetric: campaignFormData.targetMetric,
                  targetValue: campaignFormData.targetValue,
                  startDate: campaignFormData.startDate || new Date().toISOString(),
                  endDate: campaignFormData.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
                });
                setShowCreateCampaignDialog(false);
                const camps = await communityService.getCampaigns(currentCommunity._id);
                setCampaigns(camps.campaigns || []);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-semibold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1,000 kg Dry Waste Segregation Challenge"
                  value={campaignFormData.title}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divert organic waste from illegal open combustion"
                  value={campaignFormData.objective}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, objective: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Target Value</label>
                  <input
                    type="number"
                    required
                    value={campaignFormData.targetValue}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, targetValue: parseInt(e.target.value, 10) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Metric Unit</label>
                  <input
                    type="text"
                    required
                    value={campaignFormData.targetMetric}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, targetMetric: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignDialog(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Start Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CommunityPage;
