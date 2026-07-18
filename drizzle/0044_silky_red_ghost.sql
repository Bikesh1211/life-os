CREATE TYPE "public"."fitness_activity_level" AS ENUM('sedentary', 'light', 'moderate', 'active', 'very_active');--> statement-breakpoint
CREATE TYPE "public"."fitness_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."fitness_equipment" AS ENUM('barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'bands', 'kettlebell', 'other');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal" AS ENUM('lose_fat', 'build_muscle', 'maintain', 'improve_endurance', 'general_health');--> statement-breakpoint
CREATE TYPE "public"."fitness_force_type" AS ENUM('push', 'pull', 'static', 'isolation', 'compound');--> statement-breakpoint
CREATE TYPE "public"."fitness_gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."fitness_muscle_group" AS ENUM('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio');--> statement-breakpoint
CREATE TYPE "public"."fitness_record_type" AS ENUM('one_rep_max', 'max_weight', 'max_reps', 'best_volume', 'best_time', 'best_distance');--> statement-breakpoint
CREATE TYPE "public"."fitness_workout_goal" AS ENUM('lose_fat', 'build_muscle', 'maintain', 'endurance', 'general');--> statement-breakpoint
CREATE TABLE "fitness_body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 1),
	"body_fat_percentage" numeric(4, 1),
	"muscle_mass_kg" numeric(5, 1),
	"waist_cm" numeric(4, 1),
	"hips_cm" numeric(4, 1),
	"chest_cm" numeric(4, 1),
	"arms_cm" numeric(4, 1),
	"thighs_cm" numeric(4, 1),
	"neck_cm" numeric(4, 1),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_exercise_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"muscle_group" "fitness_muscle_group" NOT NULL,
	"equipment" "fitness_equipment" DEFAULT 'bodyweight' NOT NULL,
	"force_type" "fitness_force_type",
	"difficulty" "fitness_difficulty" DEFAULT 'beginner' NOT NULL,
	"instructions" text,
	"video_url" text,
	"is_cardio" boolean DEFAULT false NOT NULL,
	"is_bodyweight" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_exercise_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight_kg" numeric(5, 1),
	"rpe" integer,
	"duration_seconds" integer,
	"distance_meters" numeric(7, 1),
	"is_warmup" boolean DEFAULT false NOT NULL,
	"is_drop_set" boolean DEFAULT false NOT NULL,
	"is_failure" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_personal_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exercise_id" uuid NOT NULL,
	"record_type" "fitness_record_type" NOT NULL,
	"value" numeric(7, 1) NOT NULL,
	"reps" integer,
	"session_id" uuid,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"height_cm" numeric(5, 1),
	"date_of_birth" date,
	"gender" "fitness_gender",
	"activity_level" "fitness_activity_level" DEFAULT 'moderate' NOT NULL,
	"fitness_goal" "fitness_goal" DEFAULT 'general_health' NOT NULL,
	"target_weight_kg" numeric(5, 1),
	"weekly_workout_goal" integer DEFAULT 4 NOT NULL,
	"daily_calorie_goal" integer DEFAULT 2000,
	"daily_protein_goal" integer DEFAULT 150,
	"daily_water_goal_ml" integer DEFAULT 2500,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_program_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_program_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"target_sets" integer,
	"target_reps" text,
	"target_weight_kg" numeric(5, 1),
	"rest_seconds" integer DEFAULT 90,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"goal" "fitness_workout_goal" DEFAULT 'general' NOT NULL,
	"days_per_week" integer NOT NULL,
	"duration_weeks" integer,
	"difficulty" "fitness_difficulty" DEFAULT 'beginner' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fitness_workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"program_day_id" uuid,
	"name" text,
	"date" date NOT NULL,
	"start_time" text,
	"end_time" text,
	"duration_minutes" integer,
	"mood" integer,
	"energy" integer,
	"notes" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fitness_exercise_sets" ADD CONSTRAINT "fitness_exercise_sets_session_id_fitness_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."fitness_workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_exercise_sets" ADD CONSTRAINT "fitness_exercise_sets_exercise_id_fitness_exercise_library_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."fitness_exercise_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_personal_records" ADD CONSTRAINT "fitness_personal_records_exercise_id_fitness_exercise_library_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."fitness_exercise_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_personal_records" ADD CONSTRAINT "fitness_personal_records_session_id_fitness_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."fitness_workout_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_program_days" ADD CONSTRAINT "fitness_program_days_program_id_fitness_workout_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."fitness_workout_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_program_exercises" ADD CONSTRAINT "fitness_program_exercises_program_day_id_fitness_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."fitness_program_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_program_exercises" ADD CONSTRAINT "fitness_program_exercises_exercise_id_fitness_exercise_library_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."fitness_exercise_library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_workout_sessions" ADD CONSTRAINT "fitness_workout_sessions_program_day_id_fitness_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."fitness_program_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fitness_body_measurements_user_date" ON "fitness_body_measurements" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_fitness_body_measurements_date" ON "fitness_body_measurements" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_fitness_exercises_name" ON "fitness_exercise_library" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_fitness_exercises_muscle" ON "fitness_exercise_library" USING btree ("muscle_group");--> statement-breakpoint
CREATE INDEX "idx_fitness_exercise_sets_session" ON "fitness_exercise_sets" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_fitness_prs_user_exercise_type" ON "fitness_personal_records" USING btree ("user_id","exercise_id","record_type");--> statement-breakpoint
CREATE INDEX "idx_fitness_program_days_program" ON "fitness_program_days" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "idx_fitness_program_exercises_day" ON "fitness_program_exercises" USING btree ("program_day_id");--> statement-breakpoint
CREATE INDEX "idx_fitness_programs_user" ON "fitness_workout_programs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_fitness_sessions_user_date" ON "fitness_workout_sessions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_fitness_sessions_program_day" ON "fitness_workout_sessions" USING btree ("program_day_id");