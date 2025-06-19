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
import { type AdapterAccount } from "next-auth/adapters";

// Enhanced Users table with all roles
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

// Job Seekers Profile
export const jobSeekers = pgTable(
  "job_seeker",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    cvUrl: text("cv_url"),
    additionalDocuments: json("additional_documents").$type<Array<{
      id: string;
      name: string;
      url: string;
      uploadKey: string;
      uploadedAt: string;
      fileSize?: number;
      fileType?: string;
    }>>(),
    skills: json("skills").$type<string[]>(),
    experience: text("experience"),
    education: text("education"),
    pin: text("pin").unique(), // 6-digit PIN for verification
    ticketNumber: text("ticket_number").unique(),
    registrationStatus: text("registration_status").$type<"pending" | "approved" | "rejected">().default("pending"),
    interestCategories: json("interest_categories").$type<string[]>(),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    expectedSalary: decimal("expected_salary"),
    availableFrom: timestamp("available_from"),
    pinGeneratedAt: timestamp("pin_generated_at"), // Track when PIN was generated
    pinExpiresAt: timestamp("pin_expires_at"), // PIN expiration time
    // New fields for assignment tracking
    assignmentStatus: text("assignment_status").$type<"unassigned" | "assigned" | "confirmed" | "completed">().default("unassigned"),
    priorityLevel: text("priority_level").$type<"low" | "normal" | "high">().default("normal"),
    // Huawei Student Certification tracking
    isHuaweiStudent: boolean("is_huawei_student").default(false),
    huaweiCertificationLevel: text("huawei_certification_level").$type<"HCIA" | "HCIP" | "HCIE" | "other">(),
    huaweiCertificationDetails: json("huawei_certification_details").$type<Array<{
      certificationName: string;
      certificationId: string;
      issueDate: string;
      expiryDate?: string;
      level: string;
      status: "active" | "expired" | "pending";
    }>>(),
    huaweiStudentId: text("huawei_student_id"), // Huawei student ID number
    // Conference attendance tracking
    wantsToAttendConference: boolean("wants_to_attend_conference").default(false),
    conferenceRegistrationDate: timestamp("conference_registration_date"),
    conferenceAttendanceStatus: text("conference_attendance_status").$type<"registered" | "confirmed" | "attended" | "no_show" | "cancelled">(),
    conferencePreferences: json("conference_preferences").$type<{
      sessionInterests?: string[];
      dietaryRequirements?: string;
      accessibilityNeeds?: string;
      networkingInterests?: string[];
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("job_seeker_user_id_idx").on(table.userId),
    pinIdx: index("job_seeker_pin_idx").on(table.pin),
    ticketNumberIdx: index("job_seeker_ticket_number_idx").on(table.ticketNumber),
    statusIdx: index("job_seeker_status_idx").on(table.registrationStatus),
    assignmentStatusIdx: index("job_seeker_assignment_status_idx").on(table.assignmentStatus),
    huaweiStudentIdx: index("job_seeker_huawei_student_idx").on(table.isHuaweiStudent),
    huaweiStudentIdIdx: index("job_seeker_huawei_student_id_idx").on(table.huaweiStudentId),
    conferenceAttendanceIdx: index("job_seeker_conference_attendance_idx").on(table.wantsToAttendConference),
    conferenceStatusIdx: index("job_seeker_conference_status_idx").on(table.conferenceAttendanceStatus),
  })
);

// Employers/Companies
export const employers = pgTable(
  "employer",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    companyDescription: text("company_description"),
    industry: text("industry"),
    companySize: text("company_size").$type<"startup" | "small" | "medium" | "large" | "enterprise">(),
    website: text("website"),
    logoUrl: text("logo_url"),
    address: text("address"),
    contactPerson: text("contact_person"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("employer_user_id_idx").on(table.userId),
    companyNameIdx: index("employer_company_name_idx").on(table.companyName),
    verifiedIdx: index("employer_verified_idx").on(table.isVerified),
  })
);

