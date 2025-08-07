import { eq, and, desc, asc, gte, lte, inArray, or } from "drizzle-orm";
import db from "@/db/drizzle";
import {
  nxtHerAttendees,
  nxtHerSessions,
  nxtHerSessionSpeakers,
  nxtHerSpeakers,
  nxtHerSessionBookmarks,
} from "@/db/nxt-her-schema";

export interface AgendaSession {
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
  speakers: Array<{
    id: string;
    name: string;
    role: string;
    profilePhotoUrl: string | null;
  }>;
  isBookmarked: boolean;
  hasConflict: boolean;
  relevanceScore: number;
  matchReasons: string[];
}

export interface PersonalizedAgenda {
  sessions: AgendaSession[];
  bookmarkedSessions: AgendaSession[];
  conflictingSessions: Array<{
    timeSlot: string;
    sessions: AgendaSession[];
  }>;
  recommendedSessions: AgendaSession[];
  stats: {
    totalSessions: number;
    bookmarkedSessions: number;
    conflictingSessions: number;
  };
}

export async function getPersonalizedAgenda(attendeeEmail: string): Promise<PersonalizedAgenda | null> {
  try {
    // Get attendee data with interests
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return null;
    }

    // Get all sessions for the event
    const allSessions = await db.query.nxtHerSessions.findMany({
      where: eq(nxtHerSessions.eventId, attendee.eventId),
      orderBy: [asc(nxtHerSessions.startTime)],
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

    // Calculate relevance scores and detect conflicts
    const processedSessions: AgendaSession[] = allSessions.map(session => {
      const relevanceScore = calculateRelevanceScore(session, attendee);
      const matchReasons = getMatchReasons(session, attendee);
      
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
        speakers: session.sessionSpeakers.map(ss => ({
          id: ss.speaker.id,
          name: ss.speaker.name,
          role: ss.role,
          profilePhotoUrl: ss.speaker.profilePhotoUrl,
        })),
        isBookmarked: bookmarkedSessionIds.has(session.id),
        hasConflict: false, // Will be calculated below
        relevanceScore,
        matchReasons,
      };
    });

    // Detect time conflicts
    const conflictingSessions = detectTimeConflicts(processedSessions);
    
    // Mark sessions with conflicts
    processedSessions.forEach(session => {
      session.hasConflict = conflictingSessions.some(conflict => 
        conflict.sessions.some(s => s.id === session.id)
      );
    });

    // Filter sessions by categories
    const bookmarkedSessionsList = processedSessions.filter(s => s.isBookmarked);
    const recommendedSessions = processedSessions
      .filter(s => s.relevanceScore > 0.5 && !s.isBookmarked)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    return {
      sessions: processedSessions,
      bookmarkedSessions: bookmarkedSessionsList,
      conflictingSessions,
      recommendedSessions,
      stats: {
        totalSessions: processedSessions.length,
        bookmarkedSessions: bookmarkedSessionsList.length,
        conflictingSessions: conflictingSessions.length,
      },
    };
  } catch (error) {
    console.error("Error fetching personalized agenda:", error);
    return null;
  }
}

