CREATE TYPE "public"."application_status" AS ENUM('wishlist', 'saved', 'applied', 'assessment', 'interview', 'technical_interview', 'final_interview', 'offer', 'negotiation', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "career_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp with time zone,
	"organization" text,
	"image_urls" text[] DEFAULT '{}' NOT NULL,
	"document_urls" text[] DEFAULT '{}' NOT NULL,
	"link_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "career_certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"credential_id" text,
	"issue_date" timestamp with time zone NOT NULL,
	"expiry_date" timestamp with time zone,
	"verification_url" text,
	"certificate_url" text,
	"skills_covered" text[] DEFAULT '{}' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_interview_prep" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"application_id" uuid,
	"question_type" text DEFAULT 'technical' NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"confidence_level" integer DEFAULT 1 NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"current_position" text,
	"company" text,
	"years_of_experience" integer,
	"career_level" text,
	"target_role" text,
	"dream_company" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "career_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "career_resume_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"content" jsonb DEFAULT '{"type":"doc","content":[]}'::jsonb NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"ats_score" integer,
	"ats_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "career_salary_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"base_salary" integer NOT NULL,
	"bonus" integer DEFAULT 0 NOT NULL,
	"stocks" integer DEFAULT 0 NOT NULL,
	"incentives" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"role" text,
	"company" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"location" text,
	"salary_range" text,
	"salary_currency" text DEFAULT 'USD',
	"recruiter_name" text,
	"recruiter_email" text,
	"recruiter_phone" text,
	"job_description" text,
	"job_description_url" text,
	"application_date" timestamp with time zone,
	"notes" text,
	"document_urls" text[] DEFAULT '{}' NOT NULL,
	"status" "application_status" DEFAULT 'wishlist' NOT NULL,
	"is_remote" boolean,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"technologies" text[] DEFAULT '{}' NOT NULL,
	"github_url" text,
	"live_demo_url" text,
	"screenshot_urls" text[] DEFAULT '{}' NOT NULL,
	"role" text,
	"team_size" integer,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"achievements" text[] DEFAULT '{}' NOT NULL,
	"lessons_learned" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "knowledge_entries" ADD COLUMN "target_level" integer;--> statement-breakpoint
ALTER TABLE "knowledge_entries" ADD COLUMN "projects" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "career_interview_prep" ADD CONSTRAINT "career_interview_prep_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_resume_versions" ADD CONSTRAINT "career_resume_versions_resume_id_career_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."career_resumes"("id") ON DELETE cascade ON UPDATE no action;