import mongoose from 'mongoose';
import Community from '../models/Community.js';
import CommunityNotification from '../models/CommunityNotification.js';
import { fetchRealtimeAQI, AQIResponseData } from './aqiService.js';

export interface CommunityAQIOverview {
  communityId: string;
  communityName: string;
  location: {
    city: string;
    locality: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  aqiData: AQIResponseData;
  severeConditionActive: boolean;
  alertThreshold: number;
  dataSourceLabel: string;
  lastUpdated: string;
}

export const getCommunityAQI = async (communityId: string): Promise<CommunityAQIOverview> => {
  const community = await Community.findById(communityId).lean();
  if (!community) {
    throw new Error('Community not found');
  }

  const { lat, lon } = community.location.coordinates;
  const cityName = community.location.city;

  // Real-time AQI retrieval using official ground-truth pipeline
  const aqiData = await fetchRealtimeAQI(lat, lon, cityName);

  const threshold = community.settings?.aqiAlertThreshold || 300;
  const isSevere = aqiData.aqi >= threshold;

  // Check if we should emit an automatic severe smog alert
  if (isSevere && community.settings?.autoAlertSevereAqi) {
    await checkAndTriggerSevereAqiAlert(community._id.toString(), aqiData.aqi, threshold, cityName);
  }

  return {
    communityId: community._id.toString(),
    communityName: community.name,
    location: community.location,
    aqiData,
    severeConditionActive: isSevere,
    alertThreshold: threshold,
    dataSourceLabel: `${aqiData.dataSource} (Verified Station / OpenWeather AQI Engine)`,
    lastUpdated: aqiData.lastUpdated,
  };
};

const checkAndTriggerSevereAqiAlert = async (
  communityId: string,
  currentAqi: number,
  threshold: number,
  city: string
) => {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const recentAlert = await CommunityNotification.findOne({
    communityId: new mongoose.Types.ObjectId(communityId),
    type: 'severe_aqi_warning',
    createdAt: { $gte: fourHoursAgo },
  });

  if (!recentAlert) {
    await CommunityNotification.create({
      communityId: new mongoose.Types.ObjectId(communityId),
      type: 'severe_aqi_warning',
      title: `⚠️ Severe AQI Alert (${currentAqi}) in ${city}`,
      message: `Hyper-local AQI has crossed the safety threshold of ${threshold}. Children, elderly, and vulnerable individuals are advised to remain indoors, use air filtration, and avoid outdoor physical exertion.`,
      severity: 'critical',
      metadata: { aqi: currentAqi, threshold, city },
      readBy: [],
    });
  }
};