function calculateRelevanceScore(session: any, attendee: any): number {
  let score = 0;
  const maxScore = 1.0;

  // Base score for all sessions
  score += 0.1;

  // Match topics of interest
  if (attendee.topicsOfInterest && session.track) {
    const interests = attendee.topicsOfInterest as string[];
    if (interests.some(interest => 
      session.track.toLowerCase().includes(interest.toLowerCase()) ||
      session.title.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 0.3;
    }
  }

  // Match areas of expertise
  if (attendee.areasOfExpertise && session.pillar) {
    const expertise = attendee.areasOfExpertise as string[];
    if (expertise.some(area => 
      session.pillar.toLowerCase().includes(area.toLowerCase()) ||
      session.title.toLowerCase().includes(area.toLowerCase())
    )) {
      score += 0.2;
    }
  }

  // Boost keynote sessions
  if (session.sessionType === 'keynote') {
    score += 0.2;
  }

  // Boost sessions matching attendance type
  if (attendee.attendanceType === 'virtual' && session.isVirtual) {
    score += 0.1;
  } else if (attendee.attendanceType === 'in_person' && !session.isVirtual) {
    score += 0.1;
  }

  // Match description content
  if (session.description && attendee.topicsOfInterest) {
    const interests = attendee.topicsOfInterest as string[];
    const descriptionLower = session.description.toLowerCase();
    const matchingInterests = interests.filter(interest => 
      descriptionLower.includes(interest.toLowerCase())
    );
    score += matchingInterests.length * 0.05;
  }

  return Math.min(score, maxScore);
}

function getMatchReasons(session: any, attendee: any): string[] {
  const reasons: string[] = [];

  // Check topic matches
  if (attendee.topicsOfInterest && session.track) {
    const interests = attendee.topicsOfInterest as string[];
    const matchingInterests = interests.filter(interest => 
      session.track.toLowerCase().includes(interest.toLowerCase()) ||
      session.title.toLowerCase().includes(interest.toLowerCase())
    );
    if (matchingInterests.length > 0) {
      reasons.push(`Matches your interest in ${matchingInterests[0]}`);
    }
  }

  // Check expertise matches
  if (attendee.areasOfExpertise && session.pillar) {
    const expertise = attendee.areasOfExpertise as string[];
    const matchingExpertise = expertise.filter(area => 
      session.pillar.toLowerCase().includes(area.toLowerCase()) ||
      session.title.toLowerCase().includes(area.toLowerCase())
    );
    if (matchingExpertise.length > 0) {
      reasons.push(`Aligns with your expertise in ${matchingExpertise[0]}`);
    }
  }

  // Check session type
  if (session.sessionType === 'keynote') {
    reasons.push('Keynote session');
  }

  // Check attendance type match
  if (attendee.attendanceType === 'virtual' && session.isVirtual) {
    reasons.push('Virtual session (matches your preference)');
  } else if (attendee.attendanceType === 'in_person' && !session.isVirtual) {
    reasons.push('In-person session (matches your preference)');
  }

  return reasons;
}

function detectTimeConflicts(sessions: AgendaSession[]): Array<{
  timeSlot: string;
  sessions: AgendaSession[];
}> {
  const conflicts: Array<{
    timeSlot: string;
    sessions: AgendaSession[];
  }> = [];

  // Group sessions by time slots
  const timeSlots = new Map<string, AgendaSession[]>();

  sessions.forEach(session => {
    const timeKey = `${session.startTime.getTime()}-${session.endTime.getTime()}`;
    if (!timeSlots.has(timeKey)) {
      timeSlots.set(timeKey, []);
    }
    timeSlots.get(timeKey)!.push(session);
  });

  // Find overlapping sessions
  const sessionsByTime = Array.from(sessions).sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  );

  for (let i = 0; i < sessionsByTime.length; i++) {
    const currentSession = sessionsByTime[i];
    const overlappingSessions = [currentSession];

    for (let j = i + 1; j < sessionsByTime.length; j++) {
      const otherSession = sessionsByTime[j];
      
      // Check if sessions overlap
      if (
        (currentSession.startTime < otherSession.endTime && 
         currentSession.endTime > otherSession.startTime) ||
        (otherSession.startTime < currentSession.endTime && 
         otherSession.endTime > currentSession.startTime)
      ) {
        overlappingSessions.push(otherSession);
      }
    }

    // Only add if there are actual conflicts (more than 1 session)
    if (overlappingSessions.length > 1) {
      const timeSlot = `${currentSession.startTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${currentSession.endTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;

      // Check if this conflict is already recorded
      const existingConflict = conflicts.find(c => 
        c.sessions.some(s => s.id === currentSession.id)
      );

      if (!existingConflict) {
        conflicts.push({
          timeSlot,
          sessions: overlappingSessions,
        });
      }
    }
  }

  return conflicts;
}

export async function toggleSessionBookmark(attendeeEmail: string, sessionId: string): Promise<boolean> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return false;
    }

    // Check if bookmark exists
    const existingBookmark = await db.query.nxtHerSessionBookmarks.findFirst({
      where: and(
        eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
        eq(nxtHerSessionBookmarks.sessionId, sessionId)
      ),
    });

    if (existingBookmark) {
      // Remove bookmark
      await db.delete(nxtHerSessionBookmarks)
        .where(and(
          eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
          eq(nxtHerSessionBookmarks.sessionId, sessionId)
        ));
      return false; // Bookmark removed
    } else {
      // Add bookmark
      await db.insert(nxtHerSessionBookmarks).values({
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        attendeeId: attendee.id,
        sessionId: sessionId,
        notes: null,
      });
      return true; // Bookmark added
    }
  } catch (error) {
    console.error("Error toggling session bookmark:", error);
    return false;
  }
}

export async function updateSessionNotes(
  attendeeEmail: string, 
  sessionId: string, 
  notes: string
): Promise<boolean> {
  try {
    const attendee = await db.query.nxtHerAttendees.findFirst({
      where: eq(nxtHerAttendees.email, attendeeEmail),
    });

    if (!attendee) {
      return false;
    }

    // Check if bookmark exists
    const existingBookmark = await db.query.nxtHerSessionBookmarks.findFirst({
      where: and(
        eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
        eq(nxtHerSessionBookmarks.sessionId, sessionId)
      ),
    });

    if (existingBookmark) {
      // Update notes
      await db.update(nxtHerSessionBookmarks)
        .set({ notes })
        .where(and(
          eq(nxtHerSessionBookmarks.attendeeId, attendee.id),
          eq(nxtHerSessionBookmarks.sessionId, sessionId)
        ));
      return true;
    } else {
      // Create bookmark with notes
      await db.insert(nxtHerSessionBookmarks).values({
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        attendeeId: attendee.id,
        sessionId: sessionId,
        notes,
      });
      return true;
    }
  } catch (error) {
    console.error("Error updating session notes:", error);
    return false;
  }
}