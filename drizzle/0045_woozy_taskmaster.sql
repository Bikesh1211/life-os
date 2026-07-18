CREATE TABLE "daily_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"title" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"task_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_planner_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"productivity_score" integer NOT NULL,
	"sub_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"tasks_total" integer DEFAULT 0 NOT NULL,
	"focus_minutes" integer DEFAULT 0 NOT NULL,
	"habits_completed" integer DEFAULT 0 NOT NULL,
	"habits_total" integer DEFAULT 0 NOT NULL,
	"daily_goal_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_priorities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"title" text NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"task_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planner_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"morning_reminder_time" text,
	"evening_reminder_time" text,
	"notification_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "what_went_well" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "biggest_achievement" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "lesson_learned" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "how_do_you_feel" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "day_rating" integer;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "tomorrow_priorities" text[];