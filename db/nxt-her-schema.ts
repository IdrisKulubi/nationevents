import {
  timestamp,
  pgTable,
  text,
  integer,
  boolean,
  primaryKey,
  index,
  json,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { type AdapterAccount } from "next-auth/adapters";
import { accounts, employers, jobSeekers } from "./schema";

// Nxt Her Summit Event Table


export const users = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: text("role").$type<"job_seeker" | "employer" | "admin" | "security">().default("job_seeker"),
    emailVerified: timestamp("emailVerified"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastActive: timestamp("last_active").defaultNow().notNull(),
    isOnline: boolean("is_online").default(false),
    profilePhoto: text("profile_photo"),
    phoneNumber: text("phone_number"),
    isActive: boolean("is_active").default(true),
    passwordHash: text("password_hash"), // For credential login
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    roleIdx: index("user_role_idx").on(table.role),
    createdAtIdx: index("user_created_at_idx").on(table.createdAt),
    lastActiveIdx: index("user_last_active_idx").on(table.lastActive),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
	accounts: many(accounts),
	jobSeeker: one(jobSeekers, {
		fields: [users.id],
		references: [jobSeekers.userId],
	}),
  employer: one(employers, {
    fields: [users.id],
    references: [employers.userId],
  }),
}));
export const nxtHerEvents = pgTable(
  "nxt_her_event",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default("Nxt Her Summit"),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    venue: text("venue"),
    isActive: boolean("is_active").default(true),
    branding: json("branding").$type<{
      primaryColor: string;
      secondaryColor: string;
      logoUrl: string;
      bannerUrl: string;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("nxt_her_event_name_idx").on(table.name),
    activeIdx: index("nxt_her_event_active_idx").on(table.isActive),
    dateIdx: index("nxt_her_event_date_idx").on(table.startDate),
  })
);

// Nxt Her Summit Attendees Table
export const nxtHerAttendees = pgTable(
  "nxt_her_attendee",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => nxtHerEvents.id, { onDelete: "cascade" }),
    // Step 1: Personal Details
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    profilePhotoUrl: text("profile_photo_url"),
    country: text("country").notNull(),
    city: text("city").notNull(),
    attendanceType: text("attendance_type").$type<"in_person" | "virtual">().notNull(),
    // Step 2: Professional Details
    organization: text("organization"),
    jobTitle: text("job_title"),
    aboutYou: text("about_you"),
    linkedinProfile: text("linkedin_profile"),
    twitterHandle: text("twitter_handle"),
    website: text("website"),
    topicsOfInterest: json("topics_of_interest").$type<string[]>(),
    areasOfExpertise: json("areas_of_expertise").$type<string[]>(),
    // Consent and Terms
    termsAccepted: boolean("terms_accepted").notNull().default(false),
    infoSharingConsent: boolean("info_sharing_consent").notNull().default(false),
    termsAcceptedAt: timestamp("terms_accepted_at"),
    // Registration metadata
    registrationStatus: text("registration_status").$type<"pending" | "approved" | "rejected">().default("pending"),
    registrationCompletedAt: timestamp("registration_completed_at"),
    // Authentication
    passwordHash: text("password_hash"), // For credential login
    emailVerified: timestamp("email_verified"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("nxt_her_attendee_event_id_idx").on(table.eventId),
    emailIdx: index("nxt_her_attendee_email_idx").on(table.email),
    statusIdx: index("nxt_her_attendee_status_idx").on(table.registrationStatus),
    nameIdx: index("nxt_her_attendee_name_idx").on(table.firstName, table.lastName),
    countryIdx: index("nxt_her_attendee_country_idx").on(table.country),
    attendanceTypeIdx: index("nxt_her_attendee_attendance_type_idx").on(table.attendanceType),
    // Unique constraint on email per event
    emailEventUnique: index("nxt_her_attendee_email_event_unique").on(table.email, table.eventId),
  })
);

