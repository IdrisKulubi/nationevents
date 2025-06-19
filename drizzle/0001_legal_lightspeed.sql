ALTER TABLE "job_seeker" ADD COLUMN "data_privacy_accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "data_privacy_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "data_retention_period" text DEFAULT '1_year';--> statement-breakpoint
CREATE INDEX "job_seeker_data_privacy_idx" ON "job_seeker" USING btree ("data_privacy_accepted");