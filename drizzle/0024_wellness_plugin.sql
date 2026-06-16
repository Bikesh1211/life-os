-- Create wellness tables
CREATE TABLE IF NOT EXISTS "wellness_mood_logs" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "logged_at" timestamp with time zone DEFAULT now() NOT NULL,
  "happiness" integer NOT NULL CHECK (happiness >= 1 AND happiness <= 10),
  "stress" integer NOT NULL CHECK (stress >= 1 AND stress <= 10),
  "anxiety" integer NOT NULL CHECK (anxiety >= 1 AND anxiety <= 10),
  "motivation" integer NOT NULL CHECK (motivation >= 1 AND motivation <= 10),
  "energy" integer NOT NULL CHECK (energy >= 1 AND energy <= 10),
  "confidence" integer NOT NULL CHECK (confidence >= 1 AND confidence <= 10),
  "focus" integer NOT NULL CHECK (focus >= 1 AND focus <= 10),
  "mental_fatigue" integer NOT NULL CHECK (mental_fatigue >= 1 AND mental_fatigue <= 10),
  "notes" text,
  "tags" text[],
  "emoji" text,
  "voice_note_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_mood_user_time" ON "wellness_mood_logs"("user_id", "logged_at");

CREATE TABLE IF NOT EXISTS "wellness_sleep_records" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "bedtime" timestamp with time zone NOT NULL,
  "wake_time" timestamp with time zone NOT NULL,
  "quality" integer CHECK (quality >= 1 AND quality <= 10),
  "interruptions" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT wake_after_bedtime CHECK (wake_time > bedtime)
);

CREATE INDEX IF NOT EXISTS "idx_wellness_sleep_user_time" ON "wellness_sleep_records"("user_id", "bedtime");

CREATE TABLE IF NOT EXISTS "wellness_hydration_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "date" date NOT NULL,
  "amount_ml" integer NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 5000),
  "logged_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_hydration_user_date" ON "wellness_hydration_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_confidence_checkins" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "date" date NOT NULL,
  "score" integer NOT NULL CHECK (score >= 1 AND score <= 10),
  "self_esteem" integer CHECK (self_esteem >= 1 AND self_esteem <= 10),
  "social_comfort" integer CHECK (social_comfort >= 1 AND social_comfort <= 10),
  "public_speaking_confidence" integer CHECK (public_speaking_confidence >= 1 AND public_speaking_confidence <= 10),
  "appearance_satisfaction" integer CHECK (appearance_satisfaction >= 1 AND appearance_satisfaction <= 10),
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_confidence_user_date" ON "wellness_confidence_checkins"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_habit_enrichment" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "habit_id" uuid NOT NULL,
  "wellness_type" text NOT NULL CHECK (wellness_type IN ('grooming', 'hygiene', 'self-care', 'confidence')),
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

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_enrichment_habit" ON "wellness_habit_enrichment"("user_id", "habit_id");
CREATE INDEX IF NOT EXISTS "idx_wellness_enrichment_type" ON "wellness_habit_enrichment"("user_id", "wellness_type");
CREATE INDEX IF NOT EXISTS "idx_wellness_enrichment_due" ON "wellness_habit_enrichment"("next_due_date");

-- Extend gamification XP event type enum
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'mood_logged';
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'sleep_logged';
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'hydration_logged';
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'confidence_checkin';
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'wellness_streak_bonus';
