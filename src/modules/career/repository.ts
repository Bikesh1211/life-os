import { db } from "@/core/database";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import {
  careerProfile,
  careerResumes,
  careerResumeVersions,
  jobApplications,
  careerInterviewPrep,
  careerCertifications,
  portfolioProjects,
  careerAchievements,
  careerSalaryRecords,
} from "./schema";

export type CareerProfile = typeof careerProfile.$inferSelect;
export type CareerResume = typeof careerResumes.$inferSelect;
export type CareerResumeVersion = typeof careerResumeVersions.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type CareerInterviewPrep = typeof careerInterviewPrep.$inferSelect;
export type CareerCertification = typeof careerCertifications.$inferSelect;
export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type CareerAchievement = typeof careerAchievements.$inferSelect;
export type CareerSalaryRecord = typeof careerSalaryRecords.$inferSelect;

export type CreateCareerProfileInput = typeof careerProfile.$inferInsert;
export type CreateCareerResumeInput = typeof careerResumes.$inferInsert;
export type CreateCareerResumeVersionInput = typeof careerResumeVersions.$inferInsert;
export type CreateJobApplicationInput = typeof jobApplications.$inferInsert;
export type CreateCareerInterviewPrepInput = typeof careerInterviewPrep.$inferInsert;
export type CreateCareerCertificationInput = typeof careerCertifications.$inferInsert;
export type CreatePortfolioProjectInput = typeof portfolioProjects.$inferInsert;
export type CreateCareerAchievementInput = typeof careerAchievements.$inferInsert;
export type CreateCareerSalaryRecordInput = typeof careerSalaryRecords.$inferInsert;

