CREATE TYPE "public"."commitment_difficulty" AS ENUM('easy', 'medium', 'hard', 'extreme');--> statement-breakpoint
CREATE TYPE "public"."commitment_repeat" AS ENUM('none', 'daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."commitment_status" AS ENUM('pending', 'in_progress', 'completed_unverified', 'completed_verified', 'failed', 'missed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."commitment_event_type" AS ENUM('created', 'started', 'progress_updated', 'evidence_uploaded', 'completed', 'failed', 'missed', 'cancelled', 'reminder_sent');--> statement-breakpoint
CREATE TYPE "public"."task_recurrence" AS ENUM('none', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."cuisine_type" AS ENUM('italian', 'japanese', 'chinese', 'indian', 'mexican', 'thai', 'french', 'american', 'mediterranean', 'korean', 'vietnamese', 'middle_eastern', 'spanish', 'other');--> statement-breakpoint
CREATE TYPE "public"."travel_expense_category" AS ENUM('flights', 'hotels', 'food', 'transportation', 'shopping', 'activities', 'visa', 'insurance', 'miscellaneous');--> statement-breakpoint
CREATE TYPE "public"."travel_journal_mood" AS ENUM('excited', 'loved_it', 'peaceful', 'emotional', 'amazing', 'difficult');--> statement-breakpoint
CREATE TYPE "public"."restaurant_category" AS ENUM('fine_dining', 'cafe', 'street_food', 'bakery', 'fast_food', 'vegetarian', 'seafood');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('planning', 'booked', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."wishlist_category" AS ENUM('beach', 'mountains', 'historical', 'food', 'adventure', 'nature', 'city', 'spiritual');--> statement-breakpoint
CREATE TYPE "public"."wishlist_priority" AS ENUM('low', 'medium', 'high', 'dream');--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria_type" ADD VALUE 'commitment_count';--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria_type" ADD VALUE 'integrity_score';--> statement-breakpoint
ALTER TYPE "public"."badge_category" ADD VALUE 'integrity';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'mood_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'sleep_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'hydration_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'confidence_checkin';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'wellness_streak_bonus';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'workout_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'steps_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'connection_added';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'meetup_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'event_logged';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'memory_created';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'commitment_completed';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'commitment_streak_bonus';--> statement-breakpoint
ALTER TYPE "public"."xp_event_type" ADD VALUE 'integrity_milestone';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'cancelled';--> statement-breakpoint
CREATE TABLE "book_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"position" jsonb NOT NULL,
	"excerpt" text,
	"label" text,
	"color" text DEFAULT 'yellow',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"part_id" uuid,
	"title" text NOT NULL,
	"content" jsonb DEFAULT '{"type":"doc","content":[]}'::jsonb NOT NULL,
	"order" integer NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"ai_meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"text" text NOT NULL,
	"position" jsonb,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"position" jsonb NOT NULL,
	"text" text NOT NULL,
	"color" text DEFAULT 'yellow',
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_reading_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"scroll_position" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"author_byline" text,
	"language" text DEFAULT 'en',
	"isbn" text,
	"genre" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"cover_url" text,
	"banner_url" text,
	"copyright" text,
	"license" text,
	"publisher" text,
	"edition" text,
	"series" text,
	"reading_level" text,
	"age_rating" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_listed" boolean DEFAULT true NOT NULL,
	"publish_at" timestamp with time zone,
	"word_count" integer DEFAULT 0 NOT NULL,
	"chapter_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "feedback_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"message" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"page_url" text,
	"user_agent" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"target_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrity_commitment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commitment_id" uuid NOT NULL,
	"event_type" "commitment_event_type" NOT NULL,
	"metadata" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrity_commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"difficulty" "commitment_difficulty" DEFAULT 'medium' NOT NULL,
	"estimated_time" integer,
	"due_date" timestamp,
	"due_time" text,
	"start_date" timestamp,
	"tags" text[],
	"color" text,
	"icon" text,
	"evidence_required" boolean DEFAULT false NOT NULL,
	"location" text,
	"repeat_rule" "commitment_repeat" DEFAULT 'none' NOT NULL,
	"reminder_minutes_before" integer,
	"linked_entity_type" text,
	"linked_entity_id" text,
	"cancellation_reason" text,
	"status" "commitment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "integrity_daily_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"blockers" text,
	"improvement" text,
	"reflection" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"media_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_url" text,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"media_id" text NOT NULL,
	"rewatch_count" integer DEFAULT 0 NOT NULL,
	"personal_notes" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_memories" (
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
--> statement-breakpoint
CREATE TABLE "movie_quotes" (
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
--> statement-breakpoint
CREATE TABLE "movie_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"media_id" text NOT NULL,
	"score" integer NOT NULL,
	"review" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_watchlist" (
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
--> statement-breakpoint
CREATE TABLE "movies_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tmdb_id" text NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movies_media_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "movies_people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tmdb_id" text NOT NULL,
	"name" text NOT NULL,
	"profile_path" text,
	"known_for_department" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movies_people_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "network_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"nickname" text,
	"profile_picture_url" text,
	"gender" text,
	"birthday" date,
	"phone" text,
	"email" text,
	"address" text,
	"country" text,
	"city" text,
	"occupation" text,
	"social_links" text[] DEFAULT '{}' NOT NULL,
	"relationship_types" text[] DEFAULT '{}' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"first_met_date" date,
	"friendship_anniversary" date,
	"last_met_date" date,
	"last_call_date" date,
	"last_message_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_event_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"location" text,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"expense" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"gift_name" text NOT NULL,
	"occasion" text,
	"price" integer,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_meetup_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meetup_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_meetups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"location" text,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"expense" integer,
	"notes" text,
	"mood" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"photo_urls" text[] DEFAULT '{}' NOT NULL,
	"video_urls" text[] DEFAULT '{}' NOT NULL,
	"audio_url" text,
	"quotes" text,
	"memory_date" date,
	"location" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_memory_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_id" uuid NOT NULL,
	"connection_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "network_trip_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" uuid NOT NULL,
	"trip_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" uuid,
	"color" text DEFAULT 'blue' NOT NULL,
	"icon" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"linked_note_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reading_item_id" uuid NOT NULL,
	"type" text NOT NULL,
	"text" text NOT NULL,
	"color" text,
	"note" text,
	"page" integer,
	"location" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_favorited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"authors" text[] DEFAULT '{}' NOT NULL,
	"publisher" text,
	"isbn" text,
	"doi" text,
	"journal" text,
	"url" text,
	"file_url" text,
	"cover_url" text,
	"description" text,
	"language" text DEFAULT 'en',
	"published_year" integer,
	"page_count" integer,
	"status" text DEFAULT 'want_to_read' NOT NULL,
	"current_page" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"last_opened_at" timestamp with time zone,
	"rating" integer,
	"review" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_favorited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reading_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reading_item_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reading_item_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"pages_read" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_tasks_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"label_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
	"category" "travel_expense_category" NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "travel_journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
	"title" text NOT NULL,
	"cover_image" text,
	"location" text,
	"date" timestamp with time zone,
	"mood" "travel_journal_mood",
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
--> statement-breakpoint
CREATE TABLE "travel_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
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
--> statement-breakpoint
CREATE TABLE "travel_restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
	"name" text NOT NULL,
	"country" text,
	"city" text,
	"cuisine" "cuisine_type",
	"category" "restaurant_category",
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
--> statement-breakpoint
CREATE TABLE "travel_trip_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"date" timestamp with time zone,
	"title" text,
	"notes" text,
	"places" jsonb DEFAULT '[]'::jsonb,
	"restaurants" jsonb DEFAULT '[]'::jsonb,
	"activities" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"destination" text NOT NULL,
	"country" text,
	"cover_image" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" "trip_status" DEFAULT 'planning' NOT NULL,
	"budget" integer,
	"currency" text DEFAULT 'USD',
	"travelers" integer DEFAULT 1,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "travel_visited_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trip_id" uuid,
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
--> statement-breakpoint
CREATE TABLE "travel_wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"country" text,
	"city" text,
	"priority" "wishlist_priority" DEFAULT 'medium' NOT NULL,
	"category" "wishlist_category",
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
--> statement-breakpoint
CREATE TABLE "wellness_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_type" text NOT NULL,
	"title" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_blood_pressure_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"systolic" integer NOT NULL,
	"diastolic" integer NOT NULL,
	"pulse" integer,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_calorie_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"meal_type" text NOT NULL,
	"calories" integer NOT NULL,
	"protein_g" numeric,
	"carbs_g" numeric,
	"fat_g" numeric,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_confidence_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"score" integer NOT NULL,
	"self_esteem" integer,
	"social_comfort" integer,
	"public_speaking_confidence" integer,
	"appearance_satisfaction" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_habit_enrichment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"habit_id" uuid NOT NULL,
	"wellness_type" text NOT NULL,
	"subcategory" text,
	"last_completed_date" date,
	"next_due_date" date,
	"reminder_days_before" integer DEFAULT 3 NOT NULL,
	"seasonal_months" integer[],
	"estimated_cost" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_heart_rate_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"resting" integer,
	"average" integer,
	"max" integer,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_hydration_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"amount_ml" integer NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_medicine_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"medicine_id" uuid NOT NULL,
	"status" text NOT NULL,
	"scheduled_time" text NOT NULL,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_medicine_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"time" text NOT NULL,
	"days_of_week" integer[],
	"start_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_mood_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"happiness" integer NOT NULL,
	"stress" integer NOT NULL,
	"anxiety" integer NOT NULL,
	"motivation" integer NOT NULL,
	"energy" integer NOT NULL,
	"confidence" integer NOT NULL,
	"focus" integer NOT NULL,
	"mental_fatigue" integer NOT NULL,
	"notes" text,
	"tags" text[],
	"emoji" text,
	"voice_note_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_sleep_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bedtime" timestamp with time zone NOT NULL,
	"wake_time" timestamp with time zone NOT NULL,
	"quality" integer,
	"interruptions" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_step_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"steps" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_user_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"goal_type" text NOT NULL,
	"title" text NOT NULL,
	"target_value" numeric NOT NULL,
	"current_value" numeric DEFAULT '0' NOT NULL,
	"unit" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_weight_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"weight_kg" numeric NOT NULL,
	"body_fat_percentage" numeric,
	"muscle_percentage" numeric,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_workout_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"workout_type" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"calories_burned" integer,
	"distance_km" numeric,
	"notes" text,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_notes_user_active";--> statement-breakpoint
ALTER TABLE "routine_items" ALTER COLUMN "routine_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "task_projects" ALTER COLUMN "color" SET DEFAULT 'blue';--> statement-breakpoint
ALTER TABLE "task_projects" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_projects" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "task_projects" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "task_projects" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'p3';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "type" text DEFAULT 'short-term' NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "completion_date" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "linked_entity_type" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "linked_entity_id" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "ai_suggested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "reward" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "content_json" jsonb;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "folder_id" uuid;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "priority" text;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "date" text;--> statement-breakpoint
ALTER TABLE "routine_items" ADD COLUMN "status" "routine_item_status";--> statement-breakpoint
ALTER TABLE "task_projects" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "description_json" jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "estimated_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "actual_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence" "task_recurrence" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "book_bookmarks" ADD CONSTRAINT "book_bookmarks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_bookmarks" ADD CONSTRAINT "book_bookmarks_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_chapters" ADD CONSTRAINT "book_chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_chapters" ADD CONSTRAINT "book_chapters_part_id_book_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."book_parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_collaborators" ADD CONSTRAINT "book_collaborators_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_comments" ADD CONSTRAINT "book_comments_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_highlights" ADD CONSTRAINT "book_highlights_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_highlights" ADD CONSTRAINT "book_highlights_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_parts" ADD CONSTRAINT "book_parts_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reading_progress" ADD CONSTRAINT "book_reading_progress_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reading_progress" ADD CONSTRAINT "book_reading_progress_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_versions" ADD CONSTRAINT "book_versions_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrity_commitment_events" ADD CONSTRAINT "integrity_commitment_events_commitment_id_integrity_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."integrity_commitments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_collection_items" ADD CONSTRAINT "movie_collection_items_collection_id_movie_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."movie_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_event_connections" ADD CONSTRAINT "network_event_connections_event_id_network_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."network_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_event_connections" ADD CONSTRAINT "network_event_connections_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_gifts" ADD CONSTRAINT "network_gifts_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_meetup_connections" ADD CONSTRAINT "network_meetup_connections_meetup_id_network_meetups_id_fk" FOREIGN KEY ("meetup_id") REFERENCES "public"."network_meetups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_meetup_connections" ADD CONSTRAINT "network_meetup_connections_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_memory_connections" ADD CONSTRAINT "network_memory_connections_memory_id_network_memories_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."network_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_memory_connections" ADD CONSTRAINT "network_memory_connections_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_trip_participants" ADD CONSTRAINT "network_trip_participants_connection_id_network_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."network_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_linked_note_id_notes_id_fk" FOREIGN KEY ("linked_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_annotations" ADD CONSTRAINT "reading_annotations_reading_item_id_reading_items_id_fk" FOREIGN KEY ("reading_item_id") REFERENCES "public"."reading_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_notes" ADD CONSTRAINT "reading_notes_reading_item_id_reading_items_id_fk" FOREIGN KEY ("reading_item_id") REFERENCES "public"."reading_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_reading_item_id_reading_items_id_fk" FOREIGN KEY ("reading_item_id") REFERENCES "public"."reading_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tasks_labels" ADD CONSTRAINT "task_tasks_labels_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tasks_labels" ADD CONSTRAINT "task_tasks_labels_label_id_task_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."task_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_expenses" ADD CONSTRAINT "travel_expenses_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_journals" ADD CONSTRAINT "travel_journals_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_photos" ADD CONSTRAINT "travel_photos_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_restaurants" ADD CONSTRAINT "travel_restaurants_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_trip_days" ADD CONSTRAINT "travel_trip_days_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_visited_places" ADD CONSTRAINT "travel_visited_places_trip_id_travel_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."travel_trips"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_book_bookmarks_user_book" ON "book_bookmarks" USING btree ("user_id","book_id","chapter_id");--> statement-breakpoint
CREATE INDEX "idx_book_bookmarks_created" ON "book_bookmarks" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_book_chapters_book" ON "book_chapters" USING btree ("book_id","order");--> statement-breakpoint
CREATE INDEX "idx_book_chapters_part" ON "book_chapters" USING btree ("part_id","order");--> statement-breakpoint
CREATE INDEX "idx_book_chapters_fts" ON "book_chapters" USING gin (to_tsvector('english', "title" || ' ' || coalesce("content"::text, '')));--> statement-breakpoint
CREATE INDEX "idx_book_collaborators_book" ON "book_collaborators" USING btree ("book_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_book_collaborators_user" ON "book_collaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_book_comments_chapter" ON "book_comments" USING btree ("chapter_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_book_highlights_user_book" ON "book_highlights" USING btree ("user_id","book_id","chapter_id");--> statement-breakpoint
CREATE INDEX "idx_book_highlights_color" ON "book_highlights" USING btree ("user_id","color");--> statement-breakpoint
CREATE INDEX "idx_book_parts_book" ON "book_parts" USING btree ("book_id","order");--> statement-breakpoint
CREATE INDEX "idx_book_progress_user_book" ON "book_reading_progress" USING btree ("user_id","book_id");--> statement-breakpoint
CREATE INDEX "idx_book_versions_chapter" ON "book_versions" USING btree ("chapter_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_books_user" ON "books" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_books_user_deleted" ON "books" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_books_fts" ON "books" USING gin (to_tsvector('english', "title" || ' ' || coalesce("description", '')));--> statement-breakpoint
CREATE INDEX "idx_feedback_user" ON "feedback_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_read" ON "feedback_entries" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "idx_network_connections_user" ON "network_connections" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_network_connections_fav" ON "network_connections" USING btree ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "idx_network_connections_bday" ON "network_connections" USING btree ("birthday");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_network_event_conn" ON "network_event_connections" USING btree ("event_id","connection_id");--> statement-breakpoint
CREATE INDEX "idx_network_events_user_date" ON "network_events" USING btree ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_network_events_type" ON "network_events" USING btree ("user_id","event_type");--> statement-breakpoint
CREATE INDEX "idx_network_gifts_user_conn" ON "network_gifts" USING btree ("user_id","connection_id");--> statement-breakpoint
CREATE INDEX "idx_network_gifts_dir" ON "network_gifts" USING btree ("user_id","direction");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_network_meetup_conn" ON "network_meetup_connections" USING btree ("meetup_id","connection_id");--> statement-breakpoint
CREATE INDEX "idx_network_meetups_user_date" ON "network_meetups" USING btree ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_network_memories_user_date" ON "network_memories" USING btree ("user_id","memory_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_network_memories_fav" ON "network_memories" USING btree ("user_id","is_favorite");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_network_memory_conn" ON "network_memory_connections" USING btree ("memory_id","connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_network_trip_participant" ON "network_trip_participants" USING btree ("connection_id","trip_id");--> statement-breakpoint
CREATE INDEX "idx_network_trip_trip" ON "network_trip_participants" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_note_folders_user" ON "note_folders" USING btree ("user_id","parent_id");--> statement-breakpoint
CREATE INDEX "idx_note_links_note" ON "note_links" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "idx_note_links_linked" ON "note_links" USING btree ("linked_note_id");--> statement-breakpoint
CREATE INDEX "idx_reading_annotations_user" ON "reading_annotations" USING btree ("user_id","reading_item_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_annotations_fts" ON "reading_annotations" USING gin (to_tsvector('english', "text"));--> statement-breakpoint
CREATE INDEX "idx_reading_items_user" ON "reading_items" USING btree ("user_id","type","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_items_active" ON "reading_items" USING btree ("user_id","deleted_at","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_items_tags" ON "reading_items" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_reading_items_authors" ON "reading_items" USING gin ("authors");--> statement-breakpoint
CREATE INDEX "idx_reading_items_fts" ON "reading_items" USING gin ((to_tsvector('english', "title") || to_tsvector('english', "description")));--> statement-breakpoint
CREATE INDEX "idx_reading_notes_user" ON "reading_notes" USING btree ("user_id","reading_item_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_notes_fts" ON "reading_notes" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "idx_reading_sessions_user" ON "reading_sessions" USING btree ("user_id","reading_item_id","start_time" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_task_labels_user" ON "task_labels" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_task_tasks_labels_task" ON "task_tasks_labels" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_task_tasks_labels_label" ON "task_tasks_labels" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "idx_travel_expenses_trip" ON "travel_expenses" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_travel_expenses_category" ON "travel_expenses" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "idx_travel_expenses_date" ON "travel_expenses" USING btree ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_journals_user" ON "travel_journals" USING btree ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_journals_trip" ON "travel_journals" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_travel_photos_user" ON "travel_photos" USING btree ("user_id","date_taken" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_photos_trip" ON "travel_photos" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_travel_photos_album" ON "travel_photos" USING btree ("user_id","album");--> statement-breakpoint
CREATE INDEX "idx_travel_restaurants_user" ON "travel_restaurants" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_restaurants_country" ON "travel_restaurants" USING btree ("user_id","country");--> statement-breakpoint
CREATE INDEX "idx_travel_trip_days" ON "travel_trip_days" USING btree ("trip_id","day_number");--> statement-breakpoint
CREATE INDEX "idx_travel_trips_user" ON "travel_trips" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_trips_active" ON "travel_trips" USING btree ("user_id","deleted_at","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_visited_user" ON "travel_visited_places" USING btree ("user_id","visit_start" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_visited_country" ON "travel_visited_places" USING btree ("user_id","country");--> statement-breakpoint
CREATE INDEX "idx_travel_wishlist_user" ON "travel_wishlist" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_travel_wishlist_category" ON "travel_wishlist" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_achievements_user_type" ON "wellness_achievements" USING btree ("user_id","achievement_type");--> statement-breakpoint
CREATE INDEX "idx_wellness_bp_user_date" ON "wellness_blood_pressure_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_calories_user_date" ON "wellness_calorie_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_confidence_user_date" ON "wellness_confidence_checkins" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_enrichment_habit" ON "wellness_habit_enrichment" USING btree ("user_id","habit_id");--> statement-breakpoint
CREATE INDEX "idx_wellness_enrichment_type" ON "wellness_habit_enrichment" USING btree ("user_id","wellness_type");--> statement-breakpoint
CREATE INDEX "idx_wellness_enrichment_due" ON "wellness_habit_enrichment" USING btree ("next_due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_hr_user_date" ON "wellness_heart_rate_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_hydration_user_date" ON "wellness_hydration_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_medicine_logs_medicine_date" ON "wellness_medicine_logs" USING btree ("medicine_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_medicines_user_active" ON "wellness_medicine_reminders" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_wellness_mood_user_time" ON "wellness_mood_logs" USING btree ("user_id","logged_at");--> statement-breakpoint
CREATE INDEX "idx_wellness_sleep_user_time" ON "wellness_sleep_records" USING btree ("user_id","bedtime");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_wellness_steps_user_date" ON "wellness_step_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_goals_user_active" ON "wellness_user_goals" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_wellness_weight_user_date" ON "wellness_weight_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_workout_user_date" ON "wellness_workout_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_wellness_workout_type" ON "wellness_workout_entries" USING btree ("user_id","workout_type");--> statement-breakpoint
CREATE INDEX "idx_notes_folder" ON "notes" USING btree ("user_id","folder_id");--> statement-breakpoint
CREATE INDEX "idx_task_projects_user" ON "task_projects" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_user" ON "tasks" USING btree ("user_id","status","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_due_date" ON "tasks" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_parent" ON "tasks" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("user_id","priority");--> statement-breakpoint
CREATE INDEX "idx_notes_user_active" ON "notes" USING btree ("user_id","status","is_pinned" DESC NULLS LAST,"created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN "is_archived";--> statement-breakpoint
DROP TYPE "public"."task_priority";