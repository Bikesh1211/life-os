-- Migration: Music Library Ecosystem
-- Consolidates previous 0014 (life soundtrack) + new library/memory_songs tables.
-- Supersedes the abandoned 0014_music_life_soundtrack.sql (never applied).

-- ─── Enhance music_memories ──────────────────────────────────────

ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "album_id" uuid REFERENCES "music_albums"("id");
ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "mood" text;
ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "photo_urls" text[] DEFAULT '{}';
ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "memory_date" timestamp with time zone;
ALTER TABLE "music_memories" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

-- ─── Journal Songs (songs attached to a journal entry) ───────────

CREATE TABLE IF NOT EXISTS "music_journal_songs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "journal_id" uuid NOT NULL REFERENCES "music_journal"("id") ON DELETE CASCADE,
  "track_id" uuid REFERENCES "music_tracks"("id"),
  "album_id" uuid REFERENCES "music_albums"("id"),
  "artist_id" uuid REFERENCES "music_artists"("id"),
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_music_journal_songs_journal" ON "music_journal_songs"("journal_id");
CREATE INDEX IF NOT EXISTS "idx_music_journal_songs_track" ON "music_journal_songs"("track_id");

-- ─── Mood Entries (standalone mood tracking) ─────────────────────

CREATE TABLE IF NOT EXISTS "music_mood_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "mood" text NOT NULL,
  "note" text,
  "date" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_music_mood_entries_user" ON "music_mood_entries"("user_id", "date" DESC);

-- ─── Music Library (user's personal saved-song catalog) ──────────

CREATE TABLE IF NOT EXISTS "music_library" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "track_id" uuid NOT NULL REFERENCES "music_tracks"("id"),
  "added_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_music_library_user" ON "music_library"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_music_library_user_track" ON "music_library"("user_id", "track_id");

-- ─── Memory Songs (multiple songs per memory) ────────────────────

CREATE TABLE IF NOT EXISTS "music_memory_songs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "memory_id" uuid NOT NULL REFERENCES "music_memories"("id") ON DELETE CASCADE,
  "track_id" uuid NOT NULL REFERENCES "music_tracks"("id"),
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_music_memory_songs_memory" ON "music_memory_songs"("memory_id");
CREATE INDEX IF NOT EXISTS "idx_music_memory_songs_track" ON "music_memory_songs"("track_id");