// Nxt Her Summit Speakers Table
export const nxtHerSpeakers = pgTable(
  "nxt_her_speaker",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => nxtHerEvents.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bio: text("bio").notNull(),
    profilePhotoUrl: text("profile_photo_url"),
    jobTitle: text("job_title"),
    organization: text("organization"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    websiteUrl: text("website_url"),
    expertise: json("expertise").$type<string[]>(),
    isKeynote: boolean("is_keynote").default(false),
    displayOrder: integer("display_order"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("nxt_her_speaker_event_id_idx").on(table.eventId),
    nameIdx: index("nxt_her_speaker_name_idx").on(table.name),
    keynoteIdx: index("nxt_her_speaker_keynote_idx").on(table.isKeynote),
    displayOrderIdx: index("nxt_her_speaker_display_order_idx").on(table.displayOrder),
  })
);

// Nxt Her Summit Sessions Table
export const nxtHerSessions = pgTable(
  "nxt_her_session",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => nxtHerEvents.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sessionType: text("session_type").$type<"keynote" | "panel" | "workshop" | "networking" | "breakout">(),
    track: text("track"), // e.g., "Building feminist economies"
    pillar: text("pillar"), // e.g., "Leadership", "Innovation"
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    venue: text("venue"),
    maxAttendees: integer("max_attendees"),
    isVirtual: boolean("is_virtual").default(false),
    meetingLink: text("meeting_link"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("nxt_her_session_event_id_idx").on(table.eventId),
    titleIdx: index("nxt_her_session_title_idx").on(table.title),
    typeIdx: index("nxt_her_session_type_idx").on(table.sessionType),
    trackIdx: index("nxt_her_session_track_idx").on(table.track),
    pillarIdx: index("nxt_her_session_pillar_idx").on(table.pillar),
    timeIdx: index("nxt_her_session_time_idx").on(table.startTime),
    virtualIdx: index("nxt_her_session_virtual_idx").on(table.isVirtual),
  })
);

// Nxt Her Summit Session-Speaker Junction Table
export const nxtHerSessionSpeakers = pgTable(
  "nxt_her_session_speaker",
  {
    sessionId: text("session_id").notNull().references(() => nxtHerSessions.id, { onDelete: "cascade" }),
    speakerId: text("speaker_id").notNull().references(() => nxtHerSpeakers.id, { onDelete: "cascade" }),
    role: text("role").$type<"moderator" | "speaker" | "panelist">().default("speaker"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sessionId, table.speakerId] }),
    sessionIdx: index("nxt_her_session_speaker_session_idx").on(table.sessionId),
    speakerIdx: index("nxt_her_session_speaker_speaker_idx").on(table.speakerId),
    roleIdx: index("nxt_her_session_speaker_role_idx").on(table.role),
  })
);

// Nxt Her Summit Networking Profiles Table
export const nxtHerNetworkingProfiles = pgTable(
  "nxt_her_networking_profile",
  {
    id: text("id").primaryKey(),
    attendeeId: text("attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    networkingGoals: json("networking_goals").$type<string[]>(),
    sector: text("sector"),
    region: text("region"),
    interests: json("interests").$type<string[]>(),
    lookingFor: json("looking_for").$type<string[]>(), // mentorship, partnerships, etc.
    availableFor: json("available_for").$type<string[]>(),
    preferredConnectionTypes: json("preferred_connection_types").$type<string[]>(),
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    attendeeIdx: index("nxt_her_networking_profile_attendee_idx").on(table.attendeeId),
    sectorIdx: index("nxt_her_networking_profile_sector_idx").on(table.sector),
    regionIdx: index("nxt_her_networking_profile_region_idx").on(table.region),
    visibleIdx: index("nxt_her_networking_profile_visible_idx").on(table.isVisible),
  })
);

