CREATE TYPE "public"."journal_mood" AS ENUM('happy', 'sad', 'neutral', 'anxious', 'stressed', 'motivated', 'excited');--> statement-breakpoint
CREATE TABLE "journal_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"summary" text,
	"sentiment_score" integer,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"ai_reflection" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "mood" SET DATA TYPE journal_mood USING "mood"::text::journal_mood;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "reflection_score" integer;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "is_private" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_insights" ADD CONSTRAINT "journal_insights_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;