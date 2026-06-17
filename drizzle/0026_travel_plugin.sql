-- Migration: Travel & Places plugin
-- Creates all travel module tables and enums.

-- ─── Enums ─────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "public"."trip_status" AS ENUM ('planning', 'booked', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."wishlist_priority" AS ENUM ('low', 'medium', 'high', 'dream');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."wishlist_category" AS ENUM ('beach', 'mountains', 'historical', 'food', 'adventure', 'nature', 'city', 'spiritual');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."travel_journal_mood" AS ENUM ('excited', 'loved_it', 'peaceful', 'emotional', 'amazing', 'difficult');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."travel_expense_category" AS ENUM ('flights', 'hotels', 'food', 'transportation', 'shopping', 'activities', 'visa', 'insurance', 'miscellaneous');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."restaurant_category" AS ENUM ('fine_dining', 'cafe', 'street_food', 'bakery', 'fast_food', 'vegetarian', 'seafood');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."cuisine_type" AS ENUM ('italian', 'japanese', 'chinese', 'indian', 'mexican', 'thai', 'french', 'american', 'mediterranean', 'korean', 'vietnamese', 'middle_eastern', 'spanish', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Trips ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_trips" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "destination" text NOT NULL,
  "country" text,
  "cover_image" text,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "status" "public"."trip_status" DEFAULT 'planning' NOT NULL,
  "budget" integer,
  "currency" text DEFAULT 'USD',
  "travelers" integer DEFAULT 1,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_trips_user" ON "travel_trips"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_trips_active" ON "travel_trips"("user_id", "deleted_at", "created_at" DESC);

-- ─── Trip Days ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_trip_days" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trip_id" uuid NOT NULL REFERENCES "travel_trips"("id") ON DELETE CASCADE,
  "day_number" integer NOT NULL,
  "date" timestamp with time zone,
  "title" text,
  "notes" text,
  "places" jsonb DEFAULT '[]',
  "restaurants" jsonb DEFAULT '[]',
  "activities" jsonb DEFAULT '[]',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_travel_trip_days" ON "travel_trip_days"("trip_id", "day_number");

-- ─── Wishlist ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_wishlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "country" text,
  "city" text,
  "priority" "public"."wishlist_priority" DEFAULT 'medium' NOT NULL,
  "category" "public"."wishlist_category",
  "estimated_budget" integer,
  "best_season" text,
  "cover_image" text,
  "inspirational_quote" text,
  "why_visit" text,
  "planned_year" integer,
  "is_favorited" boolean DEFAULT false NOT NULL,
  "tags" text[] DEFAULT '{}' NOT NULL,
  "is_visited" boolean DEFAULT false NOT NULL,
  "visited_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_wishlist_user" ON "travel_wishlist"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_wishlist_category" ON "travel_wishlist"("user_id", "category");

-- ─── Visited Places ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_visited_places" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "travel_trips"("id") ON DELETE SET NULL,
  "country" text NOT NULL,
  "city" text NOT NULL,
  "place" text,
  "visit_start" timestamp with time zone,
  "visit_end" timestamp with time zone,
  "rating" integer,
  "mood" text,
  "weather" text,
  "notes" text,
  "companions" text[] DEFAULT '{}' NOT NULL,
  "activities" text[] DEFAULT '{}' NOT NULL,
  "total_days" integer,
  "is_favorited" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_visited_user" ON "travel_visited_places"("user_id", "visit_start" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_visited_country" ON "travel_visited_places"("user_id", "country");

-- ─── Travel Journals ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_journals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "travel_trips"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "cover_image" text,
  "location" text,
  "date" timestamp with time zone,
  "mood" "public"."travel_journal_mood",
  "content" text,
  "story" text,
  "lessons_learned" text,
  "favorite_moment" text,
  "food_tried" text,
  "people_met" text,
  "would_do_again" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_journals_user" ON "travel_journals"("user_id", "date" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_journals_trip" ON "travel_journals"("trip_id");

-- ─── Photos ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "travel_trips"("id") ON DELETE SET NULL,
  "album" text,
  "url" text NOT NULL,
  "thumbnail" text,
  "caption" text,
  "date_taken" timestamp with time zone,
  "camera" text,
  "location" text,
  "weather" text,
  "latitude" text,
  "longitude" text,
  "tags" text[] DEFAULT '{}' NOT NULL,
  "is_favorited" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_photos_user" ON "travel_photos"("user_id", "date_taken" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_photos_trip" ON "travel_photos"("trip_id");
CREATE INDEX IF NOT EXISTS "idx_travel_photos_album" ON "travel_photos"("user_id", "album");

-- ─── Expenses ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "travel_trips"("id") ON DELETE CASCADE,
  "category" "public"."travel_expense_category" NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'USD' NOT NULL,
  "converted_amount" integer,
  "converted_currency" text DEFAULT 'USD',
  "description" text,
  "date" timestamp with time zone DEFAULT now() NOT NULL,
  "receipt_url" text,
  "is_split" boolean DEFAULT false NOT NULL,
  "split_with" text[] DEFAULT '{}' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_travel_expenses_trip" ON "travel_expenses"("trip_id");
CREATE INDEX IF NOT EXISTS "idx_travel_expenses_category" ON "travel_expenses"("user_id", "category");
CREATE INDEX IF NOT EXISTS "idx_travel_expenses_date" ON "travel_expenses"("user_id", "date" DESC);

-- ─── Restaurants ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "travel_restaurants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "trip_id" uuid REFERENCES "travel_trips"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "country" text,
  "city" text,
  "cuisine" "public"."cuisine_type",
  "category" "public"."restaurant_category",
  "rating" integer,
  "price_range" integer,
  "photos" text[] DEFAULT '{}' NOT NULL,
  "notes" text,
  "best_dish" text,
  "favorite_drink" text,
  "visit_count" integer DEFAULT 1 NOT NULL,
  "last_visit" timestamp with time zone,
  "food_memory" text,
  "food_memory_mood" text,
  "is_favorited" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_travel_restaurants_user" ON "travel_restaurants"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_travel_restaurants_country" ON "travel_restaurants"("user_id", "country");
