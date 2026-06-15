CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings', 'credit', 'cash', 'wallet', 'investment');--> statement-breakpoint
CREATE TYPE "public"."budget_period" AS ENUM('weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'debit_card', 'credit_card', 'bank_transfer', 'digital_wallet', 'upi', 'paypal', 'crypto');--> statement-breakpoint
CREATE TYPE "public"."transaction_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."achievement_criteria_type" AS ENUM('habit_count', 'task_count', 'routine_count', 'level_reached', 'streak_days', 'challenge_completed');--> statement-breakpoint
CREATE TYPE "public"."badge_category" AS ENUM('habits', 'tasks', 'routines', 'streaks', 'general');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."xp_event_type" AS ENUM('habit_completed', 'task_completed', 'routine_completed', 'daily_login', 'streak_bonus', 'achievement_bonus', 'badge_bonus', 'challenge_completed');--> statement-breakpoint
CREATE TYPE "public"."habit_category" AS ENUM('health', 'fitness', 'reading', 'learning', 'productivity', 'mindfulness', 'finance', 'social', 'creative');--> statement-breakpoint
CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."knowledge_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."knowledge_review_status" AS ENUM('not_reviewed', 'reviewing', 'mastered');--> statement-breakpoint
CREATE TYPE "public"."routine_execution_status" AS ENUM('pending', 'in_progress', 'completed', 'skipped', 'missed');--> statement-breakpoint
CREATE TYPE "public"."routine_item_status" AS ENUM('pending', 'in_progress', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."routine_schedule_type" AS ENUM('daily', 'weekdays', 'weekends', 'custom');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" NOT NULL,
	"balance" numeric DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'NPR' NOT NULL,
	"icon" text,
	"color" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"period" "budget_period" DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transaction_tags" (
	"transaction_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "transaction_tags_transaction_id_tag_id_pk" PRIMARY KEY("transaction_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"account_id" uuid,
	"category_id" uuid,
	"type" "transaction_type" DEFAULT 'expense' NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text DEFAULT 'NPR' NOT NULL,
	"merchant" text,
	"description" text,
	"payment_method" "payment_method",
	"transaction_date" timestamp with time zone NOT NULL,
	"location" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence" "transaction_recurrence" DEFAULT 'none' NOT NULL,
	"recurrence_end_date" timestamp with time zone,
	"attachments" text[] DEFAULT '{}',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gamification_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"criteria_type" "achievement_criteria_type" NOT NULL,
	"criteria_value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" "badge_category" NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"criteria_type" "achievement_criteria_type" NOT NULL,
	"criteria_value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"challenge_type" "challenge_type" NOT NULL,
	"criteria_type" "achievement_criteria_type" NOT NULL,
	"criteria_value" integer NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"badge_id" uuid,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gamification_user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gamification_user_achievements_user_id_achievement_id_unique" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "gamification_user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" uuid NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gamification_user_badges_user_id_badge_id_unique" UNIQUE("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "gamification_user_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "gamification_user_challenges_user_id_challenge_id_unique" UNIQUE("user_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE "gamification_user_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"consistency_score" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gamification_user_metrics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "gamification_xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "xp_event_type" NOT NULL,
	"event_source" text NOT NULL,
	"xp_amount" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"completed_date" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"subcategory" text,
	"date_learned" timestamp with time zone NOT NULL,
	"summary" text,
	"detailed_notes" text,
	"key_takeaways" text,
	"examples" text,
	"resources" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"difficulty_level" "knowledge_difficulty" DEFAULT 'beginner' NOT NULL,
	"learning_source" text,
	"resource_url" text,
	"mastery_level" integer DEFAULT 1 NOT NULL,
	"confidence_score" integer DEFAULT 1 NOT NULL,
	"time_spent" integer,
	"review_status" "knowledge_review_status" DEFAULT 'not_reviewed' NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"next_actions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "knowledge_entry_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"linked_entry_id" uuid NOT NULL,
	"relationship_type" text DEFAULT 'related_to' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"music_brainz_id" text,
	"artist_id" uuid NOT NULL,
	"title" text NOT NULL,
	"release_date" timestamp with time zone,
	"cover_art_url" text,
	"total_tracks" integer,
	"spotify_id" text,
	"spotify_popularity" integer,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "music_albums_music_brainz_id_unique" UNIQUE("music_brainz_id"),
	CONSTRAINT "music_albums_spotify_id_unique" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "music_artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"music_brainz_id" text,
	"name" text NOT NULL,
	"country" text,
	"type" text,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"image_url" text,
	"spotify_id" text,
	"spotify_popularity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "music_artists_music_brainz_id_unique" UNIQUE("music_brainz_id"),
	CONSTRAINT "music_artists_spotify_id_unique" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "music_collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_collections" (
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
--> statement-breakpoint
CREATE TABLE "music_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_goal_config" (
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
--> statement-breakpoint
CREATE TABLE "music_journal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_id" uuid,
	"album_id" uuid,
	"artist_id" uuid,
	"mood" text,
	"journal_entry" text NOT NULL,
	"photo_urls" text[] DEFAULT '{}',
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_journal_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" uuid NOT NULL,
	"track_id" uuid,
	"album_id" uuid,
	"artist_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_listening_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_id" uuid,
	"artist_name" text,
	"track_name" text,
	"listened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration" integer,
	"ms_played" integer,
	"spotify_play_id" text,
	"session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_id" text,
	"album_id" text,
	"artist_id" text,
	"title" text,
	"context_text" text NOT NULL,
	"mood" text,
	"photo_urls" text[] DEFAULT '{}',
	"memory_date" timestamp with time zone,
	"linked_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_memory_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"memory_id" uuid NOT NULL,
	"track_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_mood_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"mood" text NOT NULL,
	"note" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "music_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"review" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_spotify_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"scope" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "music_spotify_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "music_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"music_brainz_id" text,
	"album_id" uuid,
	"artist_id" uuid NOT NULL,
	"title" text NOT NULL,
	"duration" integer,
	"track_number" integer,
	"isrc" text,
	"spotify_uri" text,
	"spotify_id" text,
	"spotify_popularity" integer,
	"explicit" boolean DEFAULT false,
	"preview_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "music_tracks_music_brainz_id_unique" UNIQUE("music_brainz_id"),
	CONSTRAINT "music_tracks_spotify_id_unique" UNIQUE("spotify_id")
);
--> statement-breakpoint
CREATE TABLE "note_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_execution_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"routine_item_id" uuid NOT NULL,
	"planned_start" text,
	"planned_end" text,
	"actual_start" text,
	"actual_end" text,
	"status" "routine_item_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"planned_start" text,
	"planned_end" text,
	"actual_start" text,
	"actual_end" text,
	"status" "routine_execution_status" DEFAULT 'pending' NOT NULL,
	"completion_rate" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" text NOT NULL,
	"end_time" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"linked_habit_id" text,
	"linked_task_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_template_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" text NOT NULL,
	"end_time" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"icon" text,
	"schedule_type" "routine_schedule_type" DEFAULT 'daily' NOT NULL,
	"custom_days" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"icon" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"schedule_type" "routine_schedule_type" DEFAULT 'daily' NOT NULL,
	"custom_days" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "chat_conversations" CASCADE;--> statement-breakpoint
DROP TABLE "chat_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "habits" ALTER COLUMN "frequency" SET DATA TYPE habit_frequency;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "category" "habit_category";--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "category" text DEFAULT 'personal' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "reminder_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "priority" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "activity_type" text;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "start_time" text;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "end_time" text;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "mood" integer;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "energy" integer;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "linked_entity_id" text;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD COLUMN "linked_entity_type" text;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_challenges" ADD CONSTRAINT "gamification_challenges_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_user_achievements" ADD CONSTRAINT "gamification_user_achievements_achievement_id_gamification_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."gamification_achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_user_badges" ADD CONSTRAINT "gamification_user_badges_badge_id_gamification_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."gamification_badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gamification_user_challenges" ADD CONSTRAINT "gamification_user_challenges_challenge_id_gamification_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."gamification_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_entry_links" ADD CONSTRAINT "knowledge_entry_links_entry_id_knowledge_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."knowledge_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_entry_links" ADD CONSTRAINT "knowledge_entry_links_linked_entry_id_knowledge_entries_id_fk" FOREIGN KEY ("linked_entry_id") REFERENCES "public"."knowledge_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_albums" ADD CONSTRAINT "music_albums_artist_id_music_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."music_artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_collection_items" ADD CONSTRAINT "music_collection_items_collection_id_music_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."music_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal" ADD CONSTRAINT "music_journal_track_id_music_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."music_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal" ADD CONSTRAINT "music_journal_album_id_music_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."music_albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal" ADD CONSTRAINT "music_journal_artist_id_music_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."music_artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal_songs" ADD CONSTRAINT "music_journal_songs_journal_id_music_journal_id_fk" FOREIGN KEY ("journal_id") REFERENCES "public"."music_journal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal_songs" ADD CONSTRAINT "music_journal_songs_track_id_music_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."music_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal_songs" ADD CONSTRAINT "music_journal_songs_album_id_music_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."music_albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_journal_songs" ADD CONSTRAINT "music_journal_songs_artist_id_music_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."music_artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_library" ADD CONSTRAINT "music_library_track_id_music_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."music_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_listening_history" ADD CONSTRAINT "music_listening_history_track_id_music_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."music_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_memory_songs" ADD CONSTRAINT "music_memory_songs_memory_id_music_memories_id_fk" FOREIGN KEY ("memory_id") REFERENCES "public"."music_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_album_id_music_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."music_albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_tracks" ADD CONSTRAINT "music_tracks_artist_id_music_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."music_artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_execution_items" ADD CONSTRAINT "routine_execution_items_execution_id_routine_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."routine_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_execution_items" ADD CONSTRAINT "routine_execution_items_routine_item_id_routine_items_id_fk" FOREIGN KEY ("routine_item_id") REFERENCES "public"."routine_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_executions" ADD CONSTRAINT "routine_executions_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_template_items" ADD CONSTRAINT "routine_template_items_template_id_routine_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."routine_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_note_tags_user" ON "note_tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_notes_user_active" ON "notes" USING btree ("user_id","is_archived","is_pinned" DESC NULLS LAST,"created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_notes_category" ON "notes" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "idx_notes_tags" ON "notes" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_notes_fts" ON "notes" USING gin ((to_tsvector('english', "title") || to_tsvector('english', "content")));--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "streak";