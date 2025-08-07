import { eq, and, desc, asc, gte, lte, count } from "drizzle-orm";
import db from "@/db/drizzle";
import {
  nxtHerAttendees,
  nxtHerSessions,
  nxtHerSessionSpeakers,
  nxtHerSpeakers,
  nxtHerSessionBookmarks,
  nxtHerConnections,
  nxtHerConnectionSuggestions,
  nxtHerForumPosts,
  nxtHerForums,
  nxtHerEvents,
} from "@/db/nxt-her-schema";

export interface DashboardData {
  attendee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhotoUrl: string | null;
    registrationStatus: string;
    attendanceType: string;
    organization: string | null;
    jobTitle: string | null;
    topicsOfInterest: string[] | null;
    areasOfExpertise: string[] | null;
  };
  event: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    venue: string | null;
  };
  stats: {
    totalSessions: number;
    totalAttendees: number;
    totalSpeakers: number;
    totalForums: number;
  };
  upcomingSessions: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    track: string | null;
    pillar: string | null;
    sessionType: string | null;
    venue: string | null;
    isVirtual: boolean;
    speakers: Array<{
      id: string;
      name: string;
      role: string;
    }>;
    isBookmarked: boolean;
  }>;
  recentForumActivity: Array<{
    id: string;
    authorName: string;
    forumTitle: string;
    content: string;
    createdAt: Date;
    isReply: boolean;
  }>;
  connectionRequests: Array<{
    id: string;
    requesterName: string;
    requesterOrganization: string | null;
    requesterJobTitle: string | null;
    message: string | null;
    createdAt: Date;
  }>;
  suggestedConnections: Array<{
    id: string;
    attendeeName: string;
    attendeeOrganization: string | null;
    attendeeJobTitle: string | null;
    matchScore: string | null;
    matchReasons: string[] | null;
    commonInterests: string[];
  }>;
  profileCompletion: {
    percentage: number;
    missingFields: string[];
  };
}

