CREATE TABLE "interview" (
	"id" text PRIMARY KEY NOT NULL,
	"slot_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"employer_notes" text,
	"job_seeker_notes" text,
	"status" text DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_batch" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"max_capacity" integer NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bulk_notification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "candidate_interaction" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "checkpoint" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "interview_booking" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_application" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_recipient" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "security_personnel" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "system_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "bulk_notification" CASCADE;--> statement-breakpoint
DROP TABLE "candidate_interaction" CASCADE;--> statement-breakpoint
DROP TABLE "checkpoint" CASCADE;--> statement-breakpoint
DROP TABLE "feedback" CASCADE;--> statement-breakpoint
DROP TABLE "interview_booking" CASCADE;--> statement-breakpoint
DROP TABLE "job_application" CASCADE;--> statement-breakpoint
DROP TABLE "notification_recipient" CASCADE;--> statement-breakpoint
DROP TABLE "notification" CASCADE;--> statement-breakpoint
DROP TABLE "security_personnel" CASCADE;--> statement-breakpoint
DROP TABLE "system_log" CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_checkpoint_id_checkpoint_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_verified_by_security_personnel_id_fk";
--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP CONSTRAINT "booth_assignment_interview_slot_id_interview_slot_id_fk";
--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP CONSTRAINT "booth_assignment_assigned_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "security_incident" DROP CONSTRAINT "security_incident_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "security_incident" DROP CONSTRAINT "security_incident_reported_by_security_personnel_id_fk";
--> statement-breakpoint
ALTER TABLE "security_incident" DROP CONSTRAINT "security_incident_resolved_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "shortlist" DROP CONSTRAINT "shortlist_event_id_event_id_fk";
--> statement-breakpoint
ALTER TABLE "shortlist" DROP CONSTRAINT "shortlist_added_by_user_id_fk";
--> statement-breakpoint
DROP INDEX "attendance_checkpoint_idx";--> statement-breakpoint
DROP INDEX "attendance_time_idx";--> statement-breakpoint
DROP INDEX "attendance_verified_by_idx";--> statement-breakpoint
DROP INDEX "booth_assignment_assigned_by_idx";--> statement-breakpoint
DROP INDEX "booth_assignment_status_idx";--> statement-breakpoint
DROP INDEX "booth_assignment_date_idx";--> statement-breakpoint
DROP INDEX "interview_slot_time_idx";--> statement-breakpoint
DROP INDEX "interview_slot_booked_idx";--> statement-breakpoint
DROP INDEX "incident_event_idx";--> statement-breakpoint
DROP INDEX "incident_reported_by_idx";--> statement-breakpoint
DROP INDEX "incident_severity_idx";--> statement-breakpoint
DROP INDEX "incident_status_idx";--> statement-breakpoint
DROP INDEX "incident_created_at_idx";--> statement-breakpoint
DROP INDEX "shortlist_status_idx";--> statement-breakpoint
DROP INDEX "shortlist_priority_idx";--> statement-breakpoint
DROP INDEX "shortlist_added_by_idx";--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "reported_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "severity" SET DEFAULT 'low';--> statement-breakpoint
ALTER TABLE "security_incident" ALTER COLUMN "status" SET DEFAULT 'reported';--> statement-breakpoint
ALTER TABLE "shortlist" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "attendance_record" ADD COLUMN "checkin_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD COLUMN "checkout_time" timestamp;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD COLUMN "checked_in_by" text;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "event_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "time_batch_id" text;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD COLUMN "assignment_time" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD COLUMN "interviewer_role" text;--> statement-breakpoint
ALTER TABLE "interview_slot" ADD COLUMN "status" text DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "incident_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "security_incident" ADD COLUMN "resolution_details" text;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_slot_id_interview_slot_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."interview_slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_batch" ADD CONSTRAINT "time_batch_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_slot_id_idx" ON "interview" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "interview_job_seeker_id_idx" ON "interview" USING btree ("job_seeker_id");--> statement-breakpoint
CREATE INDEX "interview_status_idx" ON "interview" USING btree ("status");--> statement-breakpoint
CREATE INDEX "time_batch_event_idx" ON "time_batch" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_checked_in_by_user_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booth_assignment" ADD CONSTRAINT "booth_assignment_time_batch_id_time_batch_id_fk" FOREIGN KEY ("time_batch_id") REFERENCES "public"."time_batch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_incident" ADD CONSTRAINT "security_incident_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "booth_assignment_event_idx" ON "booth_assignment" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "booth_assignment_time_batch_idx" ON "booth_assignment" USING btree ("time_batch_id");--> statement-breakpoint
CREATE INDEX "interview_slot_job_idx" ON "interview_slot" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "interview_slot_status_idx" ON "interview_slot" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interview_slot_start_time_idx" ON "interview_slot" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "security_incident_reported_by_idx" ON "security_incident" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "security_incident_status_idx" ON "security_incident" USING btree ("status");--> statement-breakpoint
CREATE INDEX "security_incident_severity_idx" ON "security_incident" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "checkpoint_id";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "verified_by";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "check_in_time";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "check_out_time";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "verification_method";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "verification_data";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "device_info";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "interview_slot_id";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "assigned_by";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "assigned_at";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "interview_date";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "interview_time";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "notification_sent";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "booth_assignment" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "interview_slot" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "interview_slot" DROP COLUMN "is_booked";--> statement-breakpoint
ALTER TABLE "interview_slot" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "incident_type";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "involved_persons";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "action_taken";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "resolved_by";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "attachments";--> statement-breakpoint
ALTER TABLE "security_incident" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "shortlist" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "shortlist" DROP COLUMN "list_name";--> statement-breakpoint
ALTER TABLE "shortlist" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "shortlist" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "shortlist" DROP COLUMN "added_by";