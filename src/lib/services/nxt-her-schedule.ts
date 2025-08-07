import { eq, and, desc, asc, gte, lte, inArray, or, like, ilike } from "drizzle-orm";
import db from "@/db/drizzle";
import {
  nxtHerAttendees,
  nxtHerSessions,
  nxtHerSessionSpeakers,
  nxtHerSpeakers,
  nxtHerSessionBookmarks,
} from "@/db/nxt-her-schema";

export interface ScheduleFilters {
  days?: string[];
  tracks?: string[];
  pillars?: string[];
  sessionTypes?: string[];
  speakers?: string[];
  attendanceType?: "in_person" | "virtual" | "both";
  searchQuery?: string;
}

export interface ScheduleSession {
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
  meetingLink: string | null;
  maxAttendees: number | null;
  speakers: Array<{
    id: string;
    name: string;
    role: string;
    profilePhotoUrl: string | null;
    bio: string;
    organization: string | null;
    jobTitle: string | null;
  }>;
  isBookmarked: boolean;
}

export interface ScheduleData {
  sessions: ScheduleSession[];
  filters: {
    availableDays: string[];
    availableTracks: string[];
    availablePillars: string[];
    availableSessionTypes: string[];
    availableSpeakers: Array<{
      id: string;
      name: string;
    }>;
  };
  stats: {
    totalSessions: number;
    filteredSessions: number;
  };
}

export async function getInteractiveSchedule(
  attendeeEmail: string,
  filters: ScheduleFilters = {}
): Promise<ScheduleData | null> {
  try {
    // Get attendee data
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return null;
    }

    // Build filter conditions
    const conditions = [eq(nxtHerSessions.eventId, attendee.eventId)];

    // Date filters
    if (filters.days && filters.days.length > 0) {
      const dayConditions = filters.days.map(day => {
        const date = new Date(day);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        return and(
          gte(nxtHerSessions.startTime, startOfDay),
          lte(nxtHerSessions.startTime, endOfDay)
        );
      });
      conditions.push(or(...dayConditions));
    }

    // Track filters
    if (filters.tracks && filters.tracks.length > 0) {
      conditions.push(inArray(nxtHerSessions.track, filters.tracks));
    }

    // Pillar filters
    if (filters.pillars && filters.pillars.length > 0) {
      conditions.push(inArray(nxtHerSessions.pillar, filters.pillars));
    }

    // Session type filters
    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      conditions.push(inArray(nxtHerSessions.sessionType, filters.sessionTypes));
    }

    // Attendance type filters
    if (filters.attendanceType && filters.attendanceType !== "both") {
      if (filters.attendanceType === "virtual") {
        conditions.push(eq(nxtHerSessions.isVirtual, true));
      } else {
        conditions.push(eq(nxtHerSessions.isVirtual, false));
      }
    }

    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = `%${filters.searchQuery.trim()}%`;
      conditions.push(
        or(
          ilike(nxtHerSessions.title, searchTerm),
          ilike(nxtHerSessions.description, searchTerm),
          ilike(nxtHerSessions.track, searchTerm),
          ilike(nxtHerSessions.pillar, searchTerm)
        )
      );
    }

    // Get filtered sessions
    const sessions = await db.query.nxtHerSessions.findMany({
      where: and(...conditions),
      orderBy: [asc(nxtHerSessions.startTime), asc(nxtHerSessions.title)],
      with: {
        sessionSpeakers: {
          with: {
            speaker: true,
          },
        },
      },
    });

    // Filter by speakers if specified
    let filteredSessions = sessions;
    if (filters.speakers && filters.speakers.length > 0) {
      filteredSessions = sessions.filter(session =>
        session.sessionSpeakers.some(ss => 
          filters.speakers!.includes(ss.speaker.id)
        )
      );
    }

    // Get bookmarked sessions for this attendee
    const bookmarkedSessions = await db.query.nxtHerSessionBookmarks.findMany({
      where: eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
    });
    const bookmarkedSessionIds = new Set(bookmarkedSessions.map(b => b.sessionId));

    // Get all sessions for filter options (without filters applied)
    const allSessions = await db.query.nxtHerSessions.findMany({
      where: eq(nxtHerSessions.eventId, attendee.eventId),
      with: {
        sessionSpeakers: {
          with: {
            speaker: true,
          },
        },
      },
    });

    // Extract filter options
    const availableDays = Array.from(
      new Set(
        allSessions.map(session => 
          session.startTime.toISOString().split('T')[0]
        )
      )
    ).sort();

    const availableTracks = Array.from(
      new Set(
        allSessions
          .map(session => session.track)
          .filter(track => track !== null)
      )
    ).sort();

    const availablePillars = Array.from(
      new Set(
        allSessions
          .map(session => session.pillar)
          .filter(pillar => pillar !== null)
      )
    ).sort();

    const availableSessionTypes = Array.from(
      new Set(
        allSessions
          .map(session => session.sessionType)
          .filter(type => type !== null)
      )
    ).sort();

    const speakerMap = new Map();
    allSessions.forEach(session => {
      session.sessionSpeakers.forEach(ss => {
        if (!speakerMap.has(ss.speaker.id)) {
          speakerMap.set(ss.speaker.id, {
            id: ss.speaker.id,
            name: ss.speaker.name,
          });
        }
      });
    });
    const availableSpeakers = Array.from(speakerMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Transform sessions to the expected format
    const processedSessions: ScheduleSession[] = filteredSessions.map(session => ({
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
      meetingLink: session.meetingLink,
      maxAttendees: session.maxAttendees,
      speakers: session.sessionSpeakers.map(ss => ({
        id: ss.speaker.id,
        name: ss.speaker.name,
        role: ss.role,
        profilePhotoUrl: ss.speaker.profilePhotoUrl,
        bio: ss.speaker.bio,
        organization: ss.speaker.organization,
        jobTitle: ss.speaker.jobTitle,
      })),
      isBookmarked: bookmarkedSessionIds.has(session.id),
    }));

    return {
      sessions: processedSessions,
      filters: {
        availableDays,
        availableTracks,
        availablePillars,
        availableSessionTypes,
        availableSpeakers,
      },
      stats: {
        totalSessions: allSessions.length,
        filteredSessions: processedSessions.length,
      },
    };
  } catch (error) {
    console.error("Error fetching interactive schedule:", error);
    return null;
  }
}

export async function getSessionDetails(sessionId: string, attendeeEmail: string) {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return null;
    }

    const session = await db.query.nxtHerSessions.findFirst({
      where: and(
        eq(nxtHerSessions.id, sessionId),
        eq(nxtHerSessions.eventId, attendee.eventId)
      ),
      with: {
        sessionSpeakers: {
          with: {
            speaker: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if bookmarked
    const bookmark = await db.query.nxtHerSessionBookmarks.findFirst({
      where: and(
        eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
        eq(nxtHerSessionBookmarks.sessionId, sessionId)
      ),
    });

    return {
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
      meetingLink: session.meetingLink,
      maxAttendees: session.maxAttendees,
      speakers: session.sessionSpeakers.map(ss => ({
        id: ss.speaker.id,
        name: ss.speaker.name,
        role: ss.role,
        profilePhotoUrl: ss.speaker.profilePhotoUrl,
        bio: ss.speaker.bio,
        organization: ss.speaker.organization,
        jobTitle: ss.speaker.jobTitle,
        linkedinUrl: ss.speaker.linkedinUrl,
        twitterUrl: ss.speaker.twitterUrl,
        websiteUrl: ss.speaker.websiteUrl,
        expertise: ss.speaker.expertise,
      })),
      isBookmarked: !!bookmark,
      notes: bookmark?.notes || null,
    };
  } catch (error) {
    console.error("Error fetching session details:", error);
    return null;
  }
}