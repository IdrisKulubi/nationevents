// Types for Nxt Her Summit Speaker Management

export interface NxtHerSpeaker {
  id: string;
  eventId: string;
  name: string;
  bio: string;
  profilePhotoUrl?: string;
  jobTitle?: string;
  organization?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  expertise?: string[];
  isKeynote: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NxtHerSession {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  sessionType?: "keynote" | "panel" | "workshop" | "networking" | "breakout";
  track?: string;
  pillar?: string;
  startTime: Date;
  endTime: Date;
  venue?: string;
  maxAttendees?: number;
  isVirtual: boolean;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NxtHerSessionSpeaker {
  sessionId: string;
  speakerId: string;
  role: "moderator" | "speaker" | "panelist";
  createdAt: Date;
}

export interface SpeakerWithSessions extends NxtHerSpeaker {
  sessions: Array<{
    session: NxtHerSession;
    role: "moderator" | "speaker" | "panelist";
  }>;
}

export interface SessionWithSpeakers extends NxtHerSession {
  speakers: Array<{
    speaker: NxtHerSpeaker;
    role: "moderator" | "speaker" | "panelist";
  }>;
}

export interface SpeakerProfileData {
  speaker: NxtHerSpeaker;
  sessions: Array<{
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    track?: string;
    pillar?: string;
    venue?: string;
    role: "moderator" | "speaker" | "panelist";
    sessionType?: "keynote" | "panel" | "workshop" | "networking" | "breakout";
    isVirtual: boolean;
  }>;
}

export interface SpeakerListItem {
  id: string;
  name: string;
  jobTitle?: string;
  organization?: string;
  profilePhotoUrl?: string;
  expertise?: string[];
  isKeynote: boolean;
  sessionCount: number;
}