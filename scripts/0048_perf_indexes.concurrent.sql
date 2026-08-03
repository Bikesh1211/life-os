-- Non-blocking variant of drizzle/0048_perf_indexes.sql.
--
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction block, so this
-- file is NOT part of the drizzle migration chain. Run it directly
-- (psql -f) if a table is large enough that the brief write lock taken by
-- 0048 would matter, then mark 0048 as applied.
--
-- CONCURRENTLY can leave an INVALID index behind if it fails partway.
-- Verify afterwards with:
--   SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_timeline_events_user_active" ON "timeline_events" USING btree ("user_id", "deleted_at", "is_pinned" DESC, "event_date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_timeline_events_user_date" ON "timeline_events" USING btree ("user_id", "event_date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_user_active" ON "goals" USING btree ("user_id", "deleted_at", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_user_status" ON "goals" USING btree ("user_id", "status", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_goals_user_deadline" ON "goals" USING btree ("user_id", "deadline");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_habits_user_active" ON "habits" USING btree ("user_id", "deleted_at", "created_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_countdown_events_user_date" ON "countdown_events" USING btree ("user_id", "deleted_at", "event_date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_countdown_events_user_status" ON "countdown_events" USING btree ("user_id", "status", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_user_type_date" ON "transactions" USING btree ("user_id", "type", "transaction_date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_user_date" ON "transactions" USING btree ("user_id", "transaction_date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_category" ON "transactions" USING btree ("category_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_transactions_account" ON "transactions" USING btree ("account_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_accounts_user" ON "accounts" USING btree ("user_id", "deleted_at", "created_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_budgets_user" ON "budgets" USING btree ("user_id", "deleted_at", "created_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_expense_categories_user" ON "expense_categories" USING btree ("user_id", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_favorites_user" ON "movie_favorites" USING btree ("user_id", "added_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_favorites_user_media" ON "movie_favorites" USING btree ("user_id", "media_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_ratings_user" ON "movie_ratings" USING btree ("user_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_ratings_user_media" ON "movie_ratings" USING btree ("user_id", "media_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_watchlist_user" ON "movie_watchlist" USING btree ("user_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_watchlist_user_status" ON "movie_watchlist" USING btree ("user_id", "status", "updated_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_memories_user_date" ON "movie_memories" USING btree ("user_id", "watch_date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_memories_user_media" ON "movie_memories" USING btree ("user_id", "media_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_quotes_user" ON "movie_quotes" USING btree ("user_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_movie_collections_user" ON "movie_collections" USING btree ("user_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_music_notes_user_entity" ON "music_notes" USING btree ("user_id", "entity_type", "entity_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_music_goal_config_user" ON "music_goal_config" USING btree ("user_id", "goal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_gamification_xp_transactions_user_created" ON "gamification_xp_transactions" USING btree ("user_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_integrity_commitments_user_active" ON "integrity_commitments" USING btree ("user_id", "deleted_at", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_integrity_commitments_user_status" ON "integrity_commitments" USING btree ("user_id", "status", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_integrity_daily_checkins_user_date" ON "integrity_daily_checkins" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_journal_insights_user" ON "journal_insights" USING btree ("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_journal_insights_entry" ON "journal_insights" USING btree ("journal_entry_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loans_user_status" ON "loans" USING btree ("user_id", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loans_user_dir" ON "loans" USING btree ("user_id", "direction");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loans_due_date" ON "loans" USING btree ("due_date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loans_connection" ON "loans" USING btree ("connection_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loans_pinned" ON "loans" USING btree ("user_id", "is_pinned");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loan_repayments_loan" ON "loan_repayments" USING btree ("loan_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_loan_events_loan" ON "loan_events" USING btree ("loan_id", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_curb_habits_user_active" ON "curb_habits" USING btree ("user_id", "deleted_at", "sort_order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_curb_logs_user_logged" ON "curb_logs" USING btree ("user_id", "logged_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_curb_logs_habit" ON "curb_logs" USING btree ("habit_id", "logged_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_curb_categories_user" ON "curb_categories" USING btree ("user_id", "sort_order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_routines_user_active" ON "routines" USING btree ("user_id", "is_active");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_routine_items_routine" ON "routine_items" USING btree ("routine_id", "order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_routine_items_user_date" ON "routine_items" USING btree ("user_id", "date");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_routine_executions_user_date" ON "routine_executions" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_routine_executions_routine" ON "routine_executions" USING btree ("routine_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_daily_goals_user_date" ON "daily_goals" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_daily_priorities_user_date" ON "daily_priorities" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_daily_notes_user_date" ON "daily_notes" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_daily_planner_snapshots_user_date" ON "daily_planner_snapshots" USING btree ("user_id", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_time_entries_user_start" ON "time_entries" USING btree ("user_id", "deleted_at", "start_time" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_time_entries_user_category" ON "time_entries" USING btree ("user_id", "category_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_time_categories_user" ON "time_categories" USING btree ("user_id", "sort_order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_time_budgets_user" ON "time_budgets" USING btree ("user_id", "category_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_tags_user" ON "tags" USING btree ("user_id", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_career_resumes_user_active" ON "career_resumes" USING btree ("user_id", "deleted_at", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_job_applications_user_active" ON "job_applications" USING btree ("user_id", "deleted_at", "application_date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_job_applications_user_status" ON "job_applications" USING btree ("user_id", "status", "deleted_at");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_career_interview_prep_user" ON "career_interview_prep" USING btree ("user_id", "application_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_career_certifications_user" ON "career_certifications" USING btree ("user_id", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_portfolio_projects_user_active" ON "portfolio_projects" USING btree ("user_id", "deleted_at", "created_at" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_career_achievements_user_active" ON "career_achievements" USING btree ("user_id", "deleted_at", "date" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_career_salary_records_user_active" ON "career_salary_records" USING btree ("user_id", "deleted_at", "effective_date" DESC);
