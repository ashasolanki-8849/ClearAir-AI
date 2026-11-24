import mongoose from 'mongoose';
import Community from '../models/Community.js';
import CommunityMember from '../models/CommunityMember.js';
import PollutionReport from '../models/PollutionReport.js';
import { CommunityEvent, EventRegistration } from '../models/CommunityEvent.js';
import CommunityCampaign from '../models/CommunityCampaign.js';
import { CommunityPost } from '../models/CommunityPost.js';

export interface CommunityImpactSummary {
  communityId: string;
  communityName: string;
  communityType: string;
  totalMembers: number;
  totalEventsOrganized: number;
  totalEventAttendees: number;
  activeCampaignsCount: number;
  completedCampaignsCount: number;
  incidentsReported: number;
  incidentsResolved: number;
  recordedImpact: {
    wasteSegregatedKg: number;
    treesPlanted: number;
    totalAttendees: number;
    resolvedPollutionHotspots: number;
  };
  transparencyNote: string;
}

export interface CommunityLeaderboardEntry {
  userId: string;
  name: string;
  role: string;
  eventsAttendedCount: number;
  reportsSubmittedCount: number;
  discussionPostsCount: number;
  totalActivityScore: number;
  badge: string;
}

export const getCommunityImpactAnalytics = async (
  communityId: string
): Promise<CommunityImpactSummary> => {
  const commId = new mongoose.Types.ObjectId(communityId);
  const community = await Community.findById(commId).lean();
  if (!community) {
    throw new Error('Community not found');
  }

  const [
    membersCount,
    events,
    campaigns,
    reportsCount,
    resolvedReportsCount,
  ] = await Promise.all([
    CommunityMember.countDocuments({ communityId: commId, status: 'active' }),
    CommunityEvent.find({ communityId: commId }).lean(),
    CommunityCampaign.find({ communityId: commId }).lean(),
    PollutionReport.countDocuments({ communityId: commId }),
    PollutionReport.countDocuments({ communityId: commId, status: 'resolved' }),
  ]);

  let wasteSegregatedKg = 0;
  let treesPlanted = 0;
  let totalAttendees = 0;

  events.forEach((e) => {
    if (e.impactSummary) {
      wasteSegregatedKg += e.impactSummary.wasteCollectedKg || 0;
      treesPlanted += e.impactSummary.treesPlanted || 0;
      totalAttendees += e.impactSummary.attendees || e.registeredCount || 0;
    }
  });

  campaigns.forEach((c) => {
    if (c.category === 'waste_segregation') {
      wasteSegregatedKg += c.currentValue || 0;
    }
  });

  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed').length;

  return {
    communityId: community._id.toString(),
    communityName: community.name,
    communityType: community.type,
    totalMembers: membersCount || community.membersCount,
    totalEventsOrganized: events.length,
    totalEventAttendees: totalAttendees,
    activeCampaignsCount: activeCampaigns,
    completedCampaignsCount: completedCampaigns,
    incidentsReported: reportsCount,
    incidentsResolved: resolvedReportsCount,
    recordedImpact: {
      wasteSegregatedKg: Math.round(wasteSegregatedKg),
      treesPlanted,
      totalAttendees,
      resolvedPollutionHotspots: resolvedReportsCount,
    },
    transparencyNote:
      'All impact metrics reflect actual physical counts logged by event organizers and verified citizen reporters. ClearAir AI strictly avoids fabricated atmospheric displacement claims.',
  };
};

export const getCommunityLeaderboard = async (
  communityId: string
): Promise<CommunityLeaderboardEntry[]> => {
  const commId = new mongoose.Types.ObjectId(communityId);

  const activeMembers = await CommunityMember.find({ communityId: commId, status: 'active' })
    .populate('userId', 'fullName email')
    .lean();

  if (!activeMembers || activeMembers.length === 0) {
    return [];
  }

  const userIds = activeMembers.map((m) => m.userId?._id || m.userId);

  const [eventRegs, reports, posts] = await Promise.all([
    EventRegistration.find({ communityId: commId, userId: { $in: userIds }, status: { $in: ['registered', 'attended'] } }).lean(),
    PollutionReport.find({ communityId: commId, userId: { $in: userIds } }).lean(),
    CommunityPost.find({ communityId: commId, userId: { $in: userIds } }).lean(),
  ]);

  const regMap: Record<string, number> = {};
  eventRegs.forEach((r) => {
    const uid = r.userId.toString();
    regMap[uid] = (regMap[uid] || 0) + 1;
  });

  const reportMap: Record<string, number> = {};
  reports.forEach((rep) => {
    const uid = rep.userId.toString();
    reportMap[uid] = (reportMap[uid] || 0) + 1;
  });

  const postMap: Record<string, number> = {};
  posts.forEach((p) => {
    const uid = p.userId.toString();
    postMap[uid] = (postMap[uid] || 0) + 1;
  });

  const leaderboard: CommunityLeaderboardEntry[] = activeMembers.map((m: any) => {
    const uid = (m.userId?._id || m.userId).toString();
    const name = m.userId?.fullName || 'Community Member';
    const attended = regMap[uid] || 0;
    const reported = reportMap[uid] || 0;
    const posted = postMap[uid] || 0;

    // Transparent participation score: 10 pts per event, 15 pts per report, 5 pts per discussion post
    const score = attended * 10 + reported * 15 + posted * 5;

    let badge = 'Green Citizen';
    if (score >= 50) badge = 'Smog Sentinel Champion';
    else if (score >= 25) badge = 'Active Neighbourhood Guardian';
    else if (score >= 10) badge = 'Eco Contributor';

    return {
      userId: uid,
      name,
      role: m.role,
      eventsAttendedCount: attended,
      reportsSubmittedCount: reported,
      discussionPostsCount: posted,
      totalActivityScore: score,
      badge,
    };
  });

  leaderboard.sort((a, b) => b.totalActivityScore - a.totalActivityScore);

  return leaderboard.slice(0, 20);
};

