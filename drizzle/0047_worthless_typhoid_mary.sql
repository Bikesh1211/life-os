CREATE TABLE "script_action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"icon" text DEFAULT 'Mic' NOT NULL,
	"color" text DEFAULT '#6C5CE7' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"default_template_id" uuid,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"practiced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"confidence" integer DEFAULT 5 NOT NULL,
	"mistakes" text[] DEFAULT '{}' NOT NULL,
	"voice_quality" integer DEFAULT 5 NOT NULL,
	"eye_contact" integer DEFAULT 5 NOT NULL,
	"body_language_notes" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"improvements" text,
	"sections_practiced" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"question" text NOT NULL,
	"suggested_answer" text,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"confidence" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'needs_practice' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" jsonb DEFAULT '{"type":"doc","content":[]}'::jsonb NOT NULL,
	"sort_order" integer NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"estimated_duration_seconds" integer DEFAULT 0 NOT NULL,
	"speaker_notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_structure_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"name" text NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"note" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"category_id" uuid,
	"purpose" text,
	"audience" text,
	"venue" text,
	"language" text DEFAULT 'en',
	"event_date" timestamp with time zone,
	"event_time" text,
	"expected_duration" integer,
	"speaker" text,
	"organization" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"attachments" text[] DEFAULT '{}' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"section_count" integer DEFAULT 0 NOT NULL,
	"total_duration_seconds" integer DEFAULT 0 NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "travel_helper_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"origin" jsonb NOT NULL,
	"destination" jsonb NOT NULL,
	"waypoints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"polyline" text,
	"total_distance_km" numeric(10, 2),
	"total_duration_minutes" integer,
	"transport_mode" text DEFAULT 'driving' NOT NULL,
	"route_date" date,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"elevation_min" numeric(8, 2),
	"elevation_max" numeric(8, 2),
	"elevation_gain" numeric(8, 2),
	"elevation_loss" numeric(8, 2),
	"geometries" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "script_action_items" ADD CONSTRAINT "script_action_items_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_checklist_items" ADD CONSTRAINT "script_checklist_items_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_practice_sessions" ADD CONSTRAINT "script_practice_sessions_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_questions" ADD CONSTRAINT "script_questions_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_sections" ADD CONSTRAINT "script_sections_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_structure_templates" ADD CONSTRAINT "script_structure_templates_category_id_script_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."script_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_versions" ADD CONSTRAINT "script_versions_script_id_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_category_id_script_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."script_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_script_actions_script" ON "script_action_items" USING btree ("script_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_script_categories_user" ON "script_categories" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_script_categories_active" ON "script_categories" USING btree ("user_id","is_archived");--> statement-breakpoint
CREATE INDEX "idx_script_checklist_script" ON "script_checklist_items" USING btree ("script_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_script_practice_script" ON "script_practice_sessions" USING btree ("script_id","practiced_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_script_practice_user_date" ON "script_practice_sessions" USING btree ("user_id","practiced_at");--> statement-breakpoint
CREATE INDEX "idx_script_questions_script" ON "script_questions" USING btree ("script_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_script_sections_script" ON "script_sections" USING btree ("script_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_script_templates_category" ON "script_structure_templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_script_versions_script" ON "script_versions" USING btree ("script_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_scripts_user" ON "scripts" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_scripts_user_deleted" ON "scripts" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_scripts_favorites" ON "scripts" USING btree ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "idx_scripts_fts" ON "scripts" USING gin (to_tsvector('english', "title" || ' ' || coalesce("subtitle", '') || ' ' || coalesce("speaker", '') || ' ' || coalesce("venue", '')));--> statement-breakpoint
CREATE INDEX "idx_th_routes_user" ON "travel_helper_routes" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_th_routes_active" ON "travel_helper_routes" USING btree ("user_id","deleted_at","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_th_routes_date" ON "travel_helper_routes" USING btree ("user_id","route_date");