export async function getProfile(userId: string) {
  const result = await db
    .select()
    .from(careerProfile)
    .where(eq(careerProfile.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertProfile(userId: string, input: Partial<CreateCareerProfileInput>) {
  const existing = await getProfile(userId);
  if (existing) {
    const result = await db
      .update(careerProfile)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(careerProfile.userId, userId))
      .returning();
    return result[0];
  }
  const result = await db
    .insert(careerProfile)
    .values({ ...input, userId } as CreateCareerProfileInput)
    .returning();
  return result[0];
}

export async function getResumes(userId: string) {
  return db
    .select()
    .from(careerResumes)
    .where(and(eq(careerResumes.userId, userId), isNull(careerResumes.deletedAt)))
    .orderBy(desc(careerResumes.updatedAt));
}

export async function getResumeById(userId: string, resumeId: string) {
  const result = await db
    .select()
    .from(careerResumes)
    .where(and(eq(careerResumes.id, resumeId), eq(careerResumes.userId, userId), isNull(careerResumes.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createResume(input: CreateCareerResumeInput) {
  const result = await db.insert(careerResumes).values(input).returning();
  return result[0];
}

export async function updateResume(userId: string, resumeId: string, input: Partial<CreateCareerResumeInput>) {
  const result = await db
    .update(careerResumes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(careerResumes.id, resumeId), eq(careerResumes.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteResume(userId: string, resumeId: string) {
  const result = await db
    .update(careerResumes)
    .set({ deletedAt: new Date() })
    .where(and(eq(careerResumes.id, resumeId), eq(careerResumes.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getResumeVersions(resumeId: string) {
  return db
    .select()
    .from(careerResumeVersions)
    .where(eq(careerResumeVersions.resumeId, resumeId))
    .orderBy(desc(careerResumeVersions.createdAt));
}

export async function createResumeVersion(input: CreateCareerResumeVersionInput) {
  const result = await db.insert(careerResumeVersions).values(input).returning();
  return result[0];
}

export async function getApplications(userId: string, status?: string) {
  const conditions = [eq(jobApplications.userId, userId), isNull(jobApplications.deletedAt)];
  if (status) conditions.push(eq(jobApplications.status, status as any));
  return db
    .select()
    .from(jobApplications)
    .where(and(...conditions))
    .orderBy(desc(jobApplications.updatedAt));
}

export async function getApplicationById(userId: string, applicationId: string) {
  const result = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId), isNull(jobApplications.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createApplication(input: CreateJobApplicationInput) {
  const result = await db.insert(jobApplications).values(input).returning();
  return result[0];
}

export async function updateApplication(userId: string, applicationId: string, input: Partial<CreateJobApplicationInput>) {
  const result = await db
    .update(jobApplications)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteApplication(userId: string, applicationId: string) {
  const result = await db
    .update(jobApplications)
    .set({ deletedAt: new Date() })
    .where(and(eq(jobApplications.id, applicationId), eq(jobApplications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getInterviewPrepItems(userId: string, applicationId?: string) {
  const conditions = [eq(careerInterviewPrep.userId, userId)];
  if (applicationId) conditions.push(eq(careerInterviewPrep.applicationId, applicationId));
  return db
    .select()
    .from(careerInterviewPrep)
    .where(and(...conditions))
    .orderBy(desc(careerInterviewPrep.updatedAt));
}

export async function getInterviewPrepById(userId: string, itemId: string) {
  const result = await db
    .select()
    .from(careerInterviewPrep)
    .where(and(eq(careerInterviewPrep.id, itemId), eq(careerInterviewPrep.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createInterviewPrep(input: CreateCareerInterviewPrepInput) {
  const result = await db.insert(careerInterviewPrep).values(input).returning();
  return result[0];
}

export async function updateInterviewPrep(userId: string, itemId: string, input: Partial<CreateCareerInterviewPrepInput>) {
  const result = await db
    .update(careerInterviewPrep)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(careerInterviewPrep.id, itemId), eq(careerInterviewPrep.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteInterviewPrep(userId: string, itemId: string) {
  const result = await db
    .delete(careerInterviewPrep)
    .where(and(eq(careerInterviewPrep.id, itemId), eq(careerInterviewPrep.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getCertifications(userId: string) {
  return db
    .select()
    .from(careerCertifications)
    .where(eq(careerCertifications.userId, userId))
    .orderBy(desc(careerCertifications.issueDate));
}

export async function getCertificationById(userId: string, certId: string) {
  const result = await db
    .select()
    .from(careerCertifications)
    .where(and(eq(careerCertifications.id, certId), eq(careerCertifications.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createCertification(input: CreateCareerCertificationInput) {
  const result = await db.insert(careerCertifications).values(input).returning();
  return result[0];
}

export async function updateCertification(userId: string, certId: string, input: Partial<CreateCareerCertificationInput>) {
  const result = await db
    .update(careerCertifications)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(careerCertifications.id, certId), eq(careerCertifications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteCertification(userId: string, certId: string) {
  const result = await db
    .delete(careerCertifications)
    .where(and(eq(careerCertifications.id, certId), eq(careerCertifications.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getProjects(userId: string) {
  return db
    .select()
    .from(portfolioProjects)
    .where(and(eq(portfolioProjects.userId, userId), isNull(portfolioProjects.deletedAt)))
    .orderBy(desc(portfolioProjects.updatedAt));
}

export async function getProjectById(userId: string, projectId: string) {
  const result = await db
    .select()
    .from(portfolioProjects)
    .where(and(eq(portfolioProjects.id, projectId), eq(portfolioProjects.userId, userId), isNull(portfolioProjects.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createProject(input: CreatePortfolioProjectInput) {
  const result = await db.insert(portfolioProjects).values(input).returning();
  return result[0];
}

export async function updateProject(userId: string, projectId: string, input: Partial<CreatePortfolioProjectInput>) {
  const result = await db
    .update(portfolioProjects)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(portfolioProjects.id, projectId), eq(portfolioProjects.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteProject(userId: string, projectId: string) {
  const result = await db
    .update(portfolioProjects)
    .set({ deletedAt: new Date() })
    .where(and(eq(portfolioProjects.id, projectId), eq(portfolioProjects.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getAchievements(userId: string) {
  return db
    .select()
    .from(careerAchievements)
    .where(and(eq(careerAchievements.userId, userId), isNull(careerAchievements.deletedAt)))
    .orderBy(desc(careerAchievements.date));
}

export async function getAchievementById(userId: string, achievementId: string) {
  const result = await db
    .select()
    .from(careerAchievements)
    .where(and(eq(careerAchievements.id, achievementId), eq(careerAchievements.userId, userId), isNull(careerAchievements.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createAchievement(input: CreateCareerAchievementInput) {
  const result = await db.insert(careerAchievements).values(input).returning();
  return result[0];
}

export async function updateAchievement(userId: string, achievementId: string, input: Partial<CreateCareerAchievementInput>) {
  const result = await db
    .update(careerAchievements)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(careerAchievements.id, achievementId), eq(careerAchievements.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteAchievement(userId: string, achievementId: string) {
  const result = await db
    .update(careerAchievements)
    .set({ deletedAt: new Date() })
    .where(and(eq(careerAchievements.id, achievementId), eq(careerAchievements.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function getSalaryRecords(userId: string) {
  return db
    .select()
    .from(careerSalaryRecords)
    .where(and(eq(careerSalaryRecords.userId, userId), isNull(careerSalaryRecords.deletedAt)))
    .orderBy(desc(careerSalaryRecords.effectiveDate));
}

export async function getSalaryRecordById(userId: string, recordId: string) {
  const result = await db
    .select()
    .from(careerSalaryRecords)
    .where(and(eq(careerSalaryRecords.id, recordId), eq(careerSalaryRecords.userId, userId), isNull(careerSalaryRecords.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function createSalaryRecord(input: CreateCareerSalaryRecordInput) {
  const result = await db.insert(careerSalaryRecords).values(input).returning();
  return result[0];
}

export async function updateSalaryRecord(userId: string, recordId: string, input: Partial<CreateCareerSalaryRecordInput>) {
  const result = await db
    .update(careerSalaryRecords)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(careerSalaryRecords.id, recordId), eq(careerSalaryRecords.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteSalaryRecord(userId: string, recordId: string) {
  const result = await db
    .update(careerSalaryRecords)
    .set({ deletedAt: new Date() })
    .where(and(eq(careerSalaryRecords.id, recordId), eq(careerSalaryRecords.userId, userId)))
    .returning();
  return result[0] ?? null;
}
