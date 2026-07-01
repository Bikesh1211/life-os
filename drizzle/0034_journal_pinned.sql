ALTER TABLE "journal_entries" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_journal_pinned" ON "journal_entries" ("user_id", "is_pinned" DESC, "created_at" DESC);
