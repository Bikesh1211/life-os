CREATE TABLE "journal_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" uuid NOT NULL,
	"position" jsonb NOT NULL,
	"excerpt" text,
	"label" text,
	"color" text DEFAULT 'yellow',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" uuid NOT NULL,
	"position" jsonb NOT NULL,
	"text" text NOT NULL,
	"color" text DEFAULT 'yellow',
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"content" text NOT NULL,
	"title" text NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_writing_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"words_added" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_bookmarks" ADD CONSTRAINT "journal_bookmarks_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_highlights" ADD CONSTRAINT "journal_highlights_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_versions" ADD CONSTRAINT "journal_versions_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_writing_sessions" ADD CONSTRAINT "journal_writing_sessions_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_journal_bookmarks_entry" ON "journal_bookmarks" USING btree ("user_id","entry_id");--> statement-breakpoint
CREATE INDEX "idx_journal_bookmarks_created" ON "journal_bookmarks" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_journal_highlights_entry" ON "journal_highlights" USING btree ("user_id","entry_id");--> statement-breakpoint
CREATE INDEX "idx_journal_highlights_color" ON "journal_highlights" USING btree ("user_id","color");--> statement-breakpoint
CREATE INDEX "idx_journal_versions_entry" ON "journal_versions" USING btree ("entry_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_journal_sessions_entry" ON "journal_writing_sessions" USING btree ("entry_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_journal_sessions_user_date" ON "journal_writing_sessions" USING btree ("user_id","started_at");