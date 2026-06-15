DO $$ BEGIN
  CREATE TYPE "xp_event_type" AS ENUM('habit_completed', 'task_completed', 'routine_completed', 'daily_login', 'streak_bonus', 'achievement_bonus', 'badge_bonus', 'challenge_completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "challenge_type" AS ENUM('daily', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "achievement_criteria_type" AS ENUM('habit_count', 'task_count', 'routine_count', 'level_reached', 'streak_days', 'challenge_completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "badge_category" AS ENUM('habits', 'tasks', 'routines', 'streaks', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "gamification_user_metrics" (
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

CREATE TABLE IF NOT EXISTS "gamification_xp_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "event_type" "xp_event_type" NOT NULL,
  "event_source" text NOT NULL,
  "xp_amount" integer NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gamification_achievements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "icon" text NOT NULL,
  "xp_reward" integer DEFAULT 0 NOT NULL,
  "criteria_type" "achievement_criteria_type" NOT NULL,
  "criteria_value" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gamification_user_achievements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "achievement_id" uuid NOT NULL REFERENCES "gamification_achievements"("id") ON DELETE cascade,
  "unlocked_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "gamification_user_achievements_user_id_achievement_id_unique" UNIQUE("user_id", "achievement_id")
);

CREATE TABLE IF NOT EXISTS "gamification_badges" (
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

CREATE TABLE IF NOT EXISTS "gamification_user_badges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "badge_id" uuid NOT NULL REFERENCES "gamification_badges"("id") ON DELETE cascade,
  "unlocked_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "gamification_user_badges_user_id_badge_id_unique" UNIQUE("user_id", "badge_id")
);

CREATE TABLE IF NOT EXISTS "gamification_challenges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "challenge_type" "challenge_type" NOT NULL,
  "criteria_type" "achievement_criteria_type" NOT NULL,
  "criteria_value" integer NOT NULL,
  "xp_reward" integer DEFAULT 0 NOT NULL,
  "badge_id" uuid REFERENCES "gamification_badges"("id") ON DELETE set null,
  "starts_at" timestamp NOT NULL,
  "ends_at" timestamp NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gamification_user_challenges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "challenge_id" uuid NOT NULL REFERENCES "gamification_challenges"("id") ON DELETE cascade,
  "progress" integer DEFAULT 0 NOT NULL,
  "is_completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp,
  CONSTRAINT "gamification_user_challenges_user_id_challenge_id_unique" UNIQUE("user_id", "challenge_id")
);