export const getInstitutionSpecificViewData = (communityType: string) => {
  switch (communityType) {
    case 'residential_society':
      return {
        focusArea: 'Residential Society Environmental Operations & RWA Governance',
        pillars: [
          {
            title: 'Solid Waste & Anti-Burning Protocols',
            icon: 'Flame',
            description:
              'Prevent open yard leaf burning; set up enclosed aerobic composting bins; enforce strict penalties for incinerating plastic packaging or dry horticulture refuse.',
            metricsTracked: ['Compost yield (kg)', 'Dry waste segregation %', 'Zero burning incidents'],
          },
          {
            title: 'Housekeeping & Ground Dust Control',
            icon: 'Droplets',
            description:
              'Mandatory wet-mopping in common corridors, podiums, and driveways. Transition completely away from dry broom sweepers that aerosolize fine particulate dust.',
            metricsTracked: ['Misting frequency (daily)', 'Internal driveway dust score'],
          },
          {
            title: 'Security Staff Winter Welfare',
            icon: 'ShieldCheck',
            description:
              'Furnish guard cabins with electric heaters and provide daily N95 masks to outdoor security guards to eliminate burning twigs/wood for night warmth.',
            metricsTracked: ['Electric heaters installed', 'N95 masks distributed'],
          },
          {
            title: 'DG Set & Power Backup Compliance',
            icon: 'Zap',
            description:
              'Ensure diesel generator sets are fitted with verified particulate filters (RECD) and only operated during certified essential power failures.',
            metricsTracked: ['DG run-hours logged', 'Dual fuel conversion status'],
          },
        ],
      };

    case 'school':
    case 'college':
      return {
        focusArea: 'Educational Institution Smog Mitigation & Student Safety',
        pillars: [
          {
            title: 'Graded Outdoor Sports Protocol',
            icon: 'Activity',
            description:
              'Automatically shift morning physical training, sports days, and prayer assemblies indoors when AQI crosses 250 to protect young developing lungs.',
            metricsTracked: ['Indoor shift compliance rate', 'Peak exposure hours avoided'],
          },
          {
            title: 'Gate No-Idling Enforcement',
            icon: 'Car',
            description:
              'Strict 1-minute engine turn-off rule for school buses, vans, and private parent cars during morning drop-off and afternoon dismissal gates.',
            metricsTracked: ['Gate compliance audits', 'Idling complaints resolved'],
          },
          {
            title: 'Indoor Clean Air Sanctuaries',
            icon: 'Wind',
            description:
              'Equip libraries, science laboratories, and high-density classrooms with medical-grade HEPA purifiers and real-time indoor display monitors.',
            metricsTracked: ['Indoor PM2.5 maintained < 35 µg/m³', 'Sanctuary rooms active'],
          },
          {
            title: 'Eco-Club Student Ambassadors',
            icon: 'BookOpen',
            description:
              'Mobilize students to lead air quality science experiments, daily flag announcements, and green commuting carpool pledges.',
            metricsTracked: ['Active student ambassadors', 'Schoolwide campaigns held'],
          },
        ],
      };

    case 'workplace':
      return {
        focusArea: 'Corporate Clean Air Workplace Strategy & Commuter Fleet Decarbonization',
        pillars: [
          {
            title: 'Smog-Adaptive Flexible Work',
            icon: 'Clock',
            description:
              'Stagger working hours (10:30 AM start) or implement hybrid work during severe smog alerts to pull employees out of hazardous rush-hour traffic.',
            metricsTracked: ['Staggered workforce %', 'Rush-hour miles saved'],
          },
          {
            title: 'HVAC Air Purification & Fresh Air Management',
            icon: 'Cpu',
            description:
              'Equip building AHUs with MERV-13 filters; regulate fresh air damper opening ratios during high-pollution morning hours to prevent indoor smog ingress.',
            metricsTracked: ['Filter differential pressure', 'Indoor PM2.5 / CO2 balance'],
          },
          {
            title: 'Corporate Carpooling & EV Shuttles',
            icon: 'Users',
            description:
              'Deploy private last-mile electric shuttles between office gates and nearest rapid transit hubs; reserve prime parking for carpool teams.',
            metricsTracked: ['Carpool participants', 'Metro shuttle trips logged'],
          },
          {
            title: 'Employee Smog Health Kits',
            icon: 'HeartPulse',
            description:
              'Supply certified N95 masks, nasal saline sprays, and respiratory health webinars during the winter smog months.',
            metricsTracked: ['Health kits distributed', 'Preventive care uptake'],
          },
        ],
      };

    default:
      return {
        focusArea: 'Citizen Neighbourhood Environmental Action & Ward Coordination',
        pillars: [
          {
            title: 'Rapid Incident Reporting',
            icon: 'AlertCircle',
            description:
              'Locate and document localized garbage fires, unpaved road dust, and illegal industrial smokestacks using the ClearAir AI Map.',
            metricsTracked: ['Reports logged', 'Resolution within 24h'],
          },
          {
            title: 'Ward Water Misting Coordination',
            icon: 'Droplets',
            description:
              'Collaborate with municipal ward engineers to schedule anti-smog water misting cannons along high-traffic neighborhood avenues.',
            metricsTracked: ['Misting runs requested', 'Avenues covered'],
          },
          {
            title: 'Community Tree Planting & Green Belts',
            icon: 'Trees',
            description:
              'Establish native evergreen dust-trapping tree buffers along perimeter fences and road medians.',
            metricsTracked: ['Trees planted', 'Canopy survival rate %'],
          },
        ],
      };
  }
};