// Events
export const events = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    venue: text("venue").notNull(),
    address: text("address"),
    maxAttendees: integer("max_attendees"),
    registrationDeadline: timestamp("registration_deadline"),
    isActive: boolean("is_active").default(true),
    eventType: text("event_type").$type<"job_fair" | "career_expo" | "networking" | "conference">().default("job_fair"),
    // Conference specific fields
    hasConference: boolean("has_conference").default(false),
    conferenceStartDate: timestamp("conference_start_date"),
    conferenceEndDate: timestamp("conference_end_date"),
    conferenceVenue: text("conference_venue"),
    conferenceMaxAttendees: integer("conference_max_attendees"),
    conferenceRegistrationDeadline: timestamp("conference_registration_deadline"),
    conferenceDescription: text("conference_description"),
    conferenceSessions: json("conference_sessions").$type<Array<{
      id: string;
      title: string;
      description: string;
      speaker: string;
      startTime: string;
      endTime: string;
      venue: string;
      maxAttendees?: number;
    }>>(),
    createdBy: text("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("event_name_idx").on(table.name),
    dateIdx: index("event_date_idx").on(table.startDate),
    activeIdx: index("event_active_idx").on(table.isActive),
    eventTypeIdx: index("event_type_idx").on(table.eventType),
    hasConferenceIdx: index("event_has_conference_idx").on(table.hasConference),
    conferenceDateIdx: index("event_conference_date_idx").on(table.conferenceStartDate),
  })
);

// Job Positions
export const jobs = pgTable(
  "job",
  {
    id: text("id").primaryKey(),
    employerId: text("employer_id").notNull().references(() => employers.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    requirements: json("requirements").$type<string[]>(),
    benefits: json("benefits").$type<string[]>(),
    salaryRange: text("salary_range"),
    jobType: text("job_type").$type<"full_time" | "part_time" | "contract" | "internship">(),
    location: text("location"),
    category: text("category"),
    experienceLevel: text("experience_level").$type<"entry" | "mid" | "senior" | "executive">(),
    isActive: boolean("is_active").default(true),
    applicationDeadline: timestamp("application_deadline"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    employerIdx: index("job_employer_idx").on(table.employerId),
    eventIdx: index("job_event_idx").on(table.eventId),
    categoryIdx: index("job_category_idx").on(table.category),
    activeIdx: index("job_active_idx").on(table.isActive),
  })
);

// Booths
export const booths = pgTable(
  "booth",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    employerId: text("employer_id").notNull().references(() => employers.id, { onDelete: "cascade" }),
    boothNumber: text("booth_number").notNull(),
    location: text("location"),
    size: text("size").$type<"small" | "medium" | "large">(),
    equipment: json("equipment").$type<string[]>(),
    specialRequirements: text("special_requirements"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("booth_event_idx").on(table.eventId),
    employerIdx: index("booth_employer_idx").on(table.employerId),
    boothNumberIdx: index("booth_number_idx").on(table.boothNumber),
  })
);

// Interview Slots
export const interviewSlots = pgTable(
  "interview_slot",
  {
    id: text("id").primaryKey(),
    boothId: text("booth_id").notNull().references(() => booths.id, { onDelete: "cascade" }),
    jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    duration: integer("duration").default(30), // minutes
    isBooked: boolean("is_booked").default(false),
    interviewerName: text("interviewer_name"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    boothIdx: index("interview_slot_booth_idx").on(table.boothId),
    timeIdx: index("interview_slot_time_idx").on(table.startTime),
    bookedIdx: index("interview_slot_booked_idx").on(table.isBooked),
  })
);

// Interview Bookings
export const interviewBookings = pgTable(
  "interview_booking",
  {
    id: text("id").primaryKey(),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    interviewSlotId: text("interview_slot_id").notNull().references(() => interviewSlots.id, { onDelete: "cascade" }),
    status: text("status").$type<"scheduled" | "confirmed" | "completed" | "cancelled" | "no_show">().default("scheduled"),
    notes: text("notes"),
    feedback: text("feedback"),
    rating: integer("rating"), // 1-5 scale
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    jobSeekerIdx: index("interview_booking_job_seeker_idx").on(table.jobSeekerId),
    slotIdx: index("interview_booking_slot_idx").on(table.interviewSlotId),
    statusIdx: index("interview_booking_status_idx").on(table.status),
  })
);

