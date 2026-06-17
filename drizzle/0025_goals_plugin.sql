ALTER TABLE "goals" ADD COLUMN "type" text DEFAULT 'short-term' NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "completion_date" timestamp;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "linked_entity_type" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "linked_entity_id" text;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "ai_suggested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "reward" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL REFERENCES "goals"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"target_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
