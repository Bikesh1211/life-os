-- Migration: Movies plugin tables
-- Creates movies reference data and memory tracking tables

CREATE TABLE IF NOT EXISTS "movies_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tmdb_id" text UNIQUE NOT NULL,
  "media_type" text NOT NULL,
  "title" text NOT NULL,
  "overview" text,
  "poster_path" text,
  "backdrop_path" text,
  "release_date" timestamp with time zone,
  "genres" text[] DEFAULT '{}' NOT NULL,
  "vote_average" real,
  "runtime" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movies_people" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tmdb_id" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "profile_path" text,
  "known_for_department" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text,
  "person_id" text,
  "title" text,
  "context_text" text NOT NULL,
  "mood" text,
  "photo_urls" text[] DEFAULT '{}',
  "watch_date" timestamp with time zone,
  "location" text,
  "linked_event_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_memory_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "memory_id" uuid NOT NULL REFERENCES "movie_memories"("id") ON DELETE CASCADE,
  "media_id" text NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_memory_people" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "memory_id" uuid NOT NULL REFERENCES "movie_memories"("id") ON DELETE CASCADE,
  "person_id" text NOT NULL,
  "role" text,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
