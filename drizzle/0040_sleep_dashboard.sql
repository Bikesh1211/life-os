-- Add sleep tracking columns to wellness_sleep_records
ALTER TABLE "wellness_sleep_records" ADD COLUMN "sleep_latency_minutes" integer;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "mood_after_waking" text;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "energy_level" integer;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "import_source" text;--> statement-breakpoint

-- Create wellness_user_preferences table
CREATE TABLE IF NOT EXISTS "wellness_user_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "sleep_goal_hours" integer DEFAULT 8 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_prefs_user" ON "wellness_user_preferences" USING btree ("user_id");