// Nxt Her Summit Connection Suggestions Table
export const nxtHerConnectionSuggestions = pgTable(
  "nxt_her_connection_suggestion",
  {
    id: text("id").primaryKey(),
    fromAttendeeId: text("from_attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    toAttendeeId: text("to_attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    matchScore: decimal("match_score", { precision: 3, scale: 2 }),
    matchReasons: json("match_reasons").$type<string[]>(),
    status: text("status").$type<"suggested" | "viewed" | "connected" | "dismissed">().default("suggested"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    fromAttendeeIdx: index("nxt_her_connection_suggestion_from_idx").on(table.fromAttendeeId),
    toAttendeeIdx: index("nxt_her_connection_suggestion_to_idx").on(table.toAttendeeId),
    statusIdx: index("nxt_her_connection_suggestion_status_idx").on(table.status),
    scoreIdx: index("nxt_her_connection_suggestion_score_idx").on(table.matchScore),
  })
);

// Nxt Her Summit Connections Table
export const nxtHerConnections = pgTable(
  "nxt_her_connection",
  {
    id: text("id").primaryKey(),
    requesterAttendeeId: text("requester_attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    requestedAttendeeId: text("requested_attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    status: text("status").$type<"pending" | "accepted" | "declined">().default("pending"),
    message: text("message"),
    connectedAt: timestamp("connected_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    requesterIdx: index("nxt_her_connection_requester_idx").on(table.requesterAttendeeId),
    requestedIdx: index("nxt_her_connection_requested_idx").on(table.requestedAttendeeId),
    statusIdx: index("nxt_her_connection_status_idx").on(table.status),
    // Unique constraint to prevent duplicate connection requests
    uniqueConnection: index("nxt_her_connection_unique").on(table.requesterAttendeeId, table.requestedAttendeeId),
  })
);

// Nxt Her Summit Forums Table
export const nxtHerForums = pgTable(
  "nxt_her_forum",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => nxtHerEvents.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"), // "Building feminist economies", "Storytelling for impact"
    isActive: boolean("is_active").default(true),
    moderatorIds: json("moderator_ids").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdIdx: index("nxt_her_forum_event_id_idx").on(table.eventId),
    titleIdx: index("nxt_her_forum_title_idx").on(table.title),
    categoryIdx: index("nxt_her_forum_category_idx").on(table.category),
    activeIdx: index("nxt_her_forum_active_idx").on(table.isActive),
  })
);

// Nxt Her Summit Forum Posts Table
export const nxtHerForumPosts = pgTable(
  "nxt_her_forum_post",
  {
    id: text("id").primaryKey(),
    forumId: text("forum_id").notNull().references(() => nxtHerForums.id, { onDelete: "cascade" }),
    authorAttendeeId: text("author_attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    parentPostId: text("parent_post_id").references(() => nxtHerForumPosts.id, { onDelete: "cascade" }),
    isModerated: boolean("is_moderated").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    forumIdx: index("nxt_her_forum_post_forum_idx").on(table.forumId),
    authorIdx: index("nxt_her_forum_post_author_idx").on(table.authorAttendeeId),
    parentIdx: index("nxt_her_forum_post_parent_idx").on(table.parentPostId),
    moderatedIdx: index("nxt_her_forum_post_moderated_idx").on(table.isModerated),
    createdAtIdx: index("nxt_her_forum_post_created_at_idx").on(table.createdAt),
  })
);

// Nxt Her Summit Session Feedback Table
export const nxtHerSessionFeedback = pgTable(
  "nxt_her_session_feedback",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => nxtHerSessions.id, { onDelete: "cascade" }),
    attendeeId: text("attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5 scale
    contentQuality: integer("content_quality"), // 1-5 scale
    speakerRating: integer("speaker_rating"), // 1-5 scale
    relevance: integer("relevance"), // 1-5 scale
    comments: text("comments"),
    wouldRecommend: boolean("would_recommend"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("nxt_her_session_feedback_session_idx").on(table.sessionId),
    attendeeIdx: index("nxt_her_session_feedback_attendee_idx").on(table.attendeeId),
    ratingIdx: index("nxt_her_session_feedback_rating_idx").on(table.rating),
    // Unique constraint to prevent duplicate feedback per session per attendee
    uniqueFeedback: index("nxt_her_session_feedback_unique").on(table.sessionId, table.attendeeId),
  })
);

