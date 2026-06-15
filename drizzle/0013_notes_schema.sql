ALTER TABLE "notes" ADD COLUMN "category" text DEFAULT 'personal' NOT NULL;
ALTER TABLE "notes" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;
ALTER TABLE "notes" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;
ALTER TABLE "notes" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;
ALTER TABLE "notes" ADD COLUMN "reminder_date" timestamp with time zone;
ALTER TABLE "notes" ADD COLUMN "priority" text DEFAULT 'medium' NOT NULL;

CREATE TABLE "note_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "color" text DEFAULT 'blue' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "idx_notes_user_active" ON "notes" ("user_id", "is_archived", "is_pinned" DESC, "created_at" DESC);
CREATE INDEX "idx_notes_category" ON "notes" ("user_id", "category");
CREATE INDEX "idx_notes_tags" ON "notes" USING gin ("tags");
CREATE INDEX "idx_note_tags_user" ON "note_tags" ("user_id", "name");