export async function getDashboardData(attendeeEmail: string): Promise<DashboardData | null> {
  try {
    // Get attendee data
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
      with: {
        event: true,
      },
    });

    if (!attendee) {
      return null;
    }

    // Get event stats
    const [sessionCount, attendeeCount, speakerCount, forumCount] = await Promise.all([
      db.select({ count: count() }).from(nxtHerSessions).where(eq(nxtHerSessions.eventId, attendee.eventId)),
      db.select({ count: count() }).from(nxtHerAttendees).where(eq(nxtHerAttendees.eventId, attendee.eventId)),
      db.select({ count: count() }).from(nxtHerSpeakers).where(eq(nxtHerSpeakers.eventId, attendee.eventId)),
      db.select({ count: count() }).from(nxtHerForums).where(eq(nxtHerForums.eventId, attendee.eventId)),
    ]);

    // Get upcoming sessions (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingSessions = await db.query.nxtHerSessions.findMany({
      where: and(
        eq(nxtHerSessions.eventId, attendee.eventId),
        gte(nxtHerSessions.startTime, now),
        lte(nxtHerSessions.startTime, nextWeek)
      ),
      orderBy: [asc(nxtHerSessions.startTime)],
      limit: 10,
      with: {
        sessionSpeakers: {
          with: {
            speaker: true,
          },
        },
      },
    });

    // Get bookmarked sessions for this attendee
    const bookmarkedSessions = await db.query.nxtHerSessionBookmarks.findMany({
      where: eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
    });
    const bookmarkedSessionIds = new Set(bookmarkedSessions.map(b => b.sessionId));

    // Get recent forum activity
    const recentForumActivity = await db.query.nxtHerForumPosts.findMany({
      where: eq(nxtHerForumPosts.authorAttendeeId, attendee.id),
      orderBy: [desc(nxtHerForumPosts.createdAt)],
      limit: 5,
      with: {
        forum: true,
        author: true,
      },
    });

    // Get pending connection requests
    const connectionRequests = await db.query.nxtHerConnections.findMany({
      where: and(
        eq(nxtHerConnections.requestedAttendeeId, attendee.id),
        eq(nxtHerConnections.status, "pending")
      ),
      orderBy: [desc(nxtHerConnections.createdAt)],
      limit: 5,
      with: {
        requester: true,
      },
    });

    // Get suggested connections
    const suggestedConnections = await db.query.nxtHerConnectionSuggestions.findMany({
      where: and(
        eq(nxtHerConnectionSuggestions.fromAttendeeId, attendee.id),
        eq(nxtHerConnectionSuggestions.status, "suggested")
      ),
      orderBy: [desc(nxtHerConnectionSuggestions.matchScore)],
      limit: 5,
      with: {
        toAttendee: true,
      },
    });

    // Calculate profile completion
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'city',
      'organization', 'jobTitle', 'aboutYou'
    ];
    const optionalFields = ['profilePhotoUrl', 'linkedinProfile', 'topicsOfInterest', 'areasOfExpertise'];
    
    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    requiredFields.forEach(field => {
      const value = attendee[field as keyof typeof attendee];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(field);
      } else {
        completedFields++;
      }
    });

    optionalFields.forEach(field => {
      const value = attendee[field as keyof typeof attendee];
      if (value && (!Array.isArray(value) || value.length > 0)) {
        completedFields++;
      }
    });

    const profileCompletion = {
      percentage: Math.round((completedFields / totalFields) * 100),
      missingFields,
    };

    return {
      attendee: {
        id: attendee.id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        profilePhotoUrl: attendee.profilePhotoUrl,
        registrationStatus: attendee.registrationStatus || "pending",
        attendanceType: attendee.attendanceType,
        organization: attendee.organization,
        jobTitle: attendee.jobTitle,
        topicsOfInterest: attendee.topicsOfInterest,
        areasOfExpertise: attendee.areasOfExpertise,
      },
      event: {
        id: attendee.event.id,
        name: attendee.event.name,
        description: attendee.event.description,
        startDate: attendee.event.startDate,
        endDate: attendee.event.endDate,
        venue: attendee.event.venue,
      },
      stats: {
        totalSessions: sessionCount[0]?.count || 0,
        totalAttendees: attendeeCount[0]?.count || 0,
        totalSpeakers: speakerCount[0]?.count || 0,
        totalForums: forumCount[0]?.count || 0,
      },
      upcomingSessions: upcomingSessions.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        track: session.track,
        pillar: session.pillar,
        sessionType: session.sessionType,
        venue: session.venue,
        isVirtual: session.isVirtual || false,
        speakers: session.sessionSpeakers.map(ss => ({
          id: ss.speaker.id,
          name: ss.speaker.name,
          role: ss.role,
        })),
        isBookmarked: bookmarkedSessionIds.has(session.id),
      })),
      recentForumActivity: recentForumActivity.map(post => ({
        id: post.id,
        authorName: `${post.author.firstName} ${post.author.lastName}`,
        forumTitle: post.forum.title,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
        createdAt: post.createdAt,
        isReply: !!post.parentPostId,
      })),
      connectionRequests: connectionRequests.map(request => ({
        id: request.id,
        requesterName: `${request.requester.firstName} ${request.requester.lastName}`,
        requesterOrganization: request.requester.organization,
        requesterJobTitle: request.requester.jobTitle,
        message: request.message,
        createdAt: request.createdAt,
      })),
      suggestedConnections: suggestedConnections.map(suggestion => {
        const commonInterests = attendee.topicsOfInterest && suggestion.toAttendee.topicsOfInterest
          ? attendee.topicsOfInterest.filter(interest => 
              suggestion.toAttendee.topicsOfInterest?.includes(interest)
            )
          : [];

        return {
          id: suggestion.id,
          attendeeName: `${suggestion.toAttendee.firstName} ${suggestion.toAttendee.lastName}`,
          attendeeOrganization: suggestion.toAttendee.organization,
          attendeeJobTitle: suggestion.toAttendee.jobTitle,
          matchScore: suggestion.matchScore,
          matchReasons: suggestion.matchReasons,
          commonInterests,
        };
      }),
      profileCompletion,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}