CREATE TYPE "public"."roadmap_evidence_type" AS ENUM('knowledge_entry', 'interview_prep', 'portfolio_project', 'milestone');--> statement-breakpoint
CREATE TABLE "field_blueprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text,
	"color" text,
	"phases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "field_blueprints_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "field_roadmap_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_roadmap_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_roadmap_skill_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"entity_type" "roadmap_evidence_type" NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_roadmap_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"blueprint_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"target_role" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "field_roadmap_milestones" ADD CONSTRAINT "field_roadmap_milestones_roadmap_id_field_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."field_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_roadmap_milestones" ADD CONSTRAINT "field_roadmap_milestones_phase_id_field_roadmap_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."field_roadmap_phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_roadmap_phases" ADD CONSTRAINT "field_roadmap_phases_roadmap_id_field_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."field_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_roadmap_skill_evidence" ADD CONSTRAINT "field_roadmap_skill_evidence_skill_id_field_roadmap_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."field_roadmap_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_roadmap_skills" ADD CONSTRAINT "field_roadmap_skills_roadmap_id_field_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."field_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_roadmaps" ADD CONSTRAINT "field_roadmaps_blueprint_id_field_blueprints_id_fk" FOREIGN KEY ("blueprint_id") REFERENCES "public"."field_blueprints"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_field_blueprints_slug" ON "field_blueprints" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_roadmap_milestones_roadmap" ON "field_roadmap_milestones" USING btree ("roadmap_id","phase_id");--> statement-breakpoint
CREATE INDEX "idx_roadmap_phases_roadmap" ON "field_roadmap_phases" USING btree ("roadmap_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_roadmap_skill_evidence_skill" ON "field_roadmap_skill_evidence" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_roadmap_skill_evidence_entity" ON "field_roadmap_skill_evidence" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_roadmap_skills_roadmap" ON "field_roadmap_skills" USING btree ("roadmap_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_field_roadmaps_user_active" ON "field_roadmaps" USING btree ("user_id","is_active","deleted_at");