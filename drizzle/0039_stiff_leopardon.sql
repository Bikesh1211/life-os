ALTER TYPE "public"."commitment_event_type" ADD VALUE 'milestone_reached';--> statement-breakpoint
CREATE TABLE "book_chapter_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"position" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_chapter_research_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"age" text,
	"personality" text,
	"background" text,
	"appearance" text,
	"goals" text,
	"notes" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_research_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"source_type" text,
	"source_url" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_writing_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"chapter_id" uuid,
	"user_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"words_added" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrity_daily_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
);
--> statement-breakpoint
CREATE TABLE "wellness_user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"sleep_goal_hours" integer DEFAULT 8 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "book_type" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "target_word_count" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "target_chapter_count" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "daily_writing_goal" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "weekly_goal" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "accomplishments" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "excuses" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "distractions" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "proud_of" text;--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" ADD COLUMN "excuse_tags" text[];--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "sleep_latency_minutes" integer;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "mood_after_waking" text;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "energy_level" integer;--> statement-breakpoint
ALTER TABLE "wellness_sleep_records" ADD COLUMN "import_source" text;--> statement-breakpoint
ALTER TABLE "book_chapter_characters" ADD CONSTRAINT "book_chapter_characters_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_chapter_characters" ADD CONSTRAINT "book_chapter_characters_character_id_book_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."book_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_chapter_research_notes" ADD CONSTRAINT "book_chapter_research_notes_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_chapter_research_notes" ADD CONSTRAINT "book_chapter_research_notes_note_id_book_research_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."book_research_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_characters" ADD CONSTRAINT "book_characters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_research_notes" ADD CONSTRAINT "book_research_notes_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_writing_sessions" ADD CONSTRAINT "book_writing_sessions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_writing_sessions" ADD CONSTRAINT "book_writing_sessions_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_book_chapter_characters_chapter" ON "book_chapter_characters" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_book_chapter_characters_character" ON "book_chapter_characters" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "idx_book_chapter_research_chapter" ON "book_chapter_research_notes" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "idx_book_chapter_research_note" ON "book_chapter_research_notes" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "idx_book_characters_book" ON "book_characters" USING btree ("book_id","name");--> statement-breakpoint
CREATE INDEX "idx_book_characters_user" ON "book_characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_book_research_notes_book" ON "book_research_notes" USING btree ("book_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_book_sessions_book" ON "book_writing_sessions" USING btree ("book_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_book_sessions_user_date" ON "book_writing_sessions" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_prefs_user" ON "wellness_user_preferences" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" DROP COLUMN "blockers";--> statement-breakpoint
ALTER TABLE "integrity_daily_checkins" DROP COLUMN "reflection";