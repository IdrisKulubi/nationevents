-- Nxt Her Summit Event Table
CREATE TABLE "nxt_her_event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Nxt Her Summit' NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"venue" text,
	"is_active" boolean DEFAULT true,
	"branding" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Attendees Table
CREATE TABLE "nxt_her_attendee" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"profile_photo_url" text,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"attendance_type" text NOT NULL,
	"organization" text,
	"job_title" text,
	"about_you" text,
	"linkedin_profile" text,
	"twitter_handle" text,
	"website" text,
	"topics_of_interest" json,
	"areas_of_expertise" json,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"info_sharing_consent" boolean DEFAULT false NOT NULL,
	"terms_accepted_at" timestamp,
	"registration_status" text DEFAULT 'pending',
	"registration_completed_at" timestamp,
	"password_hash" text,
	"email_verified" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Speakers Table
CREATE TABLE "nxt_her_speaker" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"bio" text NOT NULL,
	"profile_photo_url" text,
	"job_title" text,
	"organization" text,
	"linkedin_url" text,
	"twitter_url" text,
	"website_url" text,
	"expertise" json,
	"is_keynote" boolean DEFAULT false,
	"display_order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Sessions Table
CREATE TABLE "nxt_her_session" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"session_type" text,
	"track" text,
	"pillar" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"venue" text,
	"max_attendees" integer,
	"is_virtual" boolean DEFAULT false,
	"meeting_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Session-Speaker Junction Table
CREATE TABLE "nxt_her_session_speaker" (
	"session_id" text NOT NULL,
	"speaker_id" text NOT NULL,
	"role" text DEFAULT 'speaker',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nxt_her_session_speaker_session_id_speaker_id_pk" PRIMARY KEY("session_id","speaker_id")
);

-- Nxt Her Summit Networking Profiles Table
CREATE TABLE "nxt_her_networking_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"attendee_id" text NOT NULL,
	"networking_goals" json,
	"sector" text,
	"region" text,
	"interests" json,
	"looking_for" json,
	"available_for" json,
	"preferred_connection_types" json,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Connection Suggestions Table
CREATE TABLE "nxt_her_connection_suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"from_attendee_id" text NOT NULL,
	"to_attendee_id" text NOT NULL,
	"match_score" numeric(3, 2),
	"match_reasons" json,
	"status" text DEFAULT 'suggested',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Connections Table
CREATE TABLE "nxt_her_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"requester_attendee_id" text NOT NULL,
	"requested_attendee_id" text NOT NULL,
	"status" text DEFAULT 'pending',
	"message" text,
	"connected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Forums Table
CREATE TABLE "nxt_her_forum" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"is_active" boolean DEFAULT true,
	"moderator_ids" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Forum Posts Table
CREATE TABLE "nxt_her_forum_post" (
	"id" text PRIMARY KEY NOT NULL,
	"forum_id" text NOT NULL,
	"author_attendee_id" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"parent_post_id" text,
	"is_moderated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Session Feedback Table
CREATE TABLE "nxt_her_session_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"attendee_id" text NOT NULL,
	"rating" integer NOT NULL,
	"content_quality" integer,
	"speaker_rating" integer,
	"relevance" integer,
	"comments" text,
	"would_recommend" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Event Feedback Table
CREATE TABLE "nxt_her_event_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"attendee_id" text NOT NULL,
	"nps_score" integer NOT NULL,
	"overall_rating" integer NOT NULL,
	"content_quality" integer,
	"networking_experience" integer,
	"platform_usability" integer,
	"most_valuable_aspect" text,
	"least_valuable_aspect" text,
	"suggestions" text,
	"would_attend_again" boolean,
	"would_recommend" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Nxt Her Summit Session Bookmarks Table
CREATE TABLE "nxt_her_session_bookmark" (
	"id" text PRIMARY KEY NOT NULL,
	"attendee_id" text NOT NULL,
	"session_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign Key Constraints
ALTER TABLE "nxt_her_attendee" ADD CONSTRAINT "nxt_her_attendee_event_id_nxt_her_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."nxt_her_event"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_speaker" ADD CONSTRAINT "nxt_her_speaker_event_id_nxt_her_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."nxt_her_event"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session" ADD CONSTRAINT "nxt_her_session_event_id_nxt_her_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."nxt_her_event"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_speaker" ADD CONSTRAINT "nxt_her_session_speaker_session_id_nxt_her_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nxt_her_session"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_speaker" ADD CONSTRAINT "nxt_her_session_speaker_speaker_id_nxt_her_speaker_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."nxt_her_speaker"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_networking_profile" ADD CONSTRAINT "nxt_her_networking_profile_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_connection_suggestion" ADD CONSTRAINT "nxt_her_connection_suggestion_from_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("from_attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_connection_suggestion" ADD CONSTRAINT "nxt_her_connection_suggestion_to_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("to_attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_connection" ADD CONSTRAINT "nxt_her_connection_requester_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("requester_attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_connection" ADD CONSTRAINT "nxt_her_connection_requested_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("requested_attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_forum" ADD CONSTRAINT "nxt_her_forum_event_id_nxt_her_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."nxt_her_event"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_forum_post" ADD CONSTRAINT "nxt_her_forum_post_forum_id_nxt_her_forum_id_fk" FOREIGN KEY ("forum_id") REFERENCES "public"."nxt_her_forum"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_forum_post" ADD CONSTRAINT "nxt_her_forum_post_author_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("author_attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_forum_post" ADD CONSTRAINT "nxt_her_forum_post_parent_post_id_nxt_her_forum_post_id_fk" FOREIGN KEY ("parent_post_id") REFERENCES "public"."nxt_her_forum_post"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_feedback" ADD CONSTRAINT "nxt_her_session_feedback_session_id_nxt_her_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nxt_her_session"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_feedback" ADD CONSTRAINT "nxt_her_session_feedback_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_event_feedback" ADD CONSTRAINT "nxt_her_event_feedback_event_id_nxt_her_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."nxt_her_event"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_event_feedback" ADD CONSTRAINT "nxt_her_event_feedback_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_bookmark" ADD CONSTRAINT "nxt_her_session_bookmark_attendee_id_nxt_her_attendee_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."nxt_her_attendee"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "nxt_her_session_bookmark" ADD CONSTRAINT "nxt_her_session_bookmark_session_id_nxt_her_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."nxt_her_session"("id") ON DELETE cascade ON UPDATE no action;

-- Indexes for optimal performance
CREATE INDEX "nxt_her_event_name_idx" ON "nxt_her_event" USING btree ("name");
CREATE INDEX "nxt_her_event_active_idx" ON "nxt_her_event" USING btree ("is_active");
CREATE INDEX "nxt_her_event_date_idx" ON "nxt_her_event" USING btree ("start_date");

CREATE INDEX "nxt_her_attendee_event_id_idx" ON "nxt_her_attendee" USING btree ("event_id");
CREATE INDEX "nxt_her_attendee_email_idx" ON "nxt_her_attendee" USING btree ("email");
CREATE INDEX "nxt_her_attendee_status_idx" ON "nxt_her_attendee" USING btree ("registration_status");
CREATE INDEX "nxt_her_attendee_name_idx" ON "nxt_her_attendee" USING btree ("first_name","last_name");
CREATE INDEX "nxt_her_attendee_country_idx" ON "nxt_her_attendee" USING btree ("country");
CREATE INDEX "nxt_her_attendee_attendance_type_idx" ON "nxt_her_attendee" USING btree ("attendance_type");
CREATE INDEX "nxt_her_attendee_email_event_unique" ON "nxt_her_attendee" USING btree ("email","event_id");

CREATE INDEX "nxt_her_speaker_event_id_idx" ON "nxt_her_speaker" USING btree ("event_id");
CREATE INDEX "nxt_her_speaker_name_idx" ON "nxt_her_speaker" USING btree ("name");
CREATE INDEX "nxt_her_speaker_keynote_idx" ON "nxt_her_speaker" USING btree ("is_keynote");
CREATE INDEX "nxt_her_speaker_display_order_idx" ON "nxt_her_speaker" USING btree ("display_order");

CREATE INDEX "nxt_her_session_event_id_idx" ON "nxt_her_session" USING btree ("event_id");
CREATE INDEX "nxt_her_session_title_idx" ON "nxt_her_session" USING btree ("title");
CREATE INDEX "nxt_her_session_type_idx" ON "nxt_her_session" USING btree ("session_type");
CREATE INDEX "nxt_her_session_track_idx" ON "nxt_her_session" USING btree ("track");
CREATE INDEX "nxt_her_session_pillar_idx" ON "nxt_her_session" USING btree ("pillar");
CREATE INDEX "nxt_her_session_time_idx" ON "nxt_her_session" USING btree ("start_time");
CREATE INDEX "nxt_her_session_virtual_idx" ON "nxt_her_session" USING btree ("is_virtual");

CREATE INDEX "nxt_her_session_speaker_session_idx" ON "nxt_her_session_speaker" USING btree ("session_id");
CREATE INDEX "nxt_her_session_speaker_speaker_idx" ON "nxt_her_session_speaker" USING btree ("speaker_id");
CREATE INDEX "nxt_her_session_speaker_role_idx" ON "nxt_her_session_speaker" USING btree ("role");

CREATE INDEX "nxt_her_networking_profile_attendee_idx" ON "nxt_her_networking_profile" USING btree ("attendee_id");
CREATE INDEX "nxt_her_networking_profile_sector_idx" ON "nxt_her_networking_profile" USING btree ("sector");
CREATE INDEX "nxt_her_networking_profile_region_idx" ON "nxt_her_networking_profile" USING btree ("region");
CREATE INDEX "nxt_her_networking_profile_visible_idx" ON "nxt_her_networking_profile" USING btree ("is_visible");

CREATE INDEX "nxt_her_connection_suggestion_from_idx" ON "nxt_her_connection_suggestion" USING btree ("from_attendee_id");
CREATE INDEX "nxt_her_connection_suggestion_to_idx" ON "nxt_her_connection_suggestion" USING btree ("to_attendee_id");
CREATE INDEX "nxt_her_connection_suggestion_status_idx" ON "nxt_her_connection_suggestion" USING btree ("status");
CREATE INDEX "nxt_her_connection_suggestion_score_idx" ON "nxt_her_connection_suggestion" USING btree ("match_score");

CREATE INDEX "nxt_her_connection_requester_idx" ON "nxt_her_connection" USING btree ("requester_attendee_id");
CREATE INDEX "nxt_her_connection_requested_idx" ON "nxt_her_connection" USING btree ("requested_attendee_id");
CREATE INDEX "nxt_her_connection_status_idx" ON "nxt_her_connection" USING btree ("status");
CREATE INDEX "nxt_her_connection_unique" ON "nxt_her_connection" USING btree ("requester_attendee_id","requested_attendee_id");

CREATE INDEX "nxt_her_forum_event_id_idx" ON "nxt_her_forum" USING btree ("event_id");
CREATE INDEX "nxt_her_forum_title_idx" ON "nxt_her_forum" USING btree ("title");
CREATE INDEX "nxt_her_forum_category_idx" ON "nxt_her_forum" USING btree ("category");
CREATE INDEX "nxt_her_forum_active_idx" ON "nxt_her_forum" USING btree ("is_active");

CREATE INDEX "nxt_her_forum_post_forum_idx" ON "nxt_her_forum_post" USING btree ("forum_id");
CREATE INDEX "nxt_her_forum_post_author_idx" ON "nxt_her_forum_post" USING btree ("author_attendee_id");
CREATE INDEX "nxt_her_forum_post_parent_idx" ON "nxt_her_forum_post" USING btree ("parent_post_id");
CREATE INDEX "nxt_her_forum_post_moderated_idx" ON "nxt_her_forum_post" USING btree ("is_moderated");
CREATE INDEX "nxt_her_forum_post_created_at_idx" ON "nxt_her_forum_post" USING btree ("created_at");

CREATE INDEX "nxt_her_session_feedback_session_idx" ON "nxt_her_session_feedback" USING btree ("session_id");
CREATE INDEX "nxt_her_session_feedback_attendee_idx" ON "nxt_her_session_feedback" USING btree ("attendee_id");
CREATE INDEX "nxt_her_session_feedback_rating_idx" ON "nxt_her_session_feedback" USING btree ("rating");
CREATE INDEX "nxt_her_session_feedback_unique" ON "nxt_her_session_feedback" USING btree ("session_id","attendee_id");

CREATE INDEX "nxt_her_event_feedback_event_idx" ON "nxt_her_event_feedback" USING btree ("event_id");
CREATE INDEX "nxt_her_event_feedback_attendee_idx" ON "nxt_her_event_feedback" USING btree ("attendee_id");
CREATE INDEX "nxt_her_event_feedback_nps_idx" ON "nxt_her_event_feedback" USING btree ("nps_score");
CREATE INDEX "nxt_her_event_feedback_overall_rating_idx" ON "nxt_her_event_feedback" USING btree ("overall_rating");
CREATE INDEX "nxt_her_event_feedback_unique" ON "nxt_her_event_feedback" USING btree ("event_id","attendee_id");

CREATE INDEX "nxt_her_session_bookmark_attendee_idx" ON "nxt_her_session_bookmark" USING btree ("attendee_id");
CREATE INDEX "nxt_her_session_bookmark_session_idx" ON "nxt_her_session_bookmark" USING btree ("session_id");
CREATE INDEX "nxt_her_session_bookmark_unique" ON "nxt_her_session_bookmark" USING btree ("attendee_id","session_id");