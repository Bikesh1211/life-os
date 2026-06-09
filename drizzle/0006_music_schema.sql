-- Migration: Music module tables
-- This migration adds all music tracking tables.

-- Artists reference data
CREATE TABLE IF NOT EXISTS "music_artists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "music_brainz_id" text UNIQUE,
  "name" text NOT NULL,
  "country" text,
  "type" text,
  "genres" text[] DEFAULT '{}' NOT NULL,
  "image_url" text,
  "spotify_id" text UNIQUE,
  "spotify_popularity" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Albums reference data
CREATE TABLE IF NOT EXISTS "music_albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "music_brainz_id" text UNIQUE,
  "artist_id" uuid NOT NULL REFERENCES "music_artists"("id"),
  "title" text NOT NULL,
  "release_date" timestamp with time zone,
  "cover_art_url" text,
  "total_tracks" integer,
  "spotify_id" text UNIQUE,
  "spotify_popularity" integer,
  "label" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Tracks reference data
CREATE TABLE IF NOT EXISTS "music_tracks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "music_brainz_id" text UNIQUE,
  "album_id" uuid REFERENCES "music_albums"("id"),
  "artist_id" uuid NOT NULL REFERENCES "music_artists"("id"),
  "title" text NOT NULL,
  "duration" integer,
  "track_number" integer,
  "isrc" text,
  "spotify_uri" text,
  "spotify_id" text UNIQUE,
  "spotify_popularity" integer,
  "explicit" boolean DEFAULT false,
  "preview_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Listening history (user-scoped)
CREATE TABLE IF NOT EXISTS "music_listening_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "track_id" uuid REFERENCES "music_tracks"("id"),
  "artist_name" text,
  "track_name" text,
  "listened_at" timestamp with time zone DEFAULT now() NOT NULL,
  "duration" integer,
  "ms_played" integer,
  "spotify_play_id" text,
  "session_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Music journal entries (user-scoped)
CREATE TABLE IF NOT EXISTS "music_journal" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "track_id" uuid REFERENCES "music_tracks"("id"),
  "album_id" uuid REFERENCES "music_albums"("id"),
  "artist_id" uuid REFERENCES "music_artists"("id"),
  "mood" text,
  "journal_entry" text NOT NULL,
  "photo_urls" text[] DEFAULT '{}',
  "location" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Music memories (user-scoped)
CREATE TABLE IF NOT EXISTS "music_memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "track_id" uuid REFERENCES "music_tracks"("id"),
  "artist_id" uuid REFERENCES "music_artists"("id"),
  "context_text" text NOT NULL,
  "linked_event_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Ratings (user-scoped, polymorphic)
CREATE TABLE IF NOT EXISTS "music_ratings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "score" integer NOT NULL,
  "review" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Favorites (user-scoped, polymorphic)
CREATE TABLE IF NOT EXISTS "music_favorites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Collections (user-scoped)
CREATE TABLE IF NOT EXISTS "music_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "cover_art_url" text,
  "is_smart" boolean DEFAULT false NOT NULL,
  "smart_filter" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

-- Collection items
CREATE TABLE IF NOT EXISTS "music_collection_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "collection_id" uuid NOT NULL REFERENCES "music_collections"("id") ON DELETE CASCADE,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Goal config (links to external goals plugin)
CREATE TABLE IF NOT EXISTS "music_goal_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "goal_id" text NOT NULL,
  "target_type" text NOT NULL,
  "target_value" text,
  "target_count" integer,
  "current_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Spotify OAuth tokens (user-scoped, one per user)
CREATE TABLE IF NOT EXISTS "music_spotify_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL UNIQUE,
  "access_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "scope" text,
  "last_synced_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_music_listening_user" ON "music_listening_history"("user_id", "listened_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_journal_user" ON "music_journal"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_memories_user" ON "music_memories"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_ratings_entity" ON "music_ratings"("user_id", "entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_music_favorites_user" ON "music_favorites"("user_id", "entity_type");
CREATE INDEX IF NOT EXISTS "idx_music_collections_user" ON "music_collections"("user_id") WHERE "deleted_at" IS NULL;