// Security Personnel
export const securityPersonnel = pgTable(
  "security_personnel",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeNumber: text("badge_number").unique(),
    department: text("department"),
    clearanceLevel: text("clearance_level").$type<"basic" | "intermediate" | "advanced">().default("basic"),
    assignedCheckpoints: json("assigned_checkpoints").$type<string[]>(),
    isOnDuty: boolean("is_on_duty").default(false),
    shiftStart: timestamp("shift_start"),
    shiftEnd: timestamp("shift_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("security_user_id_idx").on(table.userId),
    badgeIdx: index("security_badge_idx").on(table.badgeNumber),
    dutyIdx: index("security_duty_idx").on(table.isOnDuty),
  })
);

// Checkpoints
export const checkpoints = pgTable(
  "checkpoint",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    location: text("location").notNull(),
    checkpointType: text("checkpoint_type").$type<"entry" | "exit" | "booth_area" | "main_hall" | "registration">().default("entry"),
    isActive: boolean("is_active").default(true),
    requiresVerification: boolean("requires_verification").default(true),
    maxCapacity: integer("max_capacity"),
    currentOccupancy: integer("current_occupancy").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("checkpoint_event_idx").on(table.eventId),
    typeIdx: index("checkpoint_type_idx").on(table.checkpointType),
    activeIdx: index("checkpoint_active_idx").on(table.isActive),
  })
);

// Attendance/Check-ins
export const attendanceRecords = pgTable(
  "attendance_record",
  {
    id: text("id").primaryKey(),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    checkpointId: text("checkpoint_id").references(() => checkpoints.id, { onDelete: "set null" }),
    verifiedBy: text("verified_by").references(() => securityPersonnel.id, { onDelete: "set null" }),
    checkInTime: timestamp("check_in_time").defaultNow().notNull(),
    checkOutTime: timestamp("check_out_time"),
    verificationMethod: text("verification_method").$type<"pin" | "ticket_number" | "manual">().notNull(),
    verificationData: text("verification_data"), // PIN or ticket number used
    status: text("status").$type<"checked_in" | "checked_out" | "flagged">().default("checked_in"),
    notes: text("notes"),
    ipAddress: text("ip_address"),
    deviceInfo: text("device_info"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    jobSeekerIdx: index("attendance_job_seeker_idx").on(table.jobSeekerId),
    eventIdx: index("attendance_event_idx").on(table.eventId),
    checkpointIdx: index("attendance_checkpoint_idx").on(table.checkpointId),
    timeIdx: index("attendance_time_idx").on(table.checkInTime),
    verifiedByIdx: index("attendance_verified_by_idx").on(table.verifiedBy),
  })
);

// Security Incidents
export const securityIncidents = pgTable(
  "security_incident",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    reportedBy: text("reported_by").notNull().references(() => securityPersonnel.id, { onDelete: "cascade" }),
    incidentType: text("incident_type").$type<"unauthorized_access" | "suspicious_activity" | "emergency" | "technical_issue" | "other">().notNull(),
    severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
    location: text("location").notNull(),
    description: text("description").notNull(),
    involvedPersons: json("involved_persons").$type<string[]>(), // User IDs
    actionTaken: text("action_taken"),
    status: text("status").$type<"open" | "investigating" | "resolved" | "closed">().default("open"),
    resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    attachments: json("attachments").$type<string[]>(), // File URLs
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("incident_event_idx").on(table.eventId),
    reportedByIdx: index("incident_reported_by_idx").on(table.reportedBy),
    severityIdx: index("incident_severity_idx").on(table.severity),
    statusIdx: index("incident_status_idx").on(table.status),
    createdAtIdx: index("incident_created_at_idx").on(table.createdAt),
  })
);

// Feedback
export const feedback = pgTable(
  "feedback",
  {
    id: text("id").primaryKey(),
    fromUserId: text("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id").references(() => users.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    interviewBookingId: text("interview_booking_id").references(() => interviewBookings.id, { onDelete: "cascade" }),
    feedbackType: text("feedback_type").$type<"interview" | "event" | "system" | "employer" | "job_seeker">().notNull(),
    rating: integer("rating"), // 1-5 scale
    comment: text("comment"),
    isAnonymous: boolean("is_anonymous").default(false),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    fromUserIdx: index("feedback_from_user_idx").on(table.fromUserId),
    toUserIdx: index("feedback_to_user_idx").on(table.toUserId),
    eventIdx: index("feedback_event_idx").on(table.eventId),
    typeIdx: index("feedback_type_idx").on(table.feedbackType),
  })
);

