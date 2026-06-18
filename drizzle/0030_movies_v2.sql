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
  "episode_runtime" integer,
  "seasons" integer,
  "episodes" integer,
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

CREATE TABLE IF NOT EXISTS "movie_favorites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text NOT NULL,
  "rewatch_count" integer DEFAULT 0 NOT NULL,
  "personal_notes" text,
  "added_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_ratings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text NOT NULL,
  "score" integer NOT NULL,
  "review" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_watchlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text NOT NULL,
  "status" text DEFAULT 'plan_to_watch' NOT NULL,
  "priority" text DEFAULT 'medium',
  "tags" text[] DEFAULT '{}',
  "notes" text,
  "reminder" timestamp with time zone,
  "current_season" integer DEFAULT 1,
  "current_episode" integer DEFAULT 0,
  "total_seasons" integer,
  "total_episodes" integer,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text,
  "title" text,
  "watched_with" text,
  "location" text,
  "mood" text,
  "context_text" text NOT NULL,
  "photo_urls" text[] DEFAULT '{}',
  "ticket_urls" text[] DEFAULT '{}',
  "screenshot_urls" text[] DEFAULT '{}',
  "tags" text[] DEFAULT '{}',
  "watch_date" timestamp with time zone,
  "linked_event_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_quotes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "media_id" text,
  "quote" text NOT NULL,
  "character" text,
  "timestamp" text,
  "personal_meaning" text,
  "is_favorite" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "cover_url" text,
  "tags" text[] DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "movie_collection_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "collection_id" uuid NOT NULL REFERENCES "movie_collections"("id") ON DELETE CASCADE,
  "media_id" text NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "added_at" timestamp with time zone DEFAULT now() NOT NULL
);
