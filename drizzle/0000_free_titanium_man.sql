CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "attendance_record" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"event_id" text NOT NULL,
	"checkpoint_id" text,
	"verified_by" text,
	"check_in_time" timestamp DEFAULT now() NOT NULL,
	"check_out_time" timestamp,
	"verification_method" text NOT NULL,
	"verification_data" text,
	"status" text DEFAULT 'checked_in',
	"notes" text,
	"ip_address" text,
	"device_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booth_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"booth_id" text NOT NULL,
	"interview_slot_id" text,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'assigned',
	"interview_date" timestamp,
	"interview_time" text,
	"notes" text,
	"priority" text DEFAULT 'medium',
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booth" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"employer_id" text NOT NULL,
	"booth_number" text NOT NULL,
	"location" text,
	"size" text,
	"equipment" json,
	"special_requirements" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_notification" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_name" text NOT NULL,
	"notification_type" text NOT NULL,
	"template_type" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"recipient_count" integer NOT NULL,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_interaction" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"event_id" text,
	"interaction_type" text NOT NULL,
	"duration" integer,
	"notes" text,
	"rating" integer,
	"metadata" json,
	"performed_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkpoint" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"checkpoint_type" text DEFAULT 'entry',
	"is_active" boolean DEFAULT true,
	"requires_verification" boolean DEFAULT true,
	"max_capacity" integer,
	"current_occupancy" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"company_description" text,
	"industry" text,
	"company_size" text,
	"website" text,
	"logo_url" text,
	"address" text,
	"contact_person" text,
	"contact_email" text,
	"contact_phone" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"venue" text NOT NULL,
	"address" text,
	"max_attendees" integer,
	"registration_deadline" timestamp,
	"is_active" boolean DEFAULT true,
	"event_type" text DEFAULT 'job_fair',
	"has_conference" boolean DEFAULT false,
	"conference_start_date" timestamp,
	"conference_end_date" timestamp,
	"conference_venue" text,
	"conference_max_attendees" integer,
	"conference_registration_deadline" timestamp,
	"conference_description" text,
	"conference_sessions" json,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text,
	"event_id" text,
	"interview_booking_id" text,
	"feedback_type" text NOT NULL,
	"rating" integer,
	"comment" text,
	"is_anonymous" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"job_seeker_id" text NOT NULL,
	"interview_slot_id" text NOT NULL,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"feedback" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_slot" (
	"id" text PRIMARY KEY NOT NULL,
	"booth_id" text NOT NULL,
	"job_id" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration" integer DEFAULT 30,
	"is_booked" boolean DEFAULT false,
	"interviewer_name" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"status" text DEFAULT 'applied',
	"cover_letter" text,
	"resume_url" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"notes" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"cv_url" text,
	"additional_documents" json,
	"skills" json,
	"experience" text,
	"education" text,
	"pin" text,
	"ticket_number" text,
	"registration_status" text DEFAULT 'pending',
	"interest_categories" json,
	"linkedin_url" text,
	"portfolio_url" text,
	"expected_salary" numeric,
	"available_from" timestamp,
	"pin_generated_at" timestamp,
	"pin_expires_at" timestamp,
	"assignment_status" text DEFAULT 'unassigned',
	"priority_level" text DEFAULT 'normal',
	"is_huawei_student" boolean DEFAULT false,
	"huawei_certification_level" text,
	"huawei_certification_details" json,
	"huawei_student_id" text,
	"wants_to_attend_conference" boolean DEFAULT false,
	"conference_registration_date" timestamp,
	"conference_attendance_status" text,
	"conference_preferences" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_seeker_pin_unique" UNIQUE("pin"),
	CONSTRAINT "job_seeker_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"event_id" text,
	"title" text NOT NULL,
	"description" text,
	"requirements" json,
	"benefits" json,
	"salary_range" text,
	"job_type" text,
	"location" text,
	"category" text,
	"experience_level" text,
	"is_active" boolean DEFAULT true,
	"application_deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_recipient" (
	"id" text PRIMARY KEY NOT NULL,
	"bulk_notification_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"booth_assignment_id" text,
	"email_status" text DEFAULT 'pending',
	"sms_status" text DEFAULT 'pending',
	"email_sent_at" timestamp,
	"sms_sent_at" timestamp,
	"email_delivered_at" timestamp,
	"sms_delivered_at" timestamp,
	"email_error" text,
	"sms_error" text,
	"email_message_id" text,
	"sms_message_id" text,
	"opened" boolean DEFAULT false,
	"clicked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info',
	"is_read" boolean DEFAULT false,
	"action_url" text,
	"metadata" json,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_incident" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"reported_by" text NOT NULL,
	"incident_type" text NOT NULL,
	"severity" text DEFAULT 'medium',
	"location" text NOT NULL,
	"description" text NOT NULL,
	"involved_persons" json,
	"action_taken" text,
	"status" text DEFAULT 'open',
	"resolved_by" text,
	"resolved_at" timestamp,
	"attachments" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_personnel" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_number" text,
	"department" text,
	"clearance_level" text DEFAULT 'basic',
	"assigned_checkpoints" json,
	"is_on_duty" boolean DEFAULT false,
	"shift_start" timestamp,
	"shift_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "security_personnel_badge_number_unique" UNIQUE("badge_number")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlist" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"job_id" text,
	"event_id" text,
	"job_seeker_id" text NOT NULL,
	"list_name" text DEFAULT 'Main Shortlist' NOT NULL,
	"status" text DEFAULT 'interested',
	"priority" text DEFAULT 'medium',
	"notes" text,
	"tags" json,
	"added_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text,
	"details" json,
	"ip_address" text,
	"user_agent" text,
	"success" boolean DEFAULT true,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'job_seeker',
	"emailVerified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"is_online" boolean DEFAULT false,
	"profile_photo" text,
	"phone_number" text,
	"is_active" boolean DEFAULT true,
	"password_hash" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_checkpoint_id_checkpoint_id_fk" FOREIGN KEY ("checkpoint_id") REFERENCES "public"."checkpoint"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_verified_by_security_personnel_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."security_personnel"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_booth_id_booth_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth" ADD CONSTRAINT "booth_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth" ADD CONSTRAINT "booth_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_notification" ADD CONSTRAINT "bulk_notification_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer" ADD CONSTRAINT "employer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_interview_booking_id_interview_booking_id_fk" FOREIGN KEY ("interview_booking_id") REFERENCES "public"."interview_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_booking" ADD CONSTRAINT "interview_booking_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_booking" ADD CONSTRAINT "interview_booking_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD CONSTRAINT "interview_slot_booth_id_booth_id_fk" FOREIGN KEY ("booth_id") REFERENCES "public"."booth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD CONSTRAINT "interview_slot_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker" ADD CONSTRAINT "job_seeker_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_bulk_notification_id_bulk_notification_id_fk" FOREIGN KEY ("bulk_notification_id") REFERENCES "public"."bulk_notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_booth_assignment_id_booth_assignment_id_fk" FOREIGN KEY ("booth_assignment_id") REFERENCES "public"."booth_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_reported_by_security_personnel_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."security_personnel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_personnel" ADD CONSTRAINT "security_personnel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_log" ADD CONSTRAINT "system_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_job_seeker_idx" ON "attendance_record" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "attendance_event_idx" ON "attendance_record" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "attendance_checkpoint_idx" ON "attendance_record" USING btree ("checkpoint_id");--> statement-breakpoint
CREATE INDEX "attendance_time_idx" ON "attendance_record" USING btree ("check_in_time");--> statement-breakpoint
CREATE INDEX "attendance_verified_by_idx" ON "attendance_record" USING btree ("verified_by");--> statement-breakpoint
CREATE INDEX "booth_assignment_job_seeker_idx" ON "booth_assignment" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "booth_assignment_booth_idx" ON "booth_assignment" USING btree ("booth_id");--> statement-breakpoint
CREATE INDEX "booth_assignment_assigned_by_idx" ON "booth_assignment" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "booth_assignment_status_idx" ON "booth_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booth_assignment_date_idx" ON "booth_assignment" USING btree ("interview_date");--> statement-breakpoint
CREATE INDEX "booth_event_idx" ON "booth" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "booth_employer_idx" ON "booth" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "booth_number_idx" ON "booth" USING btree ("booth_number");--> statement-breakpoint
CREATE INDEX "bulk_notification_created_by_idx" ON "bulk_notification" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "bulk_notification_status_idx" ON "bulk_notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bulk_notification_type_idx" ON "bulk_notification" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "bulk_notification_scheduled_idx" ON "bulk_notification" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "candidate_interaction_employer_idx" ON "candidate_interaction" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_job_seeker_idx" ON "candidate_interaction" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_event_idx" ON "candidate_interaction" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "candidate_interaction_type_idx" ON "candidate_interaction" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "candidate_interaction_performed_by_idx" ON "candidate_interaction" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "candidate_interaction_created_at_idx" ON "candidate_interaction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "checkpoint_event_idx" ON "checkpoint" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "checkpoint_type_idx" ON "checkpoint" USING btree ("checkpoint_type");--> statement-breakpoint
CREATE INDEX "checkpoint_active_idx" ON "checkpoint" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "employer_user_id_idx" ON "employer" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employer_company_name_idx" ON "employer" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "employer_verified_idx" ON "employer" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "event_name_idx" ON "event" USING btree ("name");--> statement-breakpoint
CREATE INDEX "event_date_idx" ON "event" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "event_active_idx" ON "event" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "event_type_idx" ON "event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_has_conference_idx" ON "event" USING btree ("has_conference");--> statement-breakpoint
CREATE INDEX "event_conference_date_idx" ON "event" USING btree ("conference_start_date");--> statement-breakpoint
CREATE INDEX "feedback_from_user_idx" ON "feedback" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "feedback_to_user_idx" ON "feedback" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "feedback_event_idx" ON "feedback" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "feedback_type_idx" ON "feedback" USING btree ("feedback_type");--> statement-breakpoint
CREATE INDEX "interview_booking_job_seeker_idx" ON "interview_booking" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "interview_booking_slot_idx" ON "interview_booking" USING btree ("interview_slot_id");--> statement-breakpoint
CREATE INDEX "interview_booking_status_idx" ON "interview_booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interview_slot_booth_idx" ON "interview_slot" USING btree ("booth_id");--> statement-breakpoint
CREATE INDEX "interview_slot_time_idx" ON "interview_slot" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "interview_slot_booked_idx" ON "interview_slot" USING btree ("is_booked");--> statement-breakpoint
CREATE INDEX "job_application_job_idx" ON "job_application" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_application_job_seeker_idx" ON "job_application" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "job_application_status_idx" ON "job_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_application_applied_at_idx" ON "job_application" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "job_application_reviewed_by_idx" ON "job_application" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "job_seeker_user_id_idx" ON "job_seeker" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_seeker_pin_idx" ON "job_seeker" USING btree ("pin");--> statement-breakpoint
CREATE INDEX "job_seeker_ticket_number_idx" ON "job_seeker" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "job_seeker_status_idx" ON "job_seeker" USING btree ("registration_status");--> statement-breakpoint
CREATE INDEX "job_seeker_assignment_status_idx" ON "job_seeker" USING btree ("assignment_status");--> statement-breakpoint
CREATE INDEX "job_seeker_huawei_student_idx" ON "job_seeker" USING btree ("is_huawei_student");--> statement-breakpoint
CREATE INDEX "job_seeker_huawei_student_id_idx" ON "job_seeker" USING btree ("huawei_student_id");--> statement-breakpoint
CREATE INDEX "job_seeker_conference_attendance_idx" ON "job_seeker" USING btree ("wants_to_attend_conference");--> statement-breakpoint
CREATE INDEX "job_seeker_conference_status_idx" ON "job_seeker" USING btree ("conference_attendance_status");--> statement-breakpoint
CREATE INDEX "job_employer_idx" ON "job" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "job_event_idx" ON "job" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "job_category_idx" ON "job" USING btree ("category");--> statement-breakpoint
CREATE INDEX "job_active_idx" ON "job" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "notification_recipient_bulk_idx" ON "notification_recipient" USING btree ("bulk_notification_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_job_seeker_idx" ON "notification_recipient" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_booth_assignment_idx" ON "notification_recipient" USING btree ("booth_assignment_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_email_status_idx" ON "notification_recipient" USING btree ("email_status");--> statement-breakpoint
CREATE INDEX "notification_recipient_sms_status_idx" ON "notification_recipient" USING btree ("sms_status");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_read_idx" ON "notification" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "incident_event_idx" ON "security_incident" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "incident_reported_by_idx" ON "security_incident" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "incident_severity_idx" ON "security_incident" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "incident_status_idx" ON "security_incident" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incident_created_at_idx" ON "security_incident" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "security_user_id_idx" ON "security_personnel" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "security_badge_idx" ON "security_personnel" USING btree ("badge_number");--> statement-breakpoint
CREATE INDEX "security_duty_idx" ON "security_personnel" USING btree ("is_on_duty");--> statement-breakpoint
CREATE INDEX "shortlist_employer_idx" ON "shortlist" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "shortlist_job_idx" ON "shortlist" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "shortlist_job_seeker_idx" ON "shortlist" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "shortlist_status_idx" ON "shortlist" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shortlist_priority_idx" ON "shortlist" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "shortlist_added_by_idx" ON "shortlist" USING btree ("added_by");--> statement-breakpoint
CREATE INDEX "system_log_user_idx" ON "system_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_log_action_idx" ON "system_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "system_log_resource_idx" ON "system_log" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "system_log_created_at_idx" ON "system_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_last_active_idx" ON "user" USING btree ("last_active");