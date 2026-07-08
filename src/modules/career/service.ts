import { z } from "zod";
import dayjs from "dayjs";
import * as repo from "./repository";
import type { JobApplication } from "./repository";

export const achievementCategories = [
  "promotion",
  "award",
  "certification",
  "scholarship",
  "research_paper",
  "open_source",
  "speaking_event",
  "competition",
  "patent",
  "publication",
] as const;

export const interviewQuestionTypes = [
  "hr",
  "technical",
  "dsa",
  "system_design",
  "behavioral",
  "star_story",
  "mock_interview",
  "coding_challenge",
] as const;

export const applicationStatuses = [
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
] as const;

const statusTransitions: Record<string, string[]> = {
  wishlist: ["saved"],
  saved: ["applied"],
  applied: ["assessment"],
  assessment: ["interview", "rejected"],
  interview: ["technical_interview", "final_interview", "rejected"],
  technical_interview: ["final_interview", "rejected"],
  final_interview: ["offer", "rejected"],
  offer: ["negotiation", "accepted", "rejected"],
  negotiation: ["accepted", "rejected"],
  accepted: [],
  rejected: [],
};

const terminalStatuses = new Set(["accepted", "rejected"]);

export const profileSchema = z.object({
  currentPosition: z.string().max(200).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(100).optional().nullable(),
  careerLevel: z.string().max(100).optional().nullable(),
  targetRole: z.string().max(200).optional().nullable(),
  dreamCompany: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

export const createResumeSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.any().default({ type: "doc", content: [] }),
  wordCount: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  atsScore: z.number().int().min(0).max(100).optional().nullable(),
  atsMetadata: z.any().optional().nullable(),
});

export const updateResumeSchema = createResumeSchema.partial();

export const createResumeVersionSchema = z.object({
  resumeId: z.string().uuid(),
  content: z.any(),
  wordCount: z.number().int().min(0).default(0),
  note: z.string().max(500).optional().nullable(),
});

export const createApplicationSchema = z.object({
  company: z.string().min(1).max(300),
  position: z.string().min(1).max(300),
  location: z.string().max(200).optional().nullable(),
  salaryRange: z.string().max(100).optional().nullable(),
  salaryCurrency: z.string().max(10).default("USD"),
  recruiterName: z.string().max(200).optional().nullable(),
  recruiterEmail: z.string().email().optional().nullable().or(z.literal("")),
  recruiterPhone: z.string().max(50).optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  jobDescriptionUrl: z.string().url().optional().nullable().or(z.literal("")),
  applicationDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  documentUrls: z.array(z.string()).default([]),
  status: z.enum(applicationStatuses).default("wishlist"),
  isRemote: z.boolean().optional().nullable(),
  country: z.string().max(100).optional().nullable(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const createInterviewPrepSchema = z.object({
  applicationId: z.string().uuid().optional().nullable(),
  questionType: z.enum(interviewQuestionTypes).default("technical"),
  question: z.string().min(1).max(2000),
  answer: z.string().optional().nullable(),
  isCompleted: z.boolean().default(false),
  revisionCount: z.number().int().min(0).default(0),
  confidenceLevel: z.number().int().min(1).max(5).default(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

export const updateInterviewPrepSchema = createInterviewPrepSchema.partial();

export const createCertificationSchema = z.object({
  name: z.string().min(1).max(300),
  organization: z.string().min(1).max(300),
  credentialId: z.string().max(200).optional().nullable(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional().nullable(),
  verificationUrl: z.string().url().optional().nullable().or(z.literal("")),
  certificateUrl: z.string().url().optional().nullable().or(z.literal("")),
  skillsCovered: z.array(z.string()).default([]),
  status: z.string().default("active"),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export const createProjectSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().optional().nullable(),
  technologies: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  liveDemoUrl: z.string().url().optional().nullable().or(z.literal("")),
  screenshotUrls: z.array(z.string()).default([]),
  role: z.string().max(200).optional().nullable(),
  teamSize: z.number().int().min(1).max(1000).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  achievements: z.array(z.string()).default([]),
  lessonsLearned: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createAchievementSchema = z.object({
  category: z.enum(achievementCategories),
  title: z.string().min(1).max(300),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  imageUrls: z.array(z.string()).default([]),
  documentUrls: z.array(z.string()).default([]),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const updateAchievementSchema = createAchievementSchema.partial();

export const createSalaryRecordSchema = z.object({
  baseSalary: z.number().int().min(0),
  bonus: z.number().int().default(0),
  stocks: z.number().int().default(0),
  incentives: z.number().int().default(0),
  currency: z.string().max(10).default("USD"),
  effectiveDate: z.string().datetime(),
  role: z.string().max(200).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateSalaryRecordSchema = createSalaryRecordSchema.partial();

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateInterviewPrepInput = z.infer<typeof createInterviewPrepSchema>;
export type UpdateInterviewPrepInput = z.infer<typeof updateInterviewPrepSchema>;
export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof createAchievementSchema>;
export type CreateSalaryRecordInput = z.infer<typeof createSalaryRecordSchema>;
export type UpdateSalaryRecordInput = z.infer<typeof updateSalaryRecordSchema>;

function isValidStatusTransition(current: string, next: string): boolean {
  const allowed = statusTransitions[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

export async function getProfile(userId: string) {
  return repo.getProfile(userId);
}

export async function upsertProfile(userId: string, input: z.infer<typeof profileSchema>) {
  const data = profileSchema.parse(input);
  return repo.upsertProfile(userId, data);
}

export async function getResumes(userId: string) {
  return repo.getResumes(userId);
}

export async function getResumeById(userId: string, resumeId: string) {
  return repo.getResumeById(userId, resumeId);
}

export async function createResume(userId: string, input: CreateResumeInput) {
  const data = createResumeSchema.parse(input);
  return repo.createResume({ ...data, userId });
}

export async function updateResume(userId: string, resumeId: string, input: UpdateResumeInput) {
  const data = updateResumeSchema.parse(input);
  return repo.updateResume(userId, resumeId, data);
}

export async function deleteResume(userId: string, resumeId: string) {
  return repo.deleteResume(userId, resumeId);
}

export async function saveResumeVersion(userId: string, resumeId: string, note?: string) {
  const resume = await repo.getResumeById(userId, resumeId);
  if (!resume) throw new Error("Resume not found");
  return repo.createResumeVersion({
    resumeId,
    content: resume.content,
    wordCount: resume.wordCount,
    note: note ?? null,
  });
}

export async function getResumeVersions(resumeId: string) {
  return repo.getResumeVersions(resumeId);
}

export async function getApplications(userId: string, status?: string) {
  return repo.getApplications(userId, status);
}

export async function getApplicationById(userId: string, applicationId: string) {
  return repo.getApplicationById(userId, applicationId);
}

export async function createApplication(userId: string, input: CreateApplicationInput) {
  const data = createApplicationSchema.parse(input);
  return repo.createApplication({
    ...data,
    userId,
    applicationDate: data.applicationDate ? new Date(data.applicationDate) : null,
    recruiterEmail: data.recruiterEmail || null,
    jobDescriptionUrl: data.jobDescriptionUrl || null,
  });
}

export async function updateApplication(userId: string, applicationId: string, input: UpdateApplicationInput) {
  const data = updateApplicationSchema.parse(input);
  const existing = await repo.getApplicationById(userId, applicationId);
  if (!existing) throw new Error("Application not found");
  if (data.status && data.status !== existing.status) {
    if (terminalStatuses.has(existing.status)) {
      throw new Error(`Cannot transition from terminal status "${existing.status}"`);
    }
    if (!isValidStatusTransition(existing.status, data.status)) {
      throw new Error(
        `Invalid status transition from "${existing.status}" to "${data.status}"`,
      );
    }
  }
  const updateData: Record<string, unknown> = { ...data };
  if (data.applicationDate !== undefined) {
    updateData.applicationDate = data.applicationDate ? new Date(data.applicationDate) : null;
  }
  return repo.updateApplication(userId, applicationId, updateData);
}

export async function deleteApplication(userId: string, applicationId: string) {
  return repo.deleteApplication(userId, applicationId);
}

export async function getApplicationStatusDistribution(userId: string) {
  const all = await repo.getApplications(userId);
  const distribution: Record<string, number> = {};
  for (const app of all) {
    distribution[app.status] = (distribution[app.status] || 0) + 1;
  }
  return distribution;
}

export async function getInterviewPrepItems(userId: string, applicationId?: string) {
  return repo.getInterviewPrepItems(userId, applicationId);
}

export async function getInterviewPrepById(userId: string, itemId: string) {
  return repo.getInterviewPrepById(userId, itemId);
}

export async function createInterviewPrep(userId: string, input: CreateInterviewPrepInput) {
  const data = createInterviewPrepSchema.parse(input);
  return repo.createInterviewPrep({ ...data, userId });
}

export async function updateInterviewPrep(userId: string, itemId: string, input: UpdateInterviewPrepInput) {
  const data = updateInterviewPrepSchema.parse(input);
  return repo.updateInterviewPrep(userId, itemId, data);
}

export async function deleteInterviewPrep(userId: string, itemId: string) {
  return repo.deleteInterviewPrep(userId, itemId);
}

export async function getCertifications(userId: string) {
  return repo.getCertifications(userId);
}

export async function getCertificationById(userId: string, certId: string) {
  return repo.getCertificationById(userId, certId);
}

export async function createCertification(userId: string, input: CreateCertificationInput) {
  const data = createCertificationSchema.parse(input);
  return repo.createCertification({
    ...data,
    userId,
    issueDate: new Date(data.issueDate),
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    verificationUrl: data.verificationUrl || null,
    certificateUrl: data.certificateUrl || null,
  });
}

export async function updateCertification(userId: string, certId: string, input: UpdateCertificationInput) {
  const data = updateCertificationSchema.parse(input);
  const updateData: Record<string, unknown> = { ...data };
  if (data.issueDate !== undefined) {
    updateData.issueDate = data.issueDate ? new Date(data.issueDate) : null;
  }
  if (data.expiryDate !== undefined) {
    updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }
  return repo.updateCertification(userId, certId, updateData);
}

export async function deleteCertification(userId: string, certId: string) {
  return repo.deleteCertification(userId, certId);
}

export async function getExpiringCertifications(userId: string, withinDays = 30) {
  const all = await repo.getCertifications(userId);
  const now = dayjs();
  return all.filter((cert) => {
    if (!cert.expiryDate || cert.status !== "active") return false;
    const diff = dayjs(cert.expiryDate).diff(now, "day");
    return diff >= 0 && diff <= withinDays;
  });
}

export async function getProjects(userId: string) {
  return repo.getProjects(userId);
}

export async function getProjectById(userId: string, projectId: string) {
  return repo.getProjectById(userId, projectId);
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const data = createProjectSchema.parse(input);
  return repo.createProject({
    ...data,
    userId,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  });
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
  const data = updateProjectSchema.parse(input);
  const updateData: Record<string, unknown> = { ...data };
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  }
  return repo.updateProject(userId, projectId, updateData);
}

export async function deleteProject(userId: string, projectId: string) {
  return repo.deleteProject(userId, projectId);
}

export async function getAchievements(userId: string) {
  return repo.getAchievements(userId);
}

export async function getAchievementById(userId: string, achievementId: string) {
  return repo.getAchievementById(userId, achievementId);
}

export async function createAchievement(userId: string, input: CreateAchievementInput) {
  const data = createAchievementSchema.parse(input);
  return repo.createAchievement({
    ...data,
    userId,
    date: data.date ? new Date(data.date) : null,
  });
}

export async function updateAchievement(userId: string, achievementId: string, input: UpdateAchievementInput) {
  const data = updateAchievementSchema.parse(input);
  const updateData: Record<string, unknown> = { ...data };
  if (data.date !== undefined) {
    updateData.date = data.date ? new Date(data.date) : null;
  }
  return repo.updateAchievement(userId, achievementId, updateData);
}

export async function deleteAchievement(userId: string, achievementId: string) {
  return repo.deleteAchievement(userId, achievementId);
}

export async function getSalaryRecords(userId: string) {
  return repo.getSalaryRecords(userId);
}

export async function getSalaryRecordById(userId: string, recordId: string) {
  return repo.getSalaryRecordById(userId, recordId);
}

export async function createSalaryRecord(userId: string, input: CreateSalaryRecordInput) {
  const data = createSalaryRecordSchema.parse(input);
  return repo.createSalaryRecord({
    ...data,
    userId,
    effectiveDate: new Date(data.effectiveDate),
  });
}

export async function updateSalaryRecord(userId: string, recordId: string, input: UpdateSalaryRecordInput) {
  const data = updateSalaryRecordSchema.parse(input);
  const updateData: Record<string, unknown> = { ...data };
  if (data.effectiveDate !== undefined) {
    updateData.effectiveDate = data.effectiveDate ? new Date(data.effectiveDate) : null;
  }
  return repo.updateSalaryRecord(userId, recordId, updateData);
}

export async function deleteSalaryRecord(userId: string, recordId: string) {
  return repo.deleteSalaryRecord(userId, recordId);
}

export async function getDashboardStats(userId: string) {
  const [profile, applications, certs, achievements, salaryRecords, projects, interviewItems] =
    await Promise.all([
      repo.getProfile(userId),
      repo.getApplications(userId),
      repo.getCertifications(userId),
      repo.getAchievements(userId),
      repo.getSalaryRecords(userId),
      repo.getProjects(userId),
      repo.getInterviewPrepItems(userId),
    ]);

  const activeApplications = applications.filter((a) => !terminalStatuses.has(a.status));
  const upcomingInterviews = applications.filter(
    (a) => a.status === "interview" || a.status === "technical_interview" || a.status === "final_interview",
  );
  const activeCerts = certs.filter((c) => c.status === "active");
  const totalCompensation = salaryRecords.length > 0
    ? salaryRecords[0].baseSalary + salaryRecords[0].bonus + salaryRecords[0].stocks + salaryRecords[0].incentives
    : 0;
  const completedPrep = interviewItems.filter((i) => i.isCompleted);
  const completedAchievements = achievements.length;

  const interviewSuccessRate = (() => {
    const offers = applications.filter((a) => a.status === "accepted" || a.status === "offer" || a.status === "negotiation");
    const rejected = applications.filter((a) => a.status === "rejected");
    const totalDecided = offers.length + rejected.length;
    return totalDecided > 0 ? Math.round((offers.length / totalDecided) * 100) : 0;
  })();

  const applicationSuccessRate = (() => {
    const accepted = applications.filter((a) => a.status === "accepted");
    const total = applications.length;
    return total > 0 ? Math.round((accepted.length / total) * 100) : 0;
  })();

  const skillScore = (() => {
    if (interviewItems.length === 0) return 0;
    const avgConfidence = interviewItems.reduce((s, i) => s + i.confidenceLevel, 0) / interviewItems.length;
    return Math.round((avgConfidence / 5) * 100);
  })();

  return {
    profile,
    currentPosition: profile?.currentPosition ?? null,
    company: profile?.company ?? null,
    yearsOfExperience: profile?.yearsOfExperience ?? null,
    careerLevel: profile?.careerLevel ?? null,
    targetRole: profile?.targetRole ?? null,
    dreamCompany: profile?.dreamCompany ?? null,
    totalApplications: applications.length,
    activeApplications: activeApplications.length,
    upcomingInterviews: upcomingInterviews.length,
    interviewSuccessRate,
    applicationSuccessRate,
    activeCertifications: activeCerts.length,
    expiringCertifications: await getExpiringCertifications(userId),
    skillScore,
    totalCompensation,
    completedAchievements,
    completedPrepItems: completedPrep.length,
    totalPrepItems: interviewItems.length,
    totalProjects: projects.length,
    totalSalaryRecords: salaryRecords.length,
  };
}
