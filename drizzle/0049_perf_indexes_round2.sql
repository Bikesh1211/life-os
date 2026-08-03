-- Performance round 2: indexes on child/junction tables that are only
-- reachable through their parent FK and have grown with usage.
--
-- Every one of these was flagged by a performance audit because the only
-- access path is the FK column (or a scheduled-job time scan) and no index
-- exists — meaning each lookup is a full table scan.

CREATE INDEX IF NOT EXISTS "idx_integrity_commitment_events_commitment" ON "integrity_commitment_events" USING btree ("commitment_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_goal_milestones_goal" ON "goal_milestones" USING btree ("goal_id", "order");
CREATE INDEX IF NOT EXISTS "idx_routine_execution_items_execution" ON "routine_execution_items" USING btree ("execution_id");
CREATE INDEX IF NOT EXISTS "idx_routine_execution_items_item" ON "routine_execution_items" USING btree ("routine_item_id");
CREATE INDEX IF NOT EXISTS "idx_countdown_checklist_items_event" ON "countdown_checklist_items" USING btree ("event_id", "order");
CREATE INDEX IF NOT EXISTS "idx_countdown_reminders_event" ON "countdown_reminders" USING btree ("event_id");
CREATE INDEX IF NOT EXISTS "idx_countdown_reminders_due" ON "countdown_reminders" USING btree ("reminder_at", "is_sent") WHERE "is_sent" = false;
CREATE INDEX IF NOT EXISTS "idx_countdown_memories_event" ON "countdown_memories" USING btree ("event_id");
CREATE INDEX IF NOT EXISTS "idx_music_collection_items_collection" ON "music_collection_items" USING btree ("collection_id", "position");
CREATE INDEX IF NOT EXISTS "idx_music_collection_items_entity" ON "music_collection_items" USING btree ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_music_library_user_added" ON "music_library" USING btree ("user_id", "added_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_library_track" ON "music_library" USING btree ("track_id");
CREATE INDEX IF NOT EXISTS "idx_music_listening_track" ON "music_listening_history" USING btree ("track_id");
CREATE INDEX IF NOT EXISTS "idx_music_albums_artist" ON "music_albums" USING btree ("artist_id");
CREATE INDEX IF NOT EXISTS "idx_music_tracks_album" ON "music_tracks" USING btree ("album_id");
CREATE INDEX IF NOT EXISTS "idx_music_tracks_artist" ON "music_tracks" USING btree ("artist_id");
CREATE INDEX IF NOT EXISTS "idx_movie_collection_items_collection" ON "movie_collection_items" USING btree ("collection_id", "position");
CREATE INDEX IF NOT EXISTS "idx_movie_collection_items_media" ON "movie_collection_items" USING btree ("media_id");
CREATE INDEX IF NOT EXISTS "idx_career_resume_versions_resume" ON "career_resume_versions" USING btree ("resume_id", "created_at" DESC);