// Job Applications
export const jobApplications = pgTable(
  "job_application",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    status: text("status").$type<"applied" | "reviewed" | "shortlisted" | "interview_scheduled" | "interviewed" | "offered" | "rejected" | "withdrawn">().default("applied"),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    rating: integer("rating"), // 1-5 scale
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    jobIdx: index("job_application_job_idx").on(table.jobId),
    jobSeekerIdx: index("job_application_job_seeker_idx").on(table.jobSeekerId),
    statusIdx: index("job_application_status_idx").on(table.status),
    appliedAtIdx: index("job_application_applied_at_idx").on(table.appliedAt),
    reviewedByIdx: index("job_application_reviewed_by_idx").on(table.reviewedBy),
  })
);

// Shortlists
export const shortlists = pgTable(
  "shortlist",
  {
    id: text("id").primaryKey(),
    employerId: text("employer_id").notNull().references(() => employers.id, { onDelete: "cascade" }),
    jobId: text("job_id").references(() => jobs.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    listName: text("list_name").notNull().default("Main Shortlist"),
    status: text("status").$type<"interested" | "maybe" | "not_interested" | "contacted" | "interviewed" | "offered">().default("interested"),
    priority: text("priority").$type<"high" | "medium" | "low">().default("medium"),
    notes: text("notes"),
    tags: json("tags").$type<string[]>(),
    addedBy: text("added_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    employerIdx: index("shortlist_employer_idx").on(table.employerId),
    jobIdx: index("shortlist_job_idx").on(table.jobId),
    jobSeekerIdx: index("shortlist_job_seeker_idx").on(table.jobSeekerId),
    statusIdx: index("shortlist_status_idx").on(table.status),
    priorityIdx: index("shortlist_priority_idx").on(table.priority),
    addedByIdx: index("shortlist_added_by_idx").on(table.addedBy),
  })
);

// Real-time candidate tracking
export const candidateInteractions = pgTable(
  "candidate_interaction",
  {
    id: text("id").primaryKey(),
    employerId: text("employer_id").notNull().references(() => employers.id, { onDelete: "cascade" }),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }),
    interactionType: text("interaction_type").$type<"booth_visit" | "cv_viewed" | "contact_info_accessed" | "interview_scheduled" | "note_added" | "shortlisted">().notNull(),
    duration: integer("duration"), // in minutes for booth visits
    notes: text("notes"),
    rating: integer("rating"), // 1-5 scale
    metadata: json("metadata"), // Additional data like specific booth, time spent, etc.
    performedBy: text("performed_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    employerIdx: index("candidate_interaction_employer_idx").on(table.employerId),
    jobSeekerIdx: index("candidate_interaction_job_seeker_idx").on(table.jobSeekerId),
    eventIdx: index("candidate_interaction_event_idx").on(table.eventId),
    typeIdx: index("candidate_interaction_type_idx").on(table.interactionType),
    performedByIdx: index("candidate_interaction_performed_by_idx").on(table.performedBy),
    createdAtIdx: index("candidate_interaction_created_at_idx").on(table.createdAt),
  })
);

// Notifications
export const notifications = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").$type<"info" | "success" | "warning" | "error" | "security_alert">().default("info"),
    isRead: boolean("is_read").default(false),
    actionUrl: text("action_url"),
    metadata: json("metadata"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notification_user_idx").on(table.userId),
    readIdx: index("notification_read_idx").on(table.isRead),
    typeIdx: index("notification_type_idx").on(table.type),
    createdAtIdx: index("notification_created_at_idx").on(table.createdAt),
  })
);

// System Logs
export const systemLogs = pgTable(
  "system_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    details: json("details"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    success: boolean("success").default(true),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("system_log_user_idx").on(table.userId),
    actionIdx: index("system_log_action_idx").on(table.action),
    resourceIdx: index("system_log_resource_idx").on(table.resource),
    createdAtIdx: index("system_log_created_at_idx").on(table.createdAt),
  })
);

// Auth.js tables (preserved from original)
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Booth Assignments - New table for manual booth assignments
export const boothAssignments = pgTable(
  "booth_assignment",
  {
    id: text("id").primaryKey(),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    boothId: text("booth_id").notNull().references(() => booths.id, { onDelete: "cascade" }),
    interviewSlotId: text("interview_slot_id").references(() => interviewSlots.id, { onDelete: "set null" }),
    assignedBy: text("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }), // Admin who made assignment
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    status: text("status").$type<"assigned" | "confirmed" | "completed" | "cancelled" | "no_show">().default("assigned"),
    interviewDate: timestamp("interview_date"),
    interviewTime: text("interview_time"), // e.g., "10:00 AM - 10:30 AM"
    notes: text("notes"),
    priority: text("priority").$type<"high" | "medium" | "low">().default("medium"),
    notificationSent: boolean("notification_sent").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    jobSeekerIdx: index("booth_assignment_job_seeker_idx").on(table.jobSeekerId),
    boothIdx: index("booth_assignment_booth_idx").on(table.boothId),
    assignedByIdx: index("booth_assignment_assigned_by_idx").on(table.assignedBy),
    statusIdx: index("booth_assignment_status_idx").on(table.status),
    dateIdx: index("booth_assignment_date_idx").on(table.interviewDate),
  })
);

// Bulk Notifications - New table for managing bulk email/SMS campaigns
export const bulkNotifications = pgTable(
  "bulk_notification",
  {
    id: text("id").primaryKey(),
    campaignName: text("campaign_name").notNull(),
    notificationType: text("notification_type").$type<"email" | "sms" | "both">().notNull(),
    templateType: text("template_type").notNull(), // e.g., "booth_assignment", "event_reminder"
    subject: text("subject"), // For emails
    message: text("message").notNull(),
    recipientCount: integer("recipient_count").notNull(),
    sentCount: integer("sent_count").default(0),
    failedCount: integer("failed_count").default(0),
    status: text("status").$type<"draft" | "pending" | "sending" | "completed" | "failed" | "cancelled">().default("draft"),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    metadata: json("metadata"), // Additional campaign data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    createdByIdx: index("bulk_notification_created_by_idx").on(table.createdBy),
    statusIdx: index("bulk_notification_status_idx").on(table.status),
    typeIdx: index("bulk_notification_type_idx").on(table.notificationType),
    scheduledIdx: index("bulk_notification_scheduled_idx").on(table.scheduledAt),
  })
);

// Notification Recipients - Track individual notification delivery status
export const notificationRecipients = pgTable(
  "notification_recipient",
  {
    id: text("id").primaryKey(),
    bulkNotificationId: text("bulk_notification_id").notNull().references(() => bulkNotifications.id, { onDelete: "cascade" }),
    jobSeekerId: text("job_seeker_id").notNull().references(() => jobSeekers.id, { onDelete: "cascade" }),
    boothAssignmentId: text("booth_assignment_id").references(() => boothAssignments.id, { onDelete: "set null" }),
    emailStatus: text("email_status").$type<"pending" | "sent" | "delivered" | "failed" | "bounced">().default("pending"),
    smsStatus: text("sms_status").$type<"pending" | "sent" | "delivered" | "failed">().default("pending"),
    emailSentAt: timestamp("email_sent_at"),
    smsSentAt: timestamp("sms_sent_at"),
    emailDeliveredAt: timestamp("email_delivered_at"),
    smsDeliveredAt: timestamp("sms_delivered_at"),
    emailError: text("email_error"),
    smsError: text("sms_error"),
    emailMessageId: text("email_message_id"), // External service message ID
    smsMessageId: text("sms_message_id"), // External service message ID
    opened: boolean("opened").default(false), // Email opened
    clicked: boolean("clicked").default(false), // Email link clicked
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    bulkNotificationIdx: index("notification_recipient_bulk_idx").on(table.bulkNotificationId),
    jobSeekerIdx: index("notification_recipient_job_seeker_idx").on(table.jobSeekerId),
    boothAssignmentIdx: index("notification_recipient_booth_assignment_idx").on(table.boothAssignmentId),
    emailStatusIdx: index("notification_recipient_email_status_idx").on(table.emailStatus),
    smsStatusIdx: index("notification_recipient_sms_status_idx").on(table.smsStatus),
  })
);