// Nxt Her Summit Event Feedback Table
export const nxtHerEventFeedback = pgTable(
  "nxt_her_event_feedback",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => nxtHerEvents.id, { onDelete: "cascade" }),
    attendeeId: text("attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    npsScore: integer("nps_score").notNull(), // 0-10 scale
    overallRating: integer("overall_rating").notNull(), // 1-5 scale
    contentQuality: integer("content_quality"), // 1-5 scale
    networkingExperience: integer("networking_experience"), // 1-5 scale
    platformUsability: integer("platform_usability"), // 1-5 scale
    mostValuableAspect: text("most_valuable_aspect"),
    leastValuableAspect: text("least_valuable_aspect"),
    suggestions: text("suggestions"),
    wouldAttendAgain: boolean("would_attend_again"),
    wouldRecommend: boolean("would_recommend"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("nxt_her_event_feedback_event_idx").on(table.eventId),
    attendeeIdx: index("nxt_her_event_feedback_attendee_idx").on(table.attendeeId),
    npsIdx: index("nxt_her_event_feedback_nps_idx").on(table.npsScore),
    overallRatingIdx: index("nxt_her_event_feedback_overall_rating_idx").on(table.overallRating),
    // Unique constraint to prevent duplicate feedback per event per attendee
    uniqueFeedback: index("nxt_her_event_feedback_unique").on(table.eventId, table.attendeeId),
  })
);

// Nxt Her Summit Session Bookmarks Table
export const nxtHerSessionBookmarks = pgTable(
  "nxt_her_session_bookmark",
  {
    id: text("id").primaryKey(),
    attendeeId: text("attendee_id").notNull().references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull().references(() => nxtHerSessions.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    attendeeIdx: index("nxt_her_session_bookmark_attendee_idx").on(table.attendeeId),
    sessionIdx: index("nxt_her_session_bookmark_session_idx").on(table.sessionId),
    // Unique constraint to prevent duplicate bookmarks
    uniqueBookmark: index("nxt_her_session_bookmark_unique").on(table.attendeeId, table.sessionId),
  })
);

// Relations
export const nxtHerEventsRelations = relations(nxtHerEvents, ({ many }) => ({
  attendees: many(nxtHerAttendees),
  speakers: many(nxtHerSpeakers),
  sessions: many(nxtHerSessions),
  forums: many(nxtHerForums),
  eventFeedback: many(nxtHerEventFeedback),
}));

export const nxtHerAttendeesRelations = relations(nxtHerAttendees, ({ one, many }) => ({
  event: one(nxtHerEvents, {
    fields: [nxtHerAttendees.eventId],
    references: [nxtHerEvents.id],
  }),
  networkingProfile: one(nxtHerNetworkingProfiles, {
    fields: [nxtHerAttendees.id],
    references: [nxtHerNetworkingProfiles.attendeeId],
  }),
  connectionRequestsSent: many(nxtHerConnections, {
    relationName: "requester",
  }),
  connectionRequestsReceived: many(nxtHerConnections, {
    relationName: "requested",
  }),
  suggestionsSent: many(nxtHerConnectionSuggestions, {
    relationName: "fromAttendee",
  }),
  suggestionsReceived: many(nxtHerConnectionSuggestions, {
    relationName: "toAttendee",
  }),
  forumPosts: many(nxtHerForumPosts),
  sessionFeedback: many(nxtHerSessionFeedback),
  eventFeedback: many(nxtHerEventFeedback),
  sessionBookmarks: many(nxtHerSessionBookmarks),
}));

export const nxtHerSpeakersRelations = relations(nxtHerSpeakers, ({ one, many }) => ({
  event: one(nxtHerEvents, {
    fields: [nxtHerSpeakers.eventId],
    references: [nxtHerEvents.id],
  }),
  sessionSpeakers: many(nxtHerSessionSpeakers),
}));

export const nxtHerSessionsRelations = relations(nxtHerSessions, ({ one, many }) => ({
  event: one(nxtHerEvents, {
    fields: [nxtHerSessions.eventId],
    references: [nxtHerEvents.id],
  }),
  sessionSpeakers: many(nxtHerSessionSpeakers),
  sessionFeedback: many(nxtHerSessionFeedback),
  sessionBookmarks: many(nxtHerSessionBookmarks),
}));

export const nxtHerSessionSpeakersRelations = relations(nxtHerSessionSpeakers, ({ one }) => ({
  session: one(nxtHerSessions, {
    fields: [nxtHerSessionSpeakers.sessionId],
    references: [nxtHerSessions.id],
  }),
  speaker: one(nxtHerSpeakers, {
    fields: [nxtHerSessionSpeakers.speakerId],
    references: [nxtHerSpeakers.id],
  }),
}));

