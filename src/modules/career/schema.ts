import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "wishlist",
  "saved",
  "applied",
  "assessment",
  "interview",
  "technical_interview",
  "final_interview",
  "offer",
  "negotiation",
  "accepted",
  "rejected",
]);

export const careerProfile = pgTable("career_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentPosition: text("current_position"),
  company: text("company"),
  yearsOfExperience: integer("years_of_experience"),
  careerLevel: text("career_level"),
  targetRole: text("target_role"),
  dreamCompany: text("dream_company"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const careerResumes = pgTable("career_resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  content: jsonb("content").notNull().default({ type: "doc", content: [] }),
  wordCount: integer("word_count").default(0).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  atsScore: integer("ats_score"),
  atsMetadata: jsonb("ats_metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const careerResumeVersions = pgTable("career_resume_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => careerResumes.id, { onDelete: "cascade" }),
  content: jsonb("content").notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  location: text("location"),
  salaryRange: text("salary_range"),
  salaryCurrency: text("salary_currency").default("USD"),
  recruiterName: text("recruiter_name"),
  recruiterEmail: text("recruiter_email"),
  recruiterPhone: text("recruiter_phone"),
  jobDescription: text("job_description"),
  jobDescriptionUrl: text("job_description_url"),
  applicationDate: timestamp("application_date", { withTimezone: true }),
  notes: text("notes"),
  documentUrls: text("document_urls").array().default([]).notNull(),
  status: applicationStatusEnum("status").default("wishlist").notNull(),
  isRemote: boolean("is_remote"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const careerInterviewPrep = pgTable("career_interview_prep", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  applicationId: uuid("application_id").references(() => jobApplications.id, { onDelete: "set null" }),
  questionType: text("question_type").notNull().default("technical"),
  question: text("question").notNull(),
  answer: text("answer"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  revisionCount: integer("revision_count").default(0).notNull(),
  confidenceLevel: integer("confidence_level").default(1).notNull(),
  tags: text("tags").array().default([]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const careerCertifications = pgTable("career_certifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  credentialId: text("credential_id"),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  verificationUrl: text("verification_url"),
  certificateUrl: text("certificate_url"),
  skillsCovered: text("skills_covered").array().default([]).notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const portfolioProjects = pgTable("portfolio_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  technologies: text("technologies").array().default([]).notNull(),
  githubUrl: text("github_url"),
  liveDemoUrl: text("live_demo_url"),
  screenshotUrls: text("screenshot_urls").array().default([]).notNull(),
  role: text("role"),
  teamSize: integer("team_size"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  achievements: text("achievements").array().default([]).notNull(),
  lessonsLearned: text("lessons_learned"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const careerAchievements = pgTable("career_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }),
  organization: text("organization"),
  imageUrls: text("image_urls").array().default([]).notNull(),
  documentUrls: text("document_urls").array().default([]).notNull(),
  linkUrl: text("link_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const careerSalaryRecords = pgTable("career_salary_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  baseSalary: integer("base_salary").notNull(),
  bonus: integer("bonus").default(0).notNull(),
  stocks: integer("stocks").default(0).notNull(),
  incentives: integer("incentives").default(0).notNull(),
  currency: text("currency").default("USD").notNull(),
  effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
  role: text("role"),
  company: text("company"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
