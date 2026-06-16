-- Add new columns to notes table
ALTER TABLE "notes" ADD COLUMN "content_json" jsonb;
ALTER TABLE "notes" ADD COLUMN "excerpt" text;
ALTER TABLE "notes" ADD COLUMN "cover_image" text;
ALTER TABLE "notes" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;
ALTER TABLE "notes" ADD COLUMN "folder_id" uuid;

-- Migrate existing is_archived data to status
UPDATE "notes" SET "status" = 'archived' WHERE "is_archived" = true;
UPDATE "notes" SET "status" = 'published' WHERE "is_archived" = false OR "is_archived" IS NULL;

-- Drop old is_archived column
ALTER TABLE "notes" DROP COLUMN "is_archived";

-- Create note_folders table
CREATE TABLE IF NOT EXISTS "note_folders" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "parent_id" uuid,
  "color" text DEFAULT 'blue' NOT NULL,
  "icon" text,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create note_links table
CREATE TABLE IF NOT EXISTS "note_links" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "note_id" uuid NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
  "linked_note_id" uuid NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_notes_folder" ON "notes"("user_id", "folder_id");
CREATE INDEX IF NOT EXISTS "idx_note_folders_user" ON "note_folders"("user_id", "parent_id");
CREATE INDEX IF NOT EXISTS "idx_note_links_note" ON "note_links"("note_id");
CREATE INDEX IF NOT EXISTS "idx_note_links_linked" ON "note_links"("linked_note_id");

-- Drop old is_archived index, create updated one
DROP INDEX IF EXISTS "idx_notes_user_active";
CREATE INDEX "idx_notes_user_active" ON "notes"("user_id", "status", "is_pinned" DESC, "created_at" DESC);