export const nxtHerNetworkingProfilesRelations = relations(nxtHerNetworkingProfiles, ({ one }) => ({
  attendee: one(nxtHerAttendees, {
    fields: [nxtHerNetworkingProfiles.attendeeId],
    references: [nxtHerAttendees.id],
  }),
}));

export const nxtHerConnectionSuggestionsRelations = relations(nxtHerConnectionSuggestions, ({ one }) => ({
  fromAttendee: one(nxtHerAttendees, {
    fields: [nxtHerConnectionSuggestions.fromAttendeeId],
    references: [nxtHerAttendees.id],
    relationName: "fromAttendee",
  }),
  toAttendee: one(nxtHerAttendees, {
    fields: [nxtHerConnectionSuggestions.toAttendeeId],
    references: [nxtHerAttendees.id],
    relationName: "toAttendee",
  }),
}));

export const nxtHerConnectionsRelations = relations(nxtHerConnections, ({ one }) => ({
  requester: one(nxtHerAttendees, {
    fields: [nxtHerConnections.requesterAttendeeId],
    references: [nxtHerAttendees.id],
    relationName: "requester",
  }),
  requested: one(nxtHerAttendees, {
    fields: [nxtHerConnections.requestedAttendeeId],
    references: [nxtHerAttendees.id],
    relationName: "requested",
  }),
}));

export const nxtHerForumsRelations = relations(nxtHerForums, ({ one, many }) => ({
  event: one(nxtHerEvents, {
    fields: [nxtHerForums.eventId],
    references: [nxtHerEvents.id],
  }),
  posts: many(nxtHerForumPosts),
}));

export const nxtHerForumPostsRelations = relations(nxtHerForumPosts, ({ one, many }) => ({
  forum: one(nxtHerForums, {
    fields: [nxtHerForumPosts.forumId],
    references: [nxtHerForums.id],
  }),
  author: one(nxtHerAttendees, {
    fields: [nxtHerForumPosts.authorAttendeeId],
    references: [nxtHerAttendees.id],
  }),
  parentPost: one(nxtHerForumPosts, {
    fields: [nxtHerForumPosts.parentPostId],
    references: [nxtHerForumPosts.id],
    relationName: "parentPost",
  }),
  replies: many(nxtHerForumPosts, {
    relationName: "parentPost",
  }),
}));

export const nxtHerSessionFeedbackRelations = relations(nxtHerSessionFeedback, ({ one }) => ({
  session: one(nxtHerSessions, {
    fields: [nxtHerSessionFeedback.sessionId],
    references: [nxtHerSessions.id],
  }),
  attendee: one(nxtHerAttendees, {
    fields: [nxtHerSessionFeedback.attendeeId],
    references: [nxtHerAttendees.id],
  }),
}));

export const nxtHerEventFeedbackRelations = relations(nxtHerEventFeedback, ({ one }) => ({
  event: one(nxtHerEvents, {
    fields: [nxtHerEventFeedback.eventId],
    references: [nxtHerEvents.id],
  }),
  attendee: one(nxtHerAttendees, {
    fields: [nxtHerEventFeedback.attendeeId],
    references: [nxtHerAttendees.id],
  }),
}));

export const nxtHerSessionBookmarksRelations = relations(nxtHerSessionBookmarks, ({ one }) => ({
  attendee: one(nxtHerAttendees, {
    fields: [nxtHerSessionBookmarks.attendeeId],
    references: [nxtHerAttendees.id],
  }),
  session: one(nxtHerSessions, {
    fields: [nxtHerSessionBookmarks.sessionId],
    references: [nxtHerSessions.id],
  }),
}));

// NextAuth.js adapter tables for Nxt Her Summit
export const nxtHerAccounts = pgTable(
  "nxt_her_account",
  {
    userId: text("userId")
      .notNull()
      .references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const nxtHerAuthSessions = pgTable("nxt_her_auth_session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => nxtHerAttendees.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const nxtHerVerificationTokens = pgTable(
  "nxt_her_verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);