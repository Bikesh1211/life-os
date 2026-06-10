-- Migration: Knowledge Vault module tables
-- This migration adds all knowledge tracking tables.

-- Enums
DO $$ BEGIN
  CREATE TYPE "public"."knowledge_difficulty" AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."knowledge_review_status" AS ENUM ('not_reviewed', 'reviewing', 'mastered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Knowledge entries
CREATE TABLE IF NOT EXISTS "knowledge_entries" (
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

-- Knowledge entry links (knowledge graph)
CREATE TABLE IF NOT EXISTS "knowledge_entry_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entry_id" uuid NOT NULL REFERENCES "knowledge_entries"("id") ON DELETE CASCADE,
  "linked_entry_id" uuid NOT NULL REFERENCES "knowledge_entries"("id") ON DELETE CASCADE,
  "relationship_type" text DEFAULT 'related_to' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_knowledge_entries_user" ON "knowledge_entries"("user_id", "date_learned" DESC);
CREATE INDEX IF NOT EXISTS "idx_knowledge_entries_subject" ON "knowledge_entries"("user_id", "subject");
CREATE INDEX IF NOT EXISTS "idx_knowledge_entries_review" ON "knowledge_entries"("user_id", "review_status") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_knowledge_entries_tags" ON "knowledge_entries" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "idx_knowledge_entry_links_entry" ON "knowledge_entry_links"("entry_id");
