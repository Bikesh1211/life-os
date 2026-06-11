-- Migration: Wardrobe Management System
-- Creates clothing inventory, outfits, wear tracking, laundry, wishlist, and packing tables.

-- ─── Enums ────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "public"."clothing_category" AS ENUM ('tops', 'bottoms', 'footwear', 'accessories', 'outerwear', 'dresses', 'formal', 'activewear', 'sleepwear', 'swimwear');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."clothing_condition" AS ENUM ('new', 'excellent', 'good', 'fair', 'worn');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."clothing_season" AS ENUM ('spring', 'summer', 'autumn', 'winter', 'all-season');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."clothing_size" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', '28', '30', '32', '34', '36', '38', '40', '6', '7', '8', '9', '10', '11', '12', '13', 'one size');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."outfit_occasion" AS ENUM ('casual', 'office', 'formal', 'wedding', 'party', 'travel', 'gym', 'home', 'date night', 'seasonal', 'festive');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."outfit_mood" AS ENUM ('classic', 'casual', 'chic', 'edgy', 'elegant', 'fun', 'minimal', 'professional', 'relaxed', 'romantic', 'sporty', 'vintage');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."laundry_status" AS ENUM ('ready', 'laundry', 'washing', 'drying', 'ironing', 'stored');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Clothing Items ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "clothing_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "category" "public"."clothing_category" NOT NULL,
  "subcategory" text,
  "brand" text,
  "color" text,
  "size" "public"."clothing_size",
  "material" text,
  "purchase_date" timestamp with time zone,
  "purchase_price" numeric,
  "current_value" numeric,
  "condition" "public"."clothing_condition" DEFAULT 'good' NOT NULL,
  "season" "public"."clothing_season" DEFAULT 'all-season' NOT NULL,
  "is_favorite" boolean DEFAULT false NOT NULL,
  "wear_count" integer DEFAULT 0 NOT NULL,
  "last_worn" timestamp with time zone,
  "laundry_status" text DEFAULT 'ready' NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "notes" text,
  "cover_image" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_clothing_items_user" ON "clothing_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_clothing_items_category" ON "clothing_items"("category");
CREATE INDEX IF NOT EXISTS "idx_clothing_items_user_archived" ON "clothing_items"("user_id", "is_archived");

-- ─── Clothing Images ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "clothing_images" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid NOT NULL REFERENCES "clothing_items"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "is_cover" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_clothing_images_item" ON "clothing_images"("item_id");

-- ─── Wardrobe Tags ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "wardrobe_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "color" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wardrobe_tags_user" ON "wardrobe_tags"("user_id");

CREATE TABLE IF NOT EXISTS "wardrobe_item_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid NOT NULL REFERENCES "clothing_items"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "wardrobe_tags"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wardrobe_item_tags_item" ON "wardrobe_item_tags"("item_id");
CREATE INDEX IF NOT EXISTS "idx_wardrobe_item_tags_tag" ON "wardrobe_item_tags"("tag_id");

-- ─── Outfits ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "outfits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "occasion" "public"."outfit_occasion",
  "season" text,
  "mood" "public"."outfit_mood",
  "is_favorite" boolean DEFAULT false NOT NULL,
  "cover_image" text,
  "notes" text,
  "tags" text[],
  "wear_count" integer DEFAULT 0 NOT NULL,
  "last_worn" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_outfits_user" ON "outfits"("user_id");

CREATE TABLE IF NOT EXISTS "outfit_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "outfit_id" uuid NOT NULL REFERENCES "outfits"("id") ON DELETE CASCADE,
  "item_id" uuid NOT NULL REFERENCES "clothing_items"("id") ON DELETE CASCADE,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_outfit_items_outfit" ON "outfit_items"("outfit_id");
CREATE INDEX IF NOT EXISTS "idx_outfit_items_item" ON "outfit_items"("item_id");

-- ─── Wear History ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "wear_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "item_id" uuid NOT NULL REFERENCES "clothing_items"("id") ON DELETE CASCADE,
  "worn_date" date NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wear_history_user" ON "wear_history"("user_id", "worn_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_wear_history_item" ON "wear_history"("item_id");

-- ─── Laundry ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "laundry_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "item_id" uuid,
  "name" text NOT NULL,
  "status" "public"."laundry_status" DEFAULT 'laundry' NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_laundry_items_user" ON "laundry_items"("user_id", "status");

-- ─── Wishlist ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "wishlist_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "brand" text,
  "category" text,
  "estimated_price" numeric,
  "priority" integer DEFAULT 3 NOT NULL,
  "url" text,
  "notes" text,
  "is_purchased" boolean DEFAULT false NOT NULL,
  "purchased_item_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wishlist_items_user" ON "wishlist_items"("user_id");

-- ─── Packing Lists ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "packing_lists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "destination" text,
  "start_date" date,
  "end_date" date,
  "notes" text,
  "is_completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_packing_lists_user" ON "packing_lists"("user_id");

CREATE TABLE IF NOT EXISTS "packing_list_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "list_id" uuid NOT NULL REFERENCES "packing_lists"("id") ON DELETE CASCADE,
  "item_id" uuid,
  "name" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "is_packed" boolean DEFAULT false NOT NULL,
  "category" text,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_packing_list_items_list" ON "packing_list_items"("list_id");
