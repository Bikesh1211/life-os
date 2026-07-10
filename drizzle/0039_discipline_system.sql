-- Add milestone_reached to commitment event type enum
ALTER TYPE "public"."commitment_event_type" ADD VALUE 'milestone_reached';--> statement-breakpoint

-- Add new columns to integrity_daily_checkins
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "accomplishments" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "excuses" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "distractions" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "proud_of" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "excuse_tags" text[];--> statement-breakpoint

-- Old columns are kept for backward compatibility but deprecated
-- (blockers, reflection remain but are no longer used by the app)

-- Create integrity_daily_snapshots table for score caching
CREATE TABLE IF NOT EXISTS "integrity_daily_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "date" text NOT NULL,
  "score" integer NOT NULL,
  "streak" integer DEFAULT 0 NOT NULL,
  "level" integer DEFAULT 1 NOT NULL,
  "level_title" text,
  "sub_scores" text,
  "commitment_rate" integer DEFAULT 0,
  "is_all_completed" text DEFAULT 'false',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_snapshots_user_date" ON "integrity_daily_snapshots" USING btree ("user_id", "date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_snapshots_user_date_unique" ON "integrity_daily_snapshots" USING btree ("user_id", "date");
