CREATE TABLE IF NOT EXISTS "books" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "subtitle" text,
  "description" text,
  "author_byline" text,
  "language" text DEFAULT 'en',
  "isbn" text,
  "genre" text,
  "tags" text[] DEFAULT '{}' NOT NULL,
  "keywords" text[] DEFAULT '{}' NOT NULL,
  "cover_url" text,
  "banner_url" text,
  "copyright" text,
  "license" text,
  "publisher" text,
  "edition" text,
  "series" text,
  "reading_level" text,
  "age_rating" text,
  "status" text DEFAULT 'draft' NOT NULL,
  "is_listed" boolean DEFAULT true NOT NULL,
  "publish_at" timestamp with time zone,
  "word_count" integer DEFAULT 0 NOT NULL,
  "chapter_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "idx_books_user" ON "books" ("user_id", "status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_books_user_deleted" ON "books" ("user_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_books_fts" ON "books" USING gin (to_tsvector('english', "title" || ' ' || COALESCE("description", '')));

CREATE TABLE IF NOT EXISTS "book_parts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "order" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_parts_book" ON "book_parts" ("book_id", "order");

CREATE TABLE IF NOT EXISTS "book_chapters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "part_id" uuid REFERENCES "book_parts"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "content" jsonb DEFAULT '{"type":"doc","content":[]}'::jsonb NOT NULL,
  "order" integer NOT NULL,
  "word_count" integer DEFAULT 0 NOT NULL,
  "ai_meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_chapters_book" ON "book_chapters" ("book_id", "order");
CREATE INDEX IF NOT EXISTS "idx_book_chapters_part" ON "book_chapters" ("part_id", "order");
CREATE INDEX IF NOT EXISTS "idx_book_chapters_fts" ON "book_chapters" USING gin (to_tsvector('english', "title" || ' ' || COALESCE("content"::text, '')));

CREATE TABLE IF NOT EXISTS "book_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chapter_id" uuid NOT NULL REFERENCES "book_chapters"("id") ON DELETE CASCADE,
  "content" jsonb NOT NULL,
  "word_count" integer DEFAULT 0 NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_versions_chapter" ON "book_versions" ("chapter_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "book_collaborators" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "role" text DEFAULT 'editor' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_collaborators_book" ON "book_collaborators" ("book_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_book_collaborators_user" ON "book_collaborators" ("user_id");

CREATE TABLE IF NOT EXISTS "book_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chapter_id" uuid NOT NULL REFERENCES "book_chapters"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "text" text NOT NULL,
  "position" jsonb,
  "parent_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_comments_chapter" ON "book_comments" ("chapter_id", "created_at");

CREATE TABLE IF NOT EXISTS "book_reading_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "chapter_id" uuid NOT NULL REFERENCES "book_chapters"("id") ON DELETE CASCADE,
  "scroll_position" integer DEFAULT 0 NOT NULL,
  "percentage" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_progress_user_book" ON "book_reading_progress" ("user_id", "book_id");

CREATE TABLE IF NOT EXISTS "book_bookmarks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "chapter_id" uuid NOT NULL REFERENCES "book_chapters"("id") ON DELETE CASCADE,
  "position" jsonb NOT NULL,
  "excerpt" text,
  "label" text,
  "color" text DEFAULT 'yellow',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_bookmarks_user_book" ON "book_bookmarks" ("user_id", "book_id", "chapter_id");
CREATE INDEX IF NOT EXISTS "idx_book_bookmarks_created" ON "book_bookmarks" ("user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "book_highlights" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "chapter_id" uuid NOT NULL REFERENCES "book_chapters"("id") ON DELETE CASCADE,
  "position" jsonb NOT NULL,
  "text" text NOT NULL,
  "color" text DEFAULT 'yellow',
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_book_highlights_user_book" ON "book_highlights" ("user_id", "book_id", "chapter_id");
CREATE INDEX IF NOT EXISTS "idx_book_highlights_color" ON "book_highlights" ("user_id", "color");
