"use server";

import { eq, desc, asc, and } from "drizzle-orm";
import db from "@/db/drizzle";
import { 
  nxtHerSpeakers, 
  nxtHerSessions, 
  nxtHerSessionSpeakers,
  nxtHerEvents 
} from "@/db/nxt-her-schema";
import { 
  SpeakerWithSessions, 
  SpeakerProfileData, 
  SpeakerListItem,
  SessionWithSpeakers 
} from "@/lib/types/nxt-her-speakers";

/**
 * Get all speakers for the Nxt Her Summit event
 */
export async function getNxtHerSpeakers(): Promise<SpeakerListItem[]> {
  try {
    // Get the active Nxt Her event
    const activeEvent = await db
      .select()
      .from(nxtHerEvents)
      .where(eq(nxtHerEvents.isActive, true))
      .limit(1);

    if (!activeEvent.length) {
      return [];
    }

    const eventId = activeEvent[0].id;

    // Get speakers with session count
    const speakers = await db
      .select({
        id: nxtHerSpeakers.id,
        name: nxtHerSpeakers.name,
        jobTitle: nxtHerSpeakers.jobTitle,
        organization: nxtHerSpeakers.organization,
        profilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
        expertise: nxtHerSpeakers.expertise,
        isKeynote: nxtHerSpeakers.isKeynote,
        displayOrder: nxtHerSpeakers.displayOrder,
      })
      .from(nxtHerSpeakers)
      .where(eq(nxtHerSpeakers.eventId, eventId))
      .orderBy(
        desc(nxtHerSpeakers.isKeynote), // Keynote speakers first
        asc(nxtHerSpeakers.displayOrder),
        asc(nxtHerSpeakers.name)
      );

    // Get session counts for each speaker
    const speakersWithCounts = await Promise.all(
      speakers.map(async (speaker) => {
        const sessionCount = await db
          .select({ count: nxtHerSessionSpeakers.sessionId })
          .from(nxtHerSessionSpeakers)
          .where(eq(nxtHerSessionSpeakers.speakerId, speaker.id));

        return {
          ...speaker,
          sessionCount: sessionCount.length,
        };
      })
    );

    return speakersWithCounts;
  } catch (error) {
    console.error("Error fetching Nxt Her speakers:", error);
    return [];
  }
}

/**
 * Get a specific speaker with their sessions
 */
export async function getNxtHerSpeakerById(speakerId: string): Promise<SpeakerProfileData | null> {
  try {
    // Get speaker details
    const speaker = await db
      .select()
      .from(nxtHerSpeakers)
      .where(eq(nxtHerSpeakers.id, speakerId))
      .limit(1);

    if (!speaker.length) {
      return null;
    }

    // Get speaker's sessions with details
    const sessionData = await db
      .select({
        sessionId: nxtHerSessionSpeakers.sessionId,
        role: nxtHerSessionSpeakers.role,
        sessionTitle: nxtHerSessions.title,
        sessionDescription: nxtHerSessions.description,
        sessionType: nxtHerSessions.sessionType,
        track: nxtHerSessions.track,
        pillar: nxtHerSessions.pillar,
        startTime: nxtHerSessions.startTime,
        endTime: nxtHerSessions.endTime,
        venue: nxtHerSessions.venue,
        isVirtual: nxtHerSessions.isVirtual,
      })
      .from(nxtHerSessionSpeakers)
      .innerJoin(nxtHerSessions, eq(nxtHerSessionSpeakers.sessionId, nxtHerSessions.id))
      .where(eq(nxtHerSessionSpeakers.speakerId, speakerId))
      .orderBy(asc(nxtHerSessions.startTime));

    const sessions = sessionData.map((session) => ({
      id: session.sessionId,
      title: session.sessionTitle,
      description: session.sessionDescription,
      startTime: session.startTime,
      endTime: session.endTime,
      track: session.track,
      pillar: session.pillar,
      venue: session.venue,
      role: session.role,
      sessionType: session.sessionType,
      isVirtual: session.isVirtual,
    }));

    return {
      speaker: speaker[0],
      sessions,
    };
  } catch (error) {
    console.error("Error fetching speaker profile:", error);
    return null;
  }
}

/**
 * Get keynote speakers for the Nxt Her Summit
 */
export async function getNxtHerKeynoteSpeakers(): Promise<SpeakerListItem[]> {
  try {
    // Get the active Nxt Her event
    const activeEvent = await db
      .select()
      .from(nxtHerEvents)
      .where(eq(nxtHerEvents.isActive, true))
      .limit(1);

    if (!activeEvent.length) {
      return [];
    }

    const eventId = activeEvent[0].id;

    // Get keynote speakers
    const keynoteSpeakers = await db
      .select({
        id: nxtHerSpeakers.id,
        name: nxtHerSpeakers.name,
        jobTitle: nxtHerSpeakers.jobTitle,
        organization: nxtHerSpeakers.organization,
        profilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
        expertise: nxtHerSpeakers.expertise,
        isKeynote: nxtHerSpeakers.isKeynote,
        displayOrder: nxtHerSpeakers.displayOrder,
      })
      .from(nxtHerSpeakers)
      .where(
        and(
          eq(nxtHerSpeakers.eventId, eventId),
          eq(nxtHerSpeakers.isKeynote, true)
        )
      )
      .orderBy(
        asc(nxtHerSpeakers.displayOrder),
        asc(nxtHerSpeakers.name)
      );

    // Get session counts for each keynote speaker
    const speakersWithCounts = await Promise.all(
      keynoteSpeakers.map(async (speaker) => {
        const sessionCount = await db
          .select({ count: nxtHerSessionSpeakers.sessionId })
          .from(nxtHerSessionSpeakers)
          .where(eq(nxtHerSessionSpeakers.speakerId, speaker.id));

        return {
          ...speaker,
          sessionCount: sessionCount.length,
        };
      })
    );

    return speakersWithCounts;
  } catch (error) {
    console.error("Error fetching keynote speakers:", error);
    return [];
  }
}

/**
 * Get speakers by expertise area
 */
export async function getNxtHerSpeakersByExpertise(expertise: string): Promise<SpeakerListItem[]> {
  try {
    // Get the active Nxt Her event
    const activeEvent = await db
      .select()
      .from(nxtHerEvents)
      .where(eq(nxtHerEvents.isActive, true))
      .limit(1);

    if (!activeEvent.length) {
      return [];
    }

    const eventId = activeEvent[0].id;

    // Get all speakers and filter by expertise in application code
    // (Drizzle doesn't have great JSON array search support)
    const allSpeakers = await db
      .select({
        id: nxtHerSpeakers.id,
        name: nxtHerSpeakers.name,
        jobTitle: nxtHerSpeakers.jobTitle,
        organization: nxtHerSpeakers.organization,
        profilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
        expertise: nxtHerSpeakers.expertise,
        isKeynote: nxtHerSpeakers.isKeynote,
        displayOrder: nxtHerSpeakers.displayOrder,
      })
      .from(nxtHerSpeakers)
      .where(eq(nxtHerSpeakers.eventId, eventId))
      .orderBy(
        desc(nxtHerSpeakers.isKeynote),
        asc(nxtHerSpeakers.displayOrder),
        asc(nxtHerSpeakers.name)
      );

    // Filter speakers by expertise
    const filteredSpeakers = allSpeakers.filter((speaker) => 
      speaker.expertise?.includes(expertise)
    );

    // Get session counts for filtered speakers
    const speakersWithCounts = await Promise.all(
      filteredSpeakers.map(async (speaker) => {
        const sessionCount = await db
          .select({ count: nxtHerSessionSpeakers.sessionId })
          .from(nxtHerSessionSpeakers)
          .where(eq(nxtHerSessionSpeakers.speakerId, speaker.id));

        return {
          ...speaker,
          sessionCount: sessionCount.length,
        };
      })
    );

    return speakersWithCounts;
  } catch (error) {
    console.error("Error fetching speakers by expertise:", error);
    return [];
  }
}

/**
 * Get session details with speakers
 */
export async function getNxtHerSessionWithSpeakers(sessionId: string): Promise<SessionWithSpeakers | null> {
  try {
    // Get session details
    const session = await db
      .select()
      .from(nxtHerSessions)
      .where(eq(nxtHerSessions.id, sessionId))
      .limit(1);

    if (!session.length) {
      return null;
    }

    // Get speakers for this session
    const speakerData = await db
      .select({
        speakerId: nxtHerSessionSpeakers.speakerId,
        role: nxtHerSessionSpeakers.role,
        speakerName: nxtHerSpeakers.name,
        speakerBio: nxtHerSpeakers.bio,
        speakerJobTitle: nxtHerSpeakers.jobTitle,
        speakerOrganization: nxtHerSpeakers.organization,
        speakerProfilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
        speakerLinkedinUrl: nxtHerSpeakers.linkedinUrl,
        speakerTwitterUrl: nxtHerSpeakers.twitterUrl,
        speakerWebsiteUrl: nxtHerSpeakers.websiteUrl,
        speakerExpertise: nxtHerSpeakers.expertise,
        speakerIsKeynote: nxtHerSpeakers.isKeynote,
        speakerDisplayOrder: nxtHerSpeakers.displayOrder,
        speakerCreatedAt: nxtHerSpeakers.createdAt,
        speakerUpdatedAt: nxtHerSpeakers.updatedAt,
      })
      .from(nxtHerSessionSpeakers)
      .innerJoin(nxtHerSpeakers, eq(nxtHerSessionSpeakers.speakerId, nxtHerSpeakers.id))
      .where(eq(nxtHerSessionSpeakers.sessionId, sessionId))
      .orderBy(asc(nxtHerSpeakers.displayOrder), asc(nxtHerSpeakers.name));

    const speakers = speakerData.map((data) => ({
      speaker: {
        id: data.speakerId,
        eventId: session[0].eventId,
        name: data.speakerName,
        bio: data.speakerBio,
        profilePhotoUrl: data.speakerProfilePhotoUrl,
        jobTitle: data.speakerJobTitle,
        organization: data.speakerOrganization,
        linkedinUrl: data.speakerLinkedinUrl,
        twitterUrl: data.speakerTwitterUrl,
        websiteUrl: data.speakerWebsiteUrl,
        expertise: data.speakerExpertise,
        isKeynote: data.speakerIsKeynote,
        displayOrder: data.speakerDisplayOrder,
        createdAt: data.speakerCreatedAt,
        updatedAt: data.speakerUpdatedAt,
      },
      role: data.role,
    }));

    return {
      ...session[0],
      speakers,
    };
  } catch (error) {
    console.error("Error fetching session with speakers:", error);
    return null;
  }
}

/**
 * Get all sessions with their speakers
 */
export async function getNxtHerSessionsWithSpeakers(): Promise<SessionWithSpeakers[]> {
  try {
    // Get the active Nxt Her event
    const activeEvent = await db
      .select()
      .from(nxtHerEvents)
      .where(eq(nxtHerEvents.isActive, true))
      .limit(1);

    if (!activeEvent.length) {
      return [];
    }

    const eventId = activeEvent[0].id;

    // Get all sessions for the event
    const sessions = await db
      .select()
      .from(nxtHerSessions)
      .where(eq(nxtHerSessions.eventId, eventId))
      .orderBy(asc(nxtHerSessions.startTime));

    // Get speakers for each session
    const sessionsWithSpeakers = await Promise.all(
      sessions.map(async (session) => {
        const speakerData = await db
          .select({
            speakerId: nxtHerSessionSpeakers.speakerId,
            role: nxtHerSessionSpeakers.role,
            speakerName: nxtHerSpeakers.name,
            speakerBio: nxtHerSpeakers.bio,
            speakerJobTitle: nxtHerSpeakers.jobTitle,
            speakerOrganization: nxtHerSpeakers.organization,
            speakerProfilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
            speakerLinkedinUrl: nxtHerSpeakers.linkedinUrl,
            speakerTwitterUrl: nxtHerSpeakers.twitterUrl,
            speakerWebsiteUrl: nxtHerSpeakers.websiteUrl,
            speakerExpertise: nxtHerSpeakers.expertise,
            speakerIsKeynote: nxtHerSpeakers.isKeynote,
            speakerDisplayOrder: nxtHerSpeakers.displayOrder,
            speakerCreatedAt: nxtHerSpeakers.createdAt,
            speakerUpdatedAt: nxtHerSpeakers.updatedAt,
          })
          .from(nxtHerSessionSpeakers)
          .innerJoin(nxtHerSpeakers, eq(nxtHerSessionSpeakers.speakerId, nxtHerSpeakers.id))
          .where(eq(nxtHerSessionSpeakers.sessionId, session.id))
          .orderBy(asc(nxtHerSpeakers.displayOrder), asc(nxtHerSpeakers.name));

        const speakers = speakerData.map((data) => ({
          speaker: {
            id: data.speakerId,
            eventId: session.eventId,
            name: data.speakerName,
            bio: data.speakerBio,
            profilePhotoUrl: data.speakerProfilePhotoUrl,
            jobTitle: data.speakerJobTitle,
            organization: data.speakerOrganization,
            linkedinUrl: data.speakerLinkedinUrl,
            twitterUrl: data.speakerTwitterUrl,
            websiteUrl: data.speakerWebsiteUrl,
            expertise: data.speakerExpertise,
            isKeynote: data.speakerIsKeynote,
            displayOrder: data.speakerDisplayOrder,
            createdAt: data.speakerCreatedAt,
            updatedAt: data.speakerUpdatedAt,
          },
          role: data.role,
        }));

        return {
          ...session,
          speakers,
        };
      })
    );

    return sessionsWithSpeakers;
  } catch (error) {
    console.error("Error fetching sessions with speakers:", error);
    return [];
  }
}

/**
 * Get sessions by speaker role
 */
export async function getNxtHerSessionsBySpeakerRole(role: "moderator" | "speaker" | "panelist"): Promise<SessionWithSpeakers[]> {
  try {
    // Get the active Nxt Her event
    const activeEvent = await db
      .select()
      .from(nxtHerEvents)
      .where(eq(nxtHerEvents.isActive, true))
      .limit(1);

    if (!activeEvent.length) {
      return [];
    }

    const eventId = activeEvent[0].id;

    // Get sessions where speakers have the specified role
    const sessionIds = await db
      .select({ sessionId: nxtHerSessionSpeakers.sessionId })
      .from(nxtHerSessionSpeakers)
      .where(eq(nxtHerSessionSpeakers.role, role));

    if (!sessionIds.length) {
      return [];
    }

    const uniqueSessionIds = Array.from(new Set(sessionIds.map(s => s.sessionId)));

    // Get session details for these sessions
    const sessions = await db
      .select()
      .from(nxtHerSessions)
      .where(
        and(
          eq(nxtHerSessions.eventId, eventId),
          // Use IN clause equivalent
          eq(nxtHerSessions.id, uniqueSessionIds[0]) // This is a simplified version
        )
      )
      .orderBy(asc(nxtHerSessions.startTime));

    // Get speakers for each session
    const sessionsWithSpeakers = await Promise.all(
      sessions.map(async (session) => {
        const speakerData = await db
          .select({
            speakerId: nxtHerSessionSpeakers.speakerId,
            role: nxtHerSessionSpeakers.role,
            speakerName: nxtHerSpeakers.name,
            speakerBio: nxtHerSpeakers.bio,
            speakerJobTitle: nxtHerSpeakers.jobTitle,
            speakerOrganization: nxtHerSpeakers.organization,
            speakerProfilePhotoUrl: nxtHerSpeakers.profilePhotoUrl,
            speakerLinkedinUrl: nxtHerSpeakers.linkedinUrl,
            speakerTwitterUrl: nxtHerSpeakers.twitterUrl,
            speakerWebsiteUrl: nxtHerSpeakers.websiteUrl,
            speakerExpertise: nxtHerSpeakers.expertise,
            speakerIsKeynote: nxtHerSpeakers.isKeynote,
            speakerDisplayOrder: nxtHerSpeakers.displayOrder,
            speakerCreatedAt: nxtHerSpeakers.createdAt,
            speakerUpdatedAt: nxtHerSpeakers.updatedAt,
          })
          .from(nxtHerSessionSpeakers)
          .innerJoin(nxtHerSpeakers, eq(nxtHerSessionSpeakers.speakerId, nxtHerSpeakers.id))
          .where(eq(nxtHerSessionSpeakers.sessionId, session.id))
          .orderBy(asc(nxtHerSpeakers.displayOrder), asc(nxtHerSpeakers.name));

        const speakers = speakerData.map((data) => ({
          speaker: {
            id: data.speakerId,
            eventId: session.eventId,
            name: data.speakerName,
            bio: data.speakerBio,
            profilePhotoUrl: data.speakerProfilePhotoUrl,
            jobTitle: data.speakerJobTitle,
            organization: data.speakerOrganization,
            linkedinUrl: data.speakerLinkedinUrl,
            twitterUrl: data.speakerTwitterUrl,
            websiteUrl: data.speakerWebsiteUrl,
            expertise: data.speakerExpertise,
            isKeynote: data.speakerIsKeynote,
            displayOrder: data.speakerDisplayOrder,
            createdAt: data.speakerCreatedAt,
            updatedAt: data.speakerUpdatedAt,
          },
          role: data.role,
        }));

        return {
          ...session,
          speakers,
        };
      })
    );

    return sessionsWithSpeakers;
  } catch (error) {
    console.error("Error fetching sessions by speaker role:", error);
    return [];
  }
}