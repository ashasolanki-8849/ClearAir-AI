import mongoose from 'mongoose';
import PollutionReport, {
  IPollutionReport,
  PollutionCategory,
  ReportSeverity,
  ReportStatus,
} from '../models/PollutionReport.js';
import CommunityAuditLog from '../models/CommunityAuditLog.js';
import CommunityNotification from '../models/CommunityNotification.js';

export interface CreateReportInput {
  communityId?: string;
  category: PollutionCategory;
  title: string;
  description: string;
  location: {
    name: string;
    city: string;
    locality?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  imageUrl?: string;
  severity?: ReportSeverity;
  isAnonymous?: boolean;
}

export const createPollutionReport = async (
  userId: string,
  userFullName: string,
  input: CreateReportInput
): Promise<IPollutionReport> => {
  const reporterName = input.isAnonymous
    ? `Concerned Citizen (${input.location.locality || input.location.city})`
    : userFullName || 'ClearAir Contributor';

  const report = new PollutionReport({
    communityId: input.communityId ? new mongoose.Types.ObjectId(input.communityId) : undefined,
    userId: new mongoose.Types.ObjectId(userId),
    reporterName,
    isAnonymous: !!input.isAnonymous,
    category: input.category,
    title: input.title,
    description: input.description,
    location: input.location,
    imageUrl: input.imageUrl || '',
    severity: input.severity || 'moderate',
    status: 'submitted',
    upvotes: 0,
    upvoters: [],
    isPublic: true,
  });

  const savedReport = await report.save();

  // If associated with a community, emit community notification
  if (input.communityId) {
    await CommunityNotification.create({
      communityId: new mongoose.Types.ObjectId(input.communityId),
      type: 'local_incident',
      title: `New Incident Reported: ${input.title}`,
      message: `${input.category.replace('_', ' ').toUpperCase()} reported near ${input.location.name}. Severity: ${input.severity || 'moderate'}.`,
      severity: input.severity === 'severe' || input.severity === 'high' ? 'warning' : 'info',
      metadata: { reportId: savedReport._id, category: input.category },
      readBy: [],
    });
  }

  return savedReport;
};

export const getPollutionReports = async (params: {
  communityId?: string;
  city?: string;
  category?: string;
  status?: string;
  severity?: string;
  page?: number;
  limit?: number;
}) => {
  const query: any = {};

  if (params.communityId) {
    query.communityId = new mongoose.Types.ObjectId(params.communityId);
  }

  if (params.city) {
    query['location.city'] = new RegExp(params.city, 'i');
  }

  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }

  if (params.severity && params.severity !== 'all') {
    query.severity = params.severity;
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    PollutionReport.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    PollutionReport.countDocuments(query),
  ]);

  return {
    reports,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getHotspotMapPoints = async (params: {
  city?: string;
  category?: string;
  status?: string;
}) => {
  const query: any = { isPublic: true };

  if (params.city) {
    query['location.city'] = new RegExp(params.city, 'i');
  }

  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  } else {
    // By default on the map, show active or verified incidents
    query.status = { $in: ['submitted', 'under_review', 'verified', 'in_progress', 'resolved'] };
  }

  const reports = await PollutionReport.find(query)
    .select('title category description severity status location createdAt upvotes imageUrl')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return reports.map((r) => ({
    id: r._id,
    type: 'citizen_report',
    title: r.title,
    category: r.category,
    severity: r.severity,
    status: r.status,
    description: r.description,
    coordinates: r.location.coordinates,
    locationName: r.location.name,
    city: r.location.city,
    upvotes: r.upvotes,
    imageUrl: r.imageUrl,
    createdAt: r.createdAt,
  }));
};

export const updateReportStatus = async (
  reportId: string,
  newStatus: ReportStatus,
  moderationNotes: string,
  actorId: string,
  actorName: string
) => {
  const report = await PollutionReport.findById(reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  const prevStatus = report.status;
  report.status = newStatus;
  report.moderationNotes = moderationNotes || report.moderationNotes;

  if (newStatus === 'verified') {
    report.verifiedBy = new mongoose.Types.ObjectId(actorId);
    report.verifiedAt = new Date();
  } else if (newStatus === 'resolved') {
    report.resolvedAt = new Date();
    report.resolvedNotes = moderationNotes || 'Resolved by community action';
  }

  await report.save();

  if (report.communityId) {
    await CommunityAuditLog.create({
      communityId: report.communityId,
      actorId: new mongoose.Types.ObjectId(actorId),
      actorName,
      action: 'update_report_status',
      targetType: 'pollution_report',
      targetId: report._id.toString(),
      details: { prevStatus, newStatus, moderationNotes },
    });
  }

  return report;
};

export const toggleReportUpvote = async (reportId: string, userId: string) => {
  const report = await PollutionReport.findById(reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  const uId = new mongoose.Types.ObjectId(userId);
  const alreadyUpvoted = report.upvoters.some((id) => id.equals(uId));

  if (alreadyUpvoted) {
    report.upvoters = report.upvoters.filter((id) => !id.equals(uId));
    report.upvotes = Math.max(0, report.upvotes - 1);
  } else {
    report.upvoters.push(uId);
    report.upvotes += 1;
  }

  await report.save();

  return {
    upvotes: report.upvotes,
    hasUpvoted: !alreadyUpvoted,
  };
};
