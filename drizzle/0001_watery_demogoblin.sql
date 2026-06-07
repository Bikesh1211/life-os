CREATE TYPE "public"."timeline_category" AS ENUM('personal', 'career', 'education', 'health', 'finance', 'travel', 'relationships', 'business', 'entertainment', 'custom');--> statement-breakpoint
CREATE TYPE "public"."timeline_importance" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."timeline_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" timestamp with time zone NOT NULL,
	"category" timeline_category DEFAULT 'personal' NOT NULL,
	"importance" timeline_importance DEFAULT 'medium' NOT NULL,
	"recurrence" timeline_recurrence DEFAULT 'none' NOT NULL,
	"color" text,
	"icon" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
