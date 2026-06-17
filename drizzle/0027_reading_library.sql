CREATE TABLE IF NOT EXISTS "reading_items" (
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

CREATE TABLE IF NOT EXISTS "reading_annotations" (
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

CREATE TABLE IF NOT EXISTS "reading_notes" (
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

CREATE TABLE IF NOT EXISTS "reading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reading_item_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"pages_read" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_reading_items_user" ON "reading_items" ("user_id", "type", "status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_reading_items_active" ON "reading_items" ("user_id", "deleted_at", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_reading_items_tags" ON "reading_items" USING gin ("tags");
CREATE INDEX IF NOT EXISTS "idx_reading_items_authors" ON "reading_items" USING gin ("authors");
CREATE INDEX IF NOT EXISTS "idx_reading_items_fts" ON "reading_items" USING gin (to_tsvector('english', "title") || to_tsvector('english', "description"));

CREATE INDEX IF NOT EXISTS "idx_reading_annotations_user" ON "reading_annotations" ("user_id", "reading_item_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_reading_annotations_fts" ON "reading_annotations" USING gin (to_tsvector('english', "text"));

CREATE INDEX IF NOT EXISTS "idx_reading_notes_user" ON "reading_notes" ("user_id", "reading_item_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_reading_notes_fts" ON "reading_notes" USING gin (to_tsvector('english', "title"));

CREATE INDEX IF NOT EXISTS "idx_reading_sessions_user" ON "reading_sessions" ("user_id", "reading_item_id", "start_time" DESC);

ALTER TABLE "reading_annotations" ADD CONSTRAINT "reading_annotations_reading_item_id_fkey" FOREIGN KEY ("reading_item_id") REFERENCES "reading_items"("id") ON DELETE CASCADE;
ALTER TABLE "reading_notes" ADD CONSTRAINT "reading_notes_reading_item_id_fkey" FOREIGN KEY ("reading_item_id") REFERENCES "reading_items"("id") ON DELETE CASCADE;
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_reading_item_id_fkey" FOREIGN KEY ("reading_item_id") REFERENCES "reading_items"("id") ON DELETE CASCADE;
