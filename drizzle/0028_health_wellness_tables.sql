-- Create health & wellness tables
CREATE TABLE IF NOT EXISTS "wellness_weight_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "weight_kg" numeric NOT NULL,
  "body_fat_percentage" numeric,
  "muscle_percentage" numeric,
  "date" date NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_weight_user_date" ON "wellness_weight_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_workout_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "workout_type" text NOT NULL,
  "duration_minutes" integer NOT NULL,
  "calories_burned" integer,
  "distance_km" numeric,
  "notes" text,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_workout_user_date" ON "wellness_workout_entries"("user_id", "date");
CREATE INDEX IF NOT EXISTS "idx_wellness_workout_type" ON "wellness_workout_entries"("user_id", "workout_type");

CREATE TABLE IF NOT EXISTS "wellness_step_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "steps" integer NOT NULL,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_steps_user_date" ON "wellness_step_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_calorie_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "meal_type" text NOT NULL,
  "calories" integer NOT NULL,
  "protein_g" numeric,
  "carbs_g" numeric,
  "fat_g" numeric,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_calories_user_date" ON "wellness_calorie_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_blood_pressure_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "systolic" integer NOT NULL,
  "diastolic" integer NOT NULL,
  "pulse" integer,
  "date" date NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_bp_user_date" ON "wellness_blood_pressure_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_heart_rate_entries" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "resting" integer,
  "average" integer,
  "max" integer,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_hr_user_date" ON "wellness_heart_rate_entries"("user_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_medicine_reminders" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "dosage" text NOT NULL,
  "frequency" text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  "time" text NOT NULL,
  "days_of_week" integer[],
  "start_date" date NOT NULL,
  "end_date" date,
  "is_active" boolean DEFAULT true NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_medicines_user_active" ON "wellness_medicine_reminders"("user_id", "is_active");

CREATE TABLE IF NOT EXISTS "wellness_medicine_logs" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "medicine_id" uuid NOT NULL,
  "status" text NOT NULL CHECK (status IN ('taken', 'skipped', 'snoozed')),
  "scheduled_time" text NOT NULL,
  "taken_at" timestamp with time zone DEFAULT now() NOT NULL,
  "date" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wellness_medicine_logs_medicine_date" ON "wellness_medicine_logs"("medicine_id", "date");

CREATE TABLE IF NOT EXISTS "wellness_user_goals" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS "idx_wellness_goals_user_active" ON "wellness_user_goals"("user_id", "is_active");

CREATE TABLE IF NOT EXISTS "wellness_achievements" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "achievement_type" text NOT NULL,
  "title" text NOT NULL,
  "unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_wellness_achievements_user_type" ON "wellness_achievements"("user_id", "achievement_type");

-- Extend gamification XP event type enum
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'workout_logged';
ALTER TYPE "xp_event_type" ADD VALUE IF NOT EXISTS 'steps_logged';
