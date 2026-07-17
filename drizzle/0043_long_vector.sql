CREATE TABLE "english_daily_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_id" uuid NOT NULL,
	"scheduled_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "english_daily_words_scheduled_date_unique" UNIQUE("scheduled_date")
);
--> statement-breakpoint
CREATE TABLE "english_quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"quiz_type" text NOT NULL,
	"correct" boolean NOT NULL,
	"response_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "english_user_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word_id" uuid NOT NULL,
	"mastery" text DEFAULT 'new' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"review_count" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "english_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"pronunciation" text,
	"part_of_speech" text,
	"definitions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"synonyms" text[] DEFAULT '{}' NOT NULL,
	"antonyms" text[] DEFAULT '{}' NOT NULL,
	"collocations" text[] DEFAULT '{}' NOT NULL,
	"example_sentences" text[] DEFAULT '{}' NOT NULL,
	"topic" text,
	"difficulty" text DEFAULT 'intermediate' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "english_words_word_unique" UNIQUE("word")
);
--> statement-breakpoint
ALTER TABLE "english_daily_words" ADD CONSTRAINT "english_daily_words_word_id_english_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."english_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "english_quiz_attempts" ADD CONSTRAINT "english_quiz_attempts_word_id_english_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."english_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "english_user_vocabulary" ADD CONSTRAINT "english_user_vocabulary_word_id_english_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."english_words"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_english_daily_date" ON "english_daily_words" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_english_quiz_user" ON "english_quiz_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_english_quiz_word" ON "english_quiz_attempts" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_english_user_word" ON "english_user_vocabulary" USING btree ("user_id","word_id");--> statement-breakpoint
CREATE INDEX "idx_english_user_mastery" ON "english_user_vocabulary" USING btree ("user_id","mastery");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_english_word" ON "english_words" USING btree ("word");--> statement-breakpoint
CREATE INDEX "idx_english_topic" ON "english_words" USING btree ("topic");