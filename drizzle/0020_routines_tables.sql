CREATE TYPE "public"."routine_schedule_type" AS ENUM('daily', 'weekdays', 'weekends', 'custom');
CREATE TYPE "public"."routine_execution_status" AS ENUM('pending', 'in_progress', 'completed', 'skipped', 'missed');
CREATE TYPE "public"."routine_item_status" AS ENUM('pending', 'in_progress', 'completed', 'skipped');

CREATE TABLE IF NOT EXISTS "routines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "color" text,
  "icon" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "schedule_type" "public"."routine_schedule_type" DEFAULT 'daily' NOT NULL,
  "custom_days" text[],
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "routine_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "routine_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "start_time" text NOT NULL,
  "end_time" text,
  "order" integer DEFAULT 0 NOT NULL,
  "is_optional" boolean DEFAULT false NOT NULL,
  "linked_habit_id" text,
  "linked_task_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "routine_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "routine_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "date" text NOT NULL,
  "planned_start" text,
  "planned_end" text,
  "actual_start" text,
  "actual_end" text,
  "status" "public"."routine_execution_status" DEFAULT 'pending' NOT NULL,
  "completion_rate" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "routine_execution_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "execution_id" uuid NOT NULL,
  "routine_item_id" uuid NOT NULL,
  "planned_start" text,
  "planned_end" text,
  "actual_start" text,
  "actual_end" text,
  "status" "public"."routine_item_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "routine_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "color" text,
  "icon" text,
  "schedule_type" "public"."routine_schedule_type" DEFAULT 'daily' NOT NULL,
  "custom_days" text[],
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "routine_template_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "template_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "start_time" text NOT NULL,
  "end_time" text,
  "order" integer DEFAULT 0 NOT NULL,
  "is_optional" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "routine_items" ADD CONSTRAINT "routine_items_routine_id_routines_id_fkey"
  FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;

ALTER TABLE "routine_executions" ADD CONSTRAINT "routine_executions_routine_id_routines_id_fkey"
  FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE CASCADE;

ALTER TABLE "routine_execution_items" ADD CONSTRAINT "routine_execution_items_execution_id_routine_executions_id_fkey"
  FOREIGN KEY ("execution_id") REFERENCES "public"."routine_executions"("id") ON DELETE CASCADE;

ALTER TABLE "routine_execution_items" ADD CONSTRAINT "routine_execution_items_routine_item_id_routine_items_id_fkey"
  FOREIGN KEY ("routine_item_id") REFERENCES "public"."routine_items"("id") ON DELETE CASCADE;

ALTER TABLE "routine_template_items" ADD CONSTRAINT "routine_template_items_template_id_routine_templates_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "public"."routine_templates"("id") ON DELETE CASCADE;
