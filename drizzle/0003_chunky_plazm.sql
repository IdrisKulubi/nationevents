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
ALTER TABLE "interview" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "time_batch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "interview" CASCADE;--> statement-breakpoint
DROP TABLE "time_batch" CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_checked_in_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP CONSTRAINT "booth_assignment_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP CONSTRAINT "booth_assignment_time_batch_id_time_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "security_incident" DROP CONSTRAINT "security_incident_reported_by_user_id_fk";
--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "booth_assignment_event_idx";--> statement-breakpoint
DROP INDEX "booth_assignment_time_batch_idx";--> statement-breakpoint
DROP INDEX "interview_slot_job_idx";--> statement-breakpoint
DROP INDEX "interview_slot_status_idx";--> statement-breakpoint
DROP INDEX "interview_slot_start_time_idx";--> statement-breakpoint
DROP INDEX "security_incident_reported_by_idx";--> statement-breakpoint
DROP INDEX "security_incident_status_idx";--> statement-breakpoint
DROP INDEX "security_incident_severity_idx";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "reported_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "severity" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "shortlist" ALTER COLUMN "status" SET DEFAULT 'interested';--> statement-breakpoint
ALTER TABLE "attendance_record" ADD COLUMN "checkpoint_id" text;--> statement-breakpoint 
ALTER TABLE "booth_assignment" ADD COLUMN "interview_slot_id" text;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "assigned_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "assigned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "interview_date" timestamp;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "interview_time" text;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "priority" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "notification_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD COLUMN "duration" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD COLUMN "is_booked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "event_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "incident_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "involved_persons" json;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "action_taken" text;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "resolved_by" text;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "attachments" json;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "shortlist" ADD COLUMN "event_id" text;--> statement-breakpoint
ALTER TABLE "shortlist" ADD COLUMN "list_name" text DEFAULT 'Main Shortlist' NOT NULL;--> statement-breakpoint
ALTER TABLE "shortlist" ADD COLUMN "priority" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "shortlist" ADD COLUMN "tags" json;--> statement-breakpoint
ALTER TABLE "shortlist" ADD COLUMN "added_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bulk_notification" ADD CONSTRAINT "bulk_notification_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_interaction" ADD CONSTRAINT "candidate_interaction_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint" ADD CONSTRAINT "checkpoint_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_interview_booking_id_interview_booking_id_fk" FOREIGN KEY ("interview_booking_id") REFERENCES "public"."interview_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_booking" ADD CONSTRAINT "interview_booking_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_booking" ADD CONSTRAINT "interview_booking_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_bulk_notification_id_bulk_notification_id_fk" FOREIGN KEY ("bulk_notification_id") REFERENCES "public"."bulk_notification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_booth_assignment_id_booth_assignment_id_fk" FOREIGN KEY ("booth_assignment_id") REFERENCES "public"."booth_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_personnel" ADD CONSTRAINT "security_personnel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_log" ADD CONSTRAINT "system_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "feedback_from_user_idx" ON "feedback" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "feedback_to_user_idx" ON "feedback" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "feedback_event_idx" ON "feedback" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "feedback_type_idx" ON "feedback" USING btree ("feedback_type");--> statement-breakpoint
CREATE INDEX "interview_booking_job_seeker_idx" ON "interview_booking" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "interview_booking_slot_idx" ON "interview_booking" USING btree ("interview_slot_id");--> statement-breakpoint
CREATE INDEX "interview_booking_status_idx" ON "interview_booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_application_job_idx" ON "job_application" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_application_job_seeker_idx" ON "job_application" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "job_application_status_idx" ON "job_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_application_applied_at_idx" ON "job_application" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "job_application_reviewed_by_idx" ON "job_application" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "notification_recipient_bulk_idx" ON "notification_recipient" USING btree ("bulk_notification_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_job_seeker_idx" ON "notification_recipient" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_booth_assignment_idx" ON "notification_recipient" USING btree ("booth_assignment_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_email_status_idx" ON "notification_recipient" USING btree ("email_status");--> statement-breakpoint
CREATE INDEX "notification_recipient_sms_status_idx" ON "notification_recipient" USING btree ("sms_status");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_read_idx" ON "notification" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "security_user_id_idx" ON "security_personnel" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "security_badge_idx" ON "security_personnel" USING btree ("badge_number");--> statement-breakpoint
CREATE INDEX "security_duty_idx" ON "security_personnel" USING btree ("is_on_duty");--> statement-breakpoint
CREATE INDEX "system_log_user_idx" ON "system_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_log_action_idx" ON "system_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "system_log_resource_idx" ON "system_log" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "system_log_created_at_idx" ON "system_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("interview_slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_reported_by_security_personnel_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."security_personnel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlist" ADD CONSTRAINT "shortlist_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booth_assignment_assigned_by_idx" ON "booth_assignment" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "booth_assignment_status_idx" ON "booth_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booth_assignment_date_idx" ON "booth_assignment" USING btree ("interview_date");--> statement-breakpoint
CREATE INDEX "interview_slot_time_idx" ON "interview_slot" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "interview_slot_booked_idx" ON "interview_slot" USING btree ("is_booked");--> statement-breakpoint
CREATE INDEX "incident_event_idx" ON "security_incident" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "incident_reported_by_idx" ON "security_incident" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "incident_severity_idx" ON "security_incident" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "incident_status_idx" ON "security_incident" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incident_created_at_idx" ON "security_incident" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "shortlist_status_idx" ON "shortlist" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shortlist_priority_idx" ON "shortlist" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "shortlist_added_by_idx" ON "shortlist" USING btree ("added_by");--> statement-breakpoint

ALTER TABLE "booth_assignment" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "time_batch_id";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "assignment_time";--> statement-breakpoint
ALTER TABLE "interview_slot" DROP COLUMN "interviewer_role";--> statement-breakpoint
ALTER TABLE "interview_slot" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "incident_time";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "resolution_details";