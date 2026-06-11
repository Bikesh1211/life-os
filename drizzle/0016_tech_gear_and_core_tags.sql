-- Migration: Tech Gear + Core Tags
-- Creates the shared core_tags/core_taggings system and the tech-gear module tables.

-- ─── Core Tags ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "core_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "color" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_core_tags_user" ON "core_tags"("user_id");

CREATE TABLE IF NOT EXISTS "core_taggings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tag_id" uuid NOT NULL REFERENCES "core_tags"("id") ON DELETE CASCADE,
  "entity_id" uuid NOT NULL,
  "entity_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_core_taggings_entity" ON "core_taggings"("entity_id", "entity_type");
CREATE INDEX IF NOT EXISTS "idx_core_taggings_tag" ON "core_taggings"("tag_id");

-- ─── Tech Gear Enums ──────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "public"."ownership_status" AS ENUM ('owned', 'sold', 'lost', 'loaned-out', 'borrowed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."tech_condition" AS ENUM ('new', 'excellent', 'good', 'fair', 'broken', 'repairing');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Tech Items ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "tech_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "brand" text,
  "model" text,
  "category" text NOT NULL,
  "serial_number" text,
  "color" text,
  "location" text,
  "purchase_price" numeric,
  "purchase_date" timestamp with time zone,
  "warranty_expiry" timestamp with time zone,
  "warranty_provider" text,
  "ownership_status" "public"."ownership_status" DEFAULT 'owned' NOT NULL,
  "condition" "public"."tech_condition" DEFAULT 'good' NOT NULL,
  "specifications" jsonb DEFAULT '{}',
  "loaned_to" text,
  "loan_date" timestamp with time zone,
  "expected_return_date" timestamp with time zone,
  "is_favorite" boolean DEFAULT false NOT NULL,
  "notes" text,
  "cover_image" text,
  "is_archived" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_tech_items_user" ON "tech_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tech_items_category" ON "tech_items"("category");

-- ─── Tech Setups ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "tech_setups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_favorite" boolean DEFAULT false NOT NULL,
  "cover_image" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_tech_setups_user" ON "tech_setups"("user_id");

CREATE TABLE IF NOT EXISTS "tech_setup_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "setup_id" uuid NOT NULL REFERENCES "tech_setups"("id") ON DELETE CASCADE,
  "item_id" uuid NOT NULL REFERENCES "tech_items"("id") ON DELETE CASCADE,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_tech_setup_items_setup" ON "tech_setup_items"("setup_id");
CREATE INDEX IF NOT EXISTS "idx_tech_setup_items_item" ON "tech_setup_items"("item_id");

-- ─── Tech Maintenance Log ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "tech_maintenance_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid NOT NULL REFERENCES "tech_items"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "date" timestamp with time zone DEFAULT now() NOT NULL,
  "description" text NOT NULL,
  "cost" numeric,
  "provider" text,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_tech_maintenance_item" ON "tech_maintenance_log"("item_id");
