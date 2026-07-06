CREATE TYPE "public"."countdown_category" AS ENUM('football', 'movies', 'concerts', 'travel', 'retreats', 'birthdays', 'weddings', 'festivals', 'exams', 'meetings', 'product-launches', 'holidays', 'personal', 'custom');--> statement-breakpoint
CREATE TYPE "public"."countdown_recurrence" AS ENUM('none', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."countdown_status" AS ENUM('pending', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "countdown_checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countdown_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "countdown_category" DEFAULT 'personal' NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"event_time" text,
	"timezone" text,
	"location" text,
	"organizer" text,
	"cover_image" text,
	"banner_image" text,
	"color" text,
	"icon" text,
	"notes" text,
	"is_favorited" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"recurrence" "countdown_recurrence" DEFAULT 'none' NOT NULL,
	"create_timeline_event" boolean DEFAULT true NOT NULL,
	"status" "countdown_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "countdown_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"reflection" text,
	"rating" integer,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countdown_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"offset" text NOT NULL,
	"reminder_at" timestamp with time zone NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "countdown_checklist_items" ADD CONSTRAINT "countdown_checklist_items_event_id_countdown_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."countdown_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countdown_memories" ADD CONSTRAINT "countdown_memories_event_id_countdown_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."countdown_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countdown_reminders" ADD CONSTRAINT "countdown_reminders_event_id_countdown_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."countdown_events"("id") ON DELETE cascade ON UPDATE no action;