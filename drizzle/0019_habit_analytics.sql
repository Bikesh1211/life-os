-- Create habit category enum
CREATE TYPE "public"."habit_category" AS ENUM('health', 'fitness', 'reading', 'learning', 'productivity', 'mindfulness', 'finance', 'social', 'creative');

-- Create habit frequency enum
CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'weekly', 'monthly');

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS "habit_completions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "habit_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "completed_date" date NOT NULL,
  "note" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_habits_id_fkey"
  FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE CASCADE;

-- Add category column to habits
ALTER TABLE "habits" ADD COLUMN "category" "public"."habit_category";

-- Drop default before altering type, then re-add
ALTER TABLE "habits" ALTER COLUMN "frequency" DROP DEFAULT;
ALTER TABLE "habits" ALTER COLUMN "frequency" SET DATA TYPE "public"."habit_frequency"
  USING CASE
    WHEN "frequency" IN ('daily', 'weekly', 'monthly') THEN "frequency"::"public"."habit_frequency"
    ELSE 'daily'::"public"."habit_frequency"
  END;
ALTER TABLE "habits" ALTER COLUMN "frequency" SET DEFAULT 'daily'::"public"."habit_frequency";

-- Remove streak column (computed on-read from habit_completions)
ALTER TABLE "habits" DROP COLUMN IF EXISTS "streak";

-- Create index for fast analytics queries
CREATE INDEX IF NOT EXISTS "habit_completions_user_date_idx" ON "habit_completions" ("user_id", "completed_date");
CREATE INDEX IF NOT EXISTS "habit_completions_habit_date_idx" ON "habit_completions" ("habit_id", "completed_date");
CREATE UNIQUE INDEX IF NOT EXISTS "habit_completions_habit_date_unique_idx" ON "habit_completions" ("habit_id", "user_id", "completed_date");
