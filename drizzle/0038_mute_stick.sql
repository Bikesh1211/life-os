CREATE TYPE "public"."habit_frequency_type" AS ENUM('daily', 'weekly', 'monthly', 'every_x_days', 'every_x_weeks', 'specific_weekdays', 'specific_dates');--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria_type" ADD VALUE 'grooming_completions';--> statement-breakpoint
ALTER TYPE "public"."badge_category" ADD VALUE 'grooming';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'grooming_completed';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'grooming_streak_bonus';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'grooming_perfect_week';--> statement-breakpoint
ALTER TABLE "habit_completions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "frequency_type" "habit_frequency_type" DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "frequency_interval" integer;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "frequency_weekdays" integer[];--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "frequency_month_day" integer;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "times_per_day" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "grooming_category" text;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "preferred_time" text;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "estimated_duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wellness_habit_enrichment" ADD COLUMN "reminder_config" jsonb;--> statement-breakpoint
CREATE INDEX "idx_wellness_enrichment_grooming_cat" ON "wellness_habit_enrichment" USING btree ("user_id","grooming_category");--> statement-breakpoint
CREATE INDEX "idx_wellness_enrichment_sort" ON "wellness_habit_enrichment" USING btree ("user_id","sort_order");