import { db } from "@/db/drizzle";
import { 
  nxtHerSessionFeedback, 
  nxtHerEventFeedback, 
  nxtHerAttendees, 
  nxtHerSessions,
  nxtHerEvents
} from "@/db/nxt-her-schema";
import { eq, and, desc, avg, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface SessionFeedbackData {
  sessionId: string;
  attendeeId: string;
  rating: number;
  contentQuality?: number;
  speakerRating?: number;
  relevance?: number;
  comments?: string;
  wouldRecommend?: boolean;
}

export interface SessionFeedbackSummary {
  sessionId: string;
  sessionTitle: string;
  totalResponses: number;
  averageRating: number;
  averageContentQuality: number;
  averageSpeakerRating: number;
  averageRelevance: number;
  recommendationRate: number;
  comments: Array<{
    id: string;
    attendeeName: string;
    comment: string;
    rating: number;
    createdAt: Date;
  }>;
}

export interface AttendeeSessionFeedback {
  id: string;
  sessionId: string;
  sessionTitle: string;
  rating: number;
  contentQuality?: number;
  speakerRating?: number;
  relevance?: number;
  comments?: string;
  wouldRecommend?: boolean;
  createdAt: Date;
}

export interface EventFeedbackData {
  eventId: string;
  attendeeId: string;
  npsScore: number;
  overallRating: number;
  contentQuality?: number;
  networkingExperience?: number;
  platformUsability?: number;
  mostValuableAspect?: string;
  leastValuableAspect?: string;
  suggestions?: string;
  wouldAttendAgain?: boolean;
  wouldRecommend?: boolean;
}

export interface EventFeedbackSummary {
  eventId: string;
  eventName: string;
  totalResponses: number;
  averageNpsScore: number;
  averageOverallRating: number;
  averageContentQuality: number;
  averageNetworkingExperience: number;
  averagePlatformUsability: number;
  wouldAttendAgainRate: number;
  wouldRecommendRate: number;
  npsCategories: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  feedback: Array<{
    id: string;
    attendeeName: string;
    npsScore: number;
    overallRating: number;
    mostValuableAspect?: string;
    leastValuableAspect?: string;
    suggestions?: string;
    createdAt: Date;
  }>;
}

export interface AttendeeEventFeedback {
  id: string;
  eventId: string;
  eventName: string;
  npsScore: number;
  overallRating: number;
  contentQuality?: number;
  networkingExperience?: number;
  platformUsability?: number;
  mostValuableAspect?: string;
  leastValuableAspect?: string;
  suggestions?: string;
  wouldAttendAgain?: boolean;
  wouldRecommend?: boolean;
  createdAt: Date;
}

/**
 * Submit or update session feedback for an attendee
 */
export async function submitSessionFeedback(
  attendeeEmail: string,
  feedbackData: Omit<SessionFeedbackData, "attendeeId">
): Promise<{ success: boolean; feedback?: any; error?: string }> {
  try {
    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return { success: false, error: "Attendee not found" };
    }

    // Verify the session exists
    const session = await db.query.nxtHerSessions.findFirst({
      where: eq(nxtHerSessions.id, feedbackData.sessionId),
    });

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Check if feedback already exists
    const existingFeedback = await db.query.nxtHerSessionFeedback.findFirst({
      where: and(
        eq(nxtHerSessionFeedback.sessionId, feedbackData.sessionId),
        eq(nxtHerSessionFeedback.attendeeId, attendee.id)
      ),
    });

    if (existingFeedback) {
      // Update existing feedback
      const [updatedFeedback] = await db
        .update(nxtHerSessionFeedback)
        .set({
          rating: feedbackData.rating,
          contentQuality: feedbackData.contentQuality,
          speakerRating: feedbackData.speakerRating,
          relevance: feedbackData.relevance,
          comments: feedbackData.comments,
          wouldRecommend: feedbackData.wouldRecommend,
        })
        .where(eq(nxtHerSessionFeedback.id, existingFeedback.id))
        .returning();

      return { success: true, feedback: updatedFeedback };
    } else {
      // Create new feedback
      const [newFeedback] = await db
        .insert(nxtHerSessionFeedback)
        .values({
          id: nanoid(),
          sessionId: feedbackData.sessionId,
          attendeeId: attendee.id,
          rating: feedbackData.rating,
          contentQuality: feedbackData.contentQuality,
          speakerRating: feedbackData.speakerRating,
          relevance: feedbackData.relevance,
          comments: feedbackData.comments,
          wouldRecommend: feedbackData.wouldRecommend,
        })
        .returning();

      return { success: true, feedback: newFeedback };
    }
  } catch (error) {
    console.error("Error submitting session feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * Get session feedback for a specific attendee
 */
export async function getAttendeeSessionFeedback(
  attendeeEmail: string,
  sessionId?: string
): Promise<AttendeeSessionFeedback[]> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return [];
    }

    const whereCondition = sessionId
      ? and(
          eq(nxtHerSessionFeedback.attendeeId, attendee.id),
          eq(nxtHerSessionFeedback.sessionId, sessionId)
        )
      : eq(nxtHerSessionFeedback.attendeeId, attendee.id);

    const feedback = await db
      .select({
        id: nxtHerSessionFeedback.id,
        sessionId: nxtHerSessionFeedback.sessionId,
        sessionTitle: nxtHerSessions.title,
        rating: nxtHerSessionFeedback.rating,
        contentQuality: nxtHerSessionFeedback.contentQuality,
        speakerRating: nxtHerSessionFeedback.speakerRating,
        relevance: nxtHerSessionFeedback.relevance,
        comments: nxtHerSessionFeedback.comments,
        wouldRecommend: nxtHerSessionFeedback.wouldRecommend,
        createdAt: nxtHerSessionFeedback.createdAt,
      })
      .from(nxtHerSessionFeedback)
      .innerJoin(nxtHerSessions, eq(nxtHerSessionFeedback.sessionId, nxtHerSessions.id))
      .where(whereCondition)
      .orderBy(desc(nxtHerSessionFeedback.createdAt));

    return feedback;
  } catch (error) {
    console.error("Error fetching attendee session feedback:", error);
    return [];
  }
}

/**
 * Get feedback summary for a specific session
 */
export async function getSessionFeedbackSummary(
  sessionId: string
): Promise<SessionFeedbackSummary | null> {
  try {
    // Get session details
    const session = await db.query.nxtHerSessions.findFirst({
      where: eq(nxtHerSessions.id, sessionId),
    });

    if (!session) {
      return null;
    }

    // Get aggregated feedback data
    const aggregatedData = await db
      .select({
        totalResponses: count(nxtHerSessionFeedback.id),
        averageRating: avg(nxtHerSessionFeedback.rating),
        averageContentQuality: avg(nxtHerSessionFeedback.contentQuality),
        averageSpeakerRating: avg(nxtHerSessionFeedback.speakerRating),
        averageRelevance: avg(nxtHerSessionFeedback.relevance),
        recommendationCount: sql<number>`COUNT(CASE WHEN ${nxtHerSessionFeedback.wouldRecommend} = true THEN 1 END)`,
        totalRecommendationResponses: sql<number>`COUNT(CASE WHEN ${nxtHerSessionFeedback.wouldRecommend} IS NOT NULL THEN 1 END)`,
      })
      .from(nxtHerSessionFeedback)
      .where(eq(nxtHerSessionFeedback.sessionId, sessionId));

    const stats = aggregatedData[0];

    // Get comments with attendee names
    const comments = await db
      .select({
        id: nxtHerSessionFeedback.id,
        attendeeName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        comment: nxtHerSessionFeedback.comments,
        rating: nxtHerSessionFeedback.rating,
        createdAt: nxtHerSessionFeedback.createdAt,
      })
      .from(nxtHerSessionFeedback)
      .innerJoin(nxtHerAttendees, eq(nxtHerSessionFeedback.attendeeId, nxtHerAttendees.id))
      .where(
        and(
          eq(nxtHerSessionFeedback.sessionId, sessionId),
          sql`${nxtHerSessionFeedback.comments} IS NOT NULL AND ${nxtHerSessionFeedback.comments} != ''`
        )
      )
      .orderBy(desc(nxtHerSessionFeedback.createdAt));

    const recommendationRate = stats.totalRecommendationResponses > 0
      ? (stats.recommendationCount / stats.totalRecommendationResponses) * 100
      : 0;

    return {
      sessionId,
      sessionTitle: session.title,
      totalResponses: stats.totalResponses,
      averageRating: Number(stats.averageRating) || 0,
      averageContentQuality: Number(stats.averageContentQuality) || 0,
      averageSpeakerRating: Number(stats.averageSpeakerRating) || 0,
      averageRelevance: Number(stats.averageRelevance) || 0,
      recommendationRate,
      comments: comments.map(c => ({
        id: c.id,
        attendeeName: c.attendeeName,
        comment: c.comment || "",
        rating: c.rating,
        createdAt: c.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching session feedback summary:", error);
    return null;
  }
}

/**
 * Get feedback summaries for multiple sessions
 */
export async function getMultipleSessionFeedbackSummaries(
  sessionIds: string[]
): Promise<SessionFeedbackSummary[]> {
  try {
    const summaries = await Promise.all(
      sessionIds.map(sessionId => getSessionFeedbackSummary(sessionId))
    );

    return summaries.filter((summary): summary is SessionFeedbackSummary => summary !== null);
  } catch (error) {
    console.error("Error fetching multiple session feedback summaries:", error);
    return [];
  }
}

/**
 * Check if an attendee has submitted feedback for a session
 */
export async function hasAttendeeSubmittedFeedback(
  attendeeEmail: string,
  sessionId: string
): Promise<boolean> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return false;
    }

    const feedback = await db.query.nxtHerSessionFeedback.findFirst({
      where: and(
        eq(nxtHerSessionFeedback.sessionId, sessionId),
        eq(nxtHerSessionFeedback.attendeeId, attendee.id)
      ),
    });

    return !!feedback;
  } catch (error) {
    console.error("Error checking if attendee submitted feedback:", error);
    return false;
  }
}
/**

 * Submit or update event feedback for an attendee
 */
export async function submitEventFeedback(
  attendeeEmail: string,
  feedbackData: Omit<EventFeedbackData, "attendeeId">
): Promise<{ success: boolean; feedback?: any; error?: string }> {
  try {
    // Find the attendee
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return { success: false, error: "Attendee not found" };
    }

    // Verify the event exists
    const event = await db.query.nxtHerEvents.findFirst({
      where: eq(nxtHerEvents.id, feedbackData.eventId),
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Check if feedback already exists
    const existingFeedback = await db.query.nxtHerEventFeedback.findFirst({
      where: and(
        eq(nxtHerEventFeedback.eventId, feedbackData.eventId),
        eq(nxtHerEventFeedback.attendeeId, attendee.id)
      ),
    });

    if (existingFeedback) {
      // Update existing feedback
      const [updatedFeedback] = await db
        .update(nxtHerEventFeedback)
        .set({
          npsScore: feedbackData.npsScore,
          overallRating: feedbackData.overallRating,
          contentQuality: feedbackData.contentQuality,
          networkingExperience: feedbackData.networkingExperience,
          platformUsability: feedbackData.platformUsability,
          mostValuableAspect: feedbackData.mostValuableAspect,
          leastValuableAspect: feedbackData.leastValuableAspect,
          suggestions: feedbackData.suggestions,
          wouldAttendAgain: feedbackData.wouldAttendAgain,
          wouldRecommend: feedbackData.wouldRecommend,
        })
        .where(eq(nxtHerEventFeedback.id, existingFeedback.id))
        .returning();

      return { success: true, feedback: updatedFeedback };
    } else {
      // Create new feedback
      const [newFeedback] = await db
        .insert(nxtHerEventFeedback)
        .values({
          id: nanoid(),
          eventId: feedbackData.eventId,
          attendeeId: attendee.id,
          npsScore: feedbackData.npsScore,
          overallRating: feedbackData.overallRating,
          contentQuality: feedbackData.contentQuality,
          networkingExperience: feedbackData.networkingExperience,
          platformUsability: feedbackData.platformUsability,
          mostValuableAspect: feedbackData.mostValuableAspect,
          leastValuableAspect: feedbackData.leastValuableAspect,
          suggestions: feedbackData.suggestions,
          wouldAttendAgain: feedbackData.wouldAttendAgain,
          wouldRecommend: feedbackData.wouldRecommend,
        })
        .returning();

      return { success: true, feedback: newFeedback };
    }
  } catch (error) {
    console.error("Error submitting event feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * Get event feedback for a specific attendee
 */
export async function getAttendeeEventFeedback(
  attendeeEmail: string,
  eventId?: string
): Promise<AttendeeEventFeedback[]> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return [];
    }

    const whereCondition = eventId
      ? and(
          eq(nxtHerEventFeedback.attendeeId, attendee.id),
          eq(nxtHerEventFeedback.eventId, eventId)
        )
      : eq(nxtHerEventFeedback.attendeeId, attendee.id);

    const feedback = await db
      .select({
        id: nxtHerEventFeedback.id,
        eventId: nxtHerEventFeedback.eventId,
        eventName: nxtHerEvents.name,
        npsScore: nxtHerEventFeedback.npsScore,
        overallRating: nxtHerEventFeedback.overallRating,
        contentQuality: nxtHerEventFeedback.contentQuality,
        networkingExperience: nxtHerEventFeedback.networkingExperience,
        platformUsability: nxtHerEventFeedback.platformUsability,
        mostValuableAspect: nxtHerEventFeedback.mostValuableAspect,
        leastValuableAspect: nxtHerEventFeedback.leastValuableAspect,
        suggestions: nxtHerEventFeedback.suggestions,
        wouldAttendAgain: nxtHerEventFeedback.wouldAttendAgain,
        wouldRecommend: nxtHerEventFeedback.wouldRecommend,
        createdAt: nxtHerEventFeedback.createdAt,
      })
      .from(nxtHerEventFeedback)
      .innerJoin(nxtHerEvents, eq(nxtHerEventFeedback.eventId, nxtHerEvents.id))
      .where(whereCondition)
      .orderBy(desc(nxtHerEventFeedback.createdAt));

    return feedback;
  } catch (error) {
    console.error("Error fetching attendee event feedback:", error);
    return [];
  }
}

/**
 * Get feedback summary for a specific event
 */
export async function getEventFeedbackSummary(
  eventId: string
): Promise<EventFeedbackSummary | null> {
  try {
    // Get event details
    const event = await db.query.nxtHerEvents.findFirst({
      where: eq(nxtHerEvents.id, eventId),
    });

    if (!event) {
      return null;
    }

    // Get aggregated feedback data
    const aggregatedData = await db
      .select({
        totalResponses: count(nxtHerEventFeedback.id),
        averageNpsScore: avg(nxtHerEventFeedback.npsScore),
        averageOverallRating: avg(nxtHerEventFeedback.overallRating),
        averageContentQuality: avg(nxtHerEventFeedback.contentQuality),
        averageNetworkingExperience: avg(nxtHerEventFeedback.networkingExperience),
        averagePlatformUsability: avg(nxtHerEventFeedback.platformUsability),
        wouldAttendAgainCount: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.wouldAttendAgain} = true THEN 1 END)`,
        totalWouldAttendAgainResponses: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.wouldAttendAgain} IS NOT NULL THEN 1 END)`,
        wouldRecommendCount: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.wouldRecommend} = true THEN 1 END)`,
        totalWouldRecommendResponses: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.wouldRecommend} IS NOT NULL THEN 1 END)`,
        promotersCount: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.npsScore} >= 9 THEN 1 END)`,
        passivesCount: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.npsScore} >= 7 AND ${nxtHerEventFeedback.npsScore} <= 8 THEN 1 END)`,
        detractorsCount: sql<number>`COUNT(CASE WHEN ${nxtHerEventFeedback.npsScore} <= 6 THEN 1 END)`,
      })
      .from(nxtHerEventFeedback)
      .where(eq(nxtHerEventFeedback.eventId, eventId));

    const stats = aggregatedData[0];

    // Get detailed feedback with attendee names
    const detailedFeedback = await db
      .select({
        id: nxtHerEventFeedback.id,
        attendeeName: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        npsScore: nxtHerEventFeedback.npsScore,
        overallRating: nxtHerEventFeedback.overallRating,
        mostValuableAspect: nxtHerEventFeedback.mostValuableAspect,
        leastValuableAspect: nxtHerEventFeedback.leastValuableAspect,
        suggestions: nxtHerEventFeedback.suggestions,
        createdAt: nxtHerEventFeedback.createdAt,
      })
      .from(nxtHerEventFeedback)
      .innerJoin(nxtHerAttendees, eq(nxtHerEventFeedback.attendeeId, nxtHerAttendees.id))
      .where(eq(nxtHerEventFeedback.eventId, eventId))
      .orderBy(desc(nxtHerEventFeedback.createdAt));

    const wouldAttendAgainRate = stats.totalWouldAttendAgainResponses > 0
      ? (stats.wouldAttendAgainCount / stats.totalWouldAttendAgainResponses) * 100
      : 0;

    const wouldRecommendRate = stats.totalWouldRecommendResponses > 0
      ? (stats.wouldRecommendCount / stats.totalWouldRecommendResponses) * 100
      : 0;

    return {
      eventId,
      eventName: event.name,
      totalResponses: stats.totalResponses,
      averageNpsScore: Number(stats.averageNpsScore) || 0,
      averageOverallRating: Number(stats.averageOverallRating) || 0,
      averageContentQuality: Number(stats.averageContentQuality) || 0,
      averageNetworkingExperience: Number(stats.averageNetworkingExperience) || 0,
      averagePlatformUsability: Number(stats.averagePlatformUsability) || 0,
      wouldAttendAgainRate,
      wouldRecommendRate,
      npsCategories: {
        promoters: stats.promotersCount,
        passives: stats.passivesCount,
        detractors: stats.detractorsCount,
      },
      feedback: detailedFeedback.map(f => ({
        id: f.id,
        attendeeName: f.attendeeName,
        npsScore: f.npsScore,
        overallRating: f.overallRating,
        mostValuableAspect: f.mostValuableAspect || undefined,
        leastValuableAspect: f.leastValuableAspect || undefined,
        suggestions: f.suggestions || undefined,
        createdAt: f.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching event feedback summary:", error);
    return null;
  }
}

/**
 * Check if an attendee has submitted event feedback
 */
export async function hasAttendeeSubmittedEventFeedback(
  attendeeEmail: string,
  eventId: string
): Promise<boolean> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return false;
    }

    const feedback = await db.query.nxtHerEventFeedback.findFirst({
      where: and(
        eq(nxtHerEventFeedback.eventId, eventId),
        eq(nxtHerEventFeedback.attendeeId, attendee.id)
      ),
    });

    return !!feedback;
  } catch (error) {
    console.error("Error checking if attendee submitted event feedback:", error);
    return false;
  }
}

/**
 * Get feedback completion tracking for an event
 */
export async function getEventFeedbackCompletionStats(
  eventId: string
): Promise<{
  totalAttendees: number;
  completedFeedback: number;
  completionRate: number;
  pendingAttendees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}> {
  try {
    // Get total attendees for the event
    const totalAttendees = await db
      .select({ count: count(nxtHerAttendees.id) })
      .from(nxtHerAttendees)
      .where(
        and(
          eq(nxtHerAttendees.eventId, eventId),
          eq(nxtHerAttendees.registrationStatus, "approved")
        )
      );

    // Get attendees who have completed feedback
    const completedFeedback = await db
      .select({ count: count(nxtHerEventFeedback.id) })
      .from(nxtHerEventFeedback)
      .where(eq(nxtHerEventFeedback.eventId, eventId));

    // Get attendees who haven't submitted feedback yet
    const pendingAttendees = await db
      .select({
        id: nxtHerAttendees.id,
        name: sql<string>`CONCAT(${nxtHerAttendees.firstName}, ' ', ${nxtHerAttendees.lastName})`,
        email: nxtHerAttendees.email,
      })
      .from(nxtHerAttendees)
      .leftJoin(
        nxtHerEventFeedback,
        and(
          eq(nxtHerEventFeedback.attendeeId, nxtHerAttendees.id),
          eq(nxtHerEventFeedback.eventId, eventId)
        )
      )
      .where(
        and(
          eq(nxtHerAttendees.eventId, eventId),
          eq(nxtHerAttendees.registrationStatus, "approved"),
          sql`${nxtHerEventFeedback.id} IS NULL`
        )
      );

    const total = totalAttendees[0]?.count || 0;
    const completed = completedFeedback[0]?.count || 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      totalAttendees: total,
      completedFeedback: completed,
      completionRate,
      pendingAttendees: pendingAttendees.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
      })),
    };
  } catch (error) {
    console.error("Error fetching event feedback completion stats:", error);
    return {
      totalAttendees: 0,
      completedFeedback: 0,
      completionRate: 0,
      pendingAttendees: [],
    };
  }
}