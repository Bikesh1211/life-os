-- Explore Mode — the Adventure Archive's reading of the travel records.
--
-- No new tables. Trips, visited places and the wishlist already hold every
-- outing taken and every destination still wanted; what was missing was the
-- handful of fields an expedition archive needs to draw them — a kind, a
-- position, and how hard the ground was.

-- `CREATE TYPE` has no `IF NOT EXISTS`, and this file has to be safe to run
-- twice: this database was built with `db:push`, so migrations get applied
-- individually rather than replayed from an empty schema.
DO $$ BEGIN
  CREATE TYPE "public"."travel_difficulty" AS ENUM('easy', 'moderate', 'hard', 'extreme');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."travel_planning_status" AS ENUM('planned', 'researching', 'ready');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "category" "wishlist_category";--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "distance_km" integer;--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "elevation_m" integer;--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "transportation" text;--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "difficulty" "travel_difficulty";--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "gallery" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_trips" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint

ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "category" "wishlist_category";--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "latitude" double precision;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "longitude" double precision;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "elevation" integer;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "cover_image" text;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "gallery" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD COLUMN IF NOT EXISTS "maps_url" text;--> statement-breakpoint

ALTER TABLE "travel_wishlist" ADD COLUMN IF NOT EXISTS "latitude" double precision;--> statement-breakpoint
ALTER TABLE "travel_wishlist" ADD COLUMN IF NOT EXISTS "longitude" double precision;--> statement-breakpoint
ALTER TABLE "travel_wishlist" ADD COLUMN IF NOT EXISTS "difficulty" "travel_difficulty";--> statement-breakpoint
ALTER TABLE "travel_wishlist" ADD COLUMN IF NOT EXISTS "planning_status" "travel_planning_status";--> statement-breakpoint

-- The archive's own reads: everything by user, newest first, and the map's
-- "only what has a fix" filter.
CREATE INDEX IF NOT EXISTS "idx_travel_visited_position"
  ON "travel_visited_places" ("user_id", "latitude", "longitude");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_travel_trips_category"
  ON "travel_trips" ("user_id", "category");
