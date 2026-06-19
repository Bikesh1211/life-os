CREATE TABLE IF NOT EXISTS "feedback_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "category" text DEFAULT 'general' NOT NULL,
  "message" text NOT NULL,
  "is_anonymous" boolean DEFAULT false NOT NULL,
  "page_url" text,
  "user_agent" text,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_feedback_user" ON "feedback_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_feedback_read" ON "feedback_entries" ("read_at");
