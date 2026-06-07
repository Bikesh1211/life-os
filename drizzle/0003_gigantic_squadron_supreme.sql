CREATE INDEX "idx_journal_user_entries" ON "journal_entries" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_journal_user_active" ON "journal_entries" USING btree ("user_id","deleted_at","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_journal_mood" ON "journal_entries" USING btree ("user_id","mood");--> statement-breakpoint
CREATE INDEX "idx_journal_score" ON "journal_entries" USING btree ("user_id","reflection_score");--> statement-breakpoint
CREATE INDEX "idx_journal_tags" ON "journal_entries" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_journal_fts" ON "journal_entries" USING gin ((to_tsvector('english', "title") || to_tsvector('english', "content")));