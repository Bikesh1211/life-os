import { connectToDatabase } from "@/lib/mongodb";
import {
  CareerProfileModel,
  CareerResumeModel,
  CareerResumeVersionModel,
  JobApplicationModel,
  CareerInterviewPrepModel,
} from "@/lib/models/career";
import { CareerCertificationModel } from "@/lib/models/career-certifications";
import { PortfolioProjectModel } from "@/lib/models/career-portfolio";
import { CareerAchievementModel } from "@/lib/models/career-achievements";
import { SalaryRecordModel } from "@/lib/models/career-salary";
import type { Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────

export type CareerProfile = {
  id: string;
  userId: string;
  currentPosition?: string;
  company?: string;
  yearsOfExperience?: number;
  careerLevel?: string;
  targetRole?: string;
  dreamCompany?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerResume = {
  id: string;
  userId: string;
  title: string;
  content: Record<string, any>;
  isDefault: boolean;
  atsScore?: number;
  lastExportedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerResumeVersion = {
  id: string;
  resumeId: string;
  content: Record<string, any>;
  wordCount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JobApplication = {
  id: string;
  userId: string;
  company: string;
  position: string;
  location?: string;
  salaryRange?: string;
  recruiterInfo?: string;
  jobDescriptionUrl?: string;
  applicationDate?: Date;
  interviewDates: Date[];
  notes?: string;
  documents: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerInterviewPrep = {
  id: string;
  userId: string;
  type: string;
  question: string;
  answer?: string;
  category?: string;
  difficulty?: string;
  completionStatus: string;
  revisionCount: number;
  confidenceLevel?: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CareerCertification = {
  id: string;
  userId: string;
  name: string;
  issuingOrganization?: string;
  credentialId?: string;
  issueDate?: Date;
  expiryDate?: Date;
  verificationUrl?: string;
  certificateUrl?: string;
  skillsCovered: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PortfolioProject = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  technologies: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  screenshots: string[];
  role?: string;
  teamSize?: number;
  timeline?: string;
  achievements?: string;
  lessonsLearned?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CareerAchievement = {
  id: string;
  userId: string;
  category: string;
  title: string;
  description?: string;
  date?: Date;
  organization?: string;
  images: string[];
  links: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CareerSalaryRecord = {
  id: string;
  userId: string;
  baseSalary: number;
  bonus?: number;
  stocks?: number;
  incentives?: number;
  currency: string;
  effectiveDate: Date;
  promotionContext?: string;
  roleContext?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCareerProfileInput = Partial<Omit<CareerProfile, "id" | "createdAt" | "updatedAt">> & { userId: string };
export type CreateCareerResumeInput = Partial<Omit<CareerResume, "id" | "createdAt" | "updatedAt">> & { userId: string; title: string };
export type CreateCareerResumeVersionInput = { resumeId: string; content: Record<string, any>; wordCount: number; note?: string };
export type CreateJobApplicationInput = Partial<Omit<JobApplication, "id" | "createdAt" | "updatedAt">> & { userId: string; company: string; position: string };
export type CreateCareerInterviewPrepInput = Partial<Omit<CareerInterviewPrep, "id" | "createdAt" | "updatedAt">> & { userId: string; type: string; question: string };
export type CreateCareerCertificationInput = Partial<Omit<CareerCertification, "id" | "createdAt" | "updatedAt">> & { userId: string; name: string };
export type CreatePortfolioProjectInput = Partial<Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">> & { userId: string; name: string };
export type CreateCareerAchievementInput = Partial<Omit<CareerAchievement, "id" | "createdAt" | "updatedAt">> & { userId: string; category: string; title: string };
export type CreateCareerSalaryRecordInput = Partial<Omit<CareerSalaryRecord, "id" | "createdAt" | "updatedAt">> & { userId: string; baseSalary: number; effectiveDate: Date };

// ─── Helpers ──────────────────────────────────────────────────────

function mapProfile(doc: any): CareerProfile {
  return { ...doc, id: doc._id.toString() };
}

function mapResume(doc: any): CareerResume {
  return { ...doc, id: doc._id.toString() };
}

function mapResumeVersion(doc: any): CareerResumeVersion {
  return { ...doc, id: doc._id.toString() };
}

function mapApplication(doc: any): JobApplication {
  return { ...doc, id: doc._id.toString() };
}

function mapInterviewPrep(doc: any): CareerInterviewPrep {
  return { ...doc, id: doc._id.toString() };
}

function mapCertification(doc: any): CareerCertification {
  return { ...doc, id: doc._id.toString() };
}

function mapProject(doc: any): PortfolioProject {
  return { ...doc, id: doc._id.toString() };
}

function mapAchievement(doc: any): CareerAchievement {
  return { ...doc, id: doc._id.toString() };
}

function mapSalaryRecord(doc: any): CareerSalaryRecord {
  return { ...doc, id: doc._id.toString() };
}

// ─── Profile ──────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<CareerProfile | null> {
  await connectToDatabase();
  const doc = await CareerProfileModel.findOne({ userId }).lean();
  return doc ? mapProfile(doc) : null;
}

export async function upsertProfile(userId: string, input: Partial<CreateCareerProfileInput>): Promise<CareerProfile> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await CareerProfileModel.findOneAndUpdate(
    { userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true, upsert: true },
  ).lean();
  return mapProfile(doc);
}

// ─── Resumes ──────────────────────────────────────────────────────

export async function getResumes(userId: string): Promise<CareerResume[]> {
  await connectToDatabase();
  const docs = await CareerResumeModel.find({ userId, deletedAt: null })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(mapResume);
}

export async function getResumeById(userId: string, resumeId: string): Promise<CareerResume | null> {
  await connectToDatabase();
  const doc = await CareerResumeModel.findOne({ _id: resumeId, userId, deletedAt: null }).lean();
  return doc ? mapResume(doc) : null;
}

export async function createResume(input: CreateCareerResumeInput): Promise<CareerResume> {
  await connectToDatabase();
  const doc = await CareerResumeModel.create(input);
  return mapResume(doc.toObject());
}

export async function updateResume(userId: string, resumeId: string, input: Partial<CreateCareerResumeInput>): Promise<CareerResume | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await CareerResumeModel.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapResume(doc) : null;
}

export async function deleteResume(userId: string, resumeId: string): Promise<CareerResume | null> {
  await connectToDatabase();
  const doc = await CareerResumeModel.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapResume(doc) : null;
}

// ─── Resume Versions ──────────────────────────────────────────────

export async function getResumeVersions(resumeId: string): Promise<CareerResumeVersion[]> {
  await connectToDatabase();
  const docs = await CareerResumeVersionModel.find({ resumeId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapResumeVersion);
}

export async function createResumeVersion(input: CreateCareerResumeVersionInput): Promise<CareerResumeVersion> {
  await connectToDatabase();
  const doc = await CareerResumeVersionModel.create(input);
  return mapResumeVersion(doc.toObject());
}

// ─── Applications ─────────────────────────────────────────────────

export async function getApplications(userId: string, status?: string): Promise<JobApplication[]> {
  await connectToDatabase();
  const filter: Record<string, any> = { userId, deletedAt: null };
  if (status) filter.status = status;
  const docs = await JobApplicationModel.find(filter)
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(mapApplication);
}

export async function getApplicationById(userId: string, applicationId: string): Promise<JobApplication | null> {
  await connectToDatabase();
  const doc = await JobApplicationModel.findOne({ _id: applicationId, userId, deletedAt: null }).lean();
  return doc ? mapApplication(doc) : null;
}

export async function createApplication(input: CreateJobApplicationInput): Promise<JobApplication> {
  await connectToDatabase();
  const doc = await JobApplicationModel.create(input);
  return mapApplication(doc.toObject());
}

export async function updateApplication(userId: string, applicationId: string, input: Partial<CreateJobApplicationInput>): Promise<JobApplication | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await JobApplicationModel.findOneAndUpdate(
    { _id: applicationId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapApplication(doc) : null;
}

export async function deleteApplication(userId: string, applicationId: string): Promise<JobApplication | null> {
  await connectToDatabase();
  const doc = await JobApplicationModel.findOneAndUpdate(
    { _id: applicationId, userId },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapApplication(doc) : null;
}

// ─── Interview Prep ───────────────────────────────────────────────

export async function getInterviewPrepItems(userId: string, applicationId?: string): Promise<CareerInterviewPrep[]> {
  await connectToDatabase();
  const filter: Record<string, any> = { userId };
  if (applicationId) filter.applicationId = applicationId;
  const docs = await CareerInterviewPrepModel.find(filter)
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(mapInterviewPrep);
}

export async function getInterviewPrepById(userId: string, itemId: string): Promise<CareerInterviewPrep | null> {
  await connectToDatabase();
  const doc = await CareerInterviewPrepModel.findOne({ _id: itemId, userId }).lean();
  return doc ? mapInterviewPrep(doc) : null;
}

export async function createInterviewPrep(input: CreateCareerInterviewPrepInput): Promise<CareerInterviewPrep> {
  await connectToDatabase();
  const doc = await CareerInterviewPrepModel.create(input);
  return mapInterviewPrep(doc.toObject());
}

export async function updateInterviewPrep(userId: string, itemId: string, input: Partial<CreateCareerInterviewPrepInput>): Promise<CareerInterviewPrep | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await CareerInterviewPrepModel.findOneAndUpdate(
    { _id: itemId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapInterviewPrep(doc) : null;
}

export async function deleteInterviewPrep(userId: string, itemId: string): Promise<CareerInterviewPrep | null> {
  await connectToDatabase();
  const doc = await CareerInterviewPrepModel.findOneAndDelete({ _id: itemId, userId }).lean();
  return doc ? mapInterviewPrep(doc) : null;
}

// ─── Certifications ───────────────────────────────────────────────

export async function getCertifications(userId: string): Promise<CareerCertification[]> {
  await connectToDatabase();
  const docs = await CareerCertificationModel.find({ userId })
    .sort({ issueDate: -1 })
    .lean();
  return docs.map(mapCertification);
}

export async function getCertificationById(userId: string, certId: string): Promise<CareerCertification | null> {
  await connectToDatabase();
  const doc = await CareerCertificationModel.findOne({ _id: certId, userId }).lean();
  return doc ? mapCertification(doc) : null;
}

export async function createCertification(input: CreateCareerCertificationInput): Promise<CareerCertification> {
  await connectToDatabase();
  const doc = await CareerCertificationModel.create(input);
  return mapCertification(doc.toObject());
}

export async function updateCertification(userId: string, certId: string, input: Partial<CreateCareerCertificationInput>): Promise<CareerCertification | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await CareerCertificationModel.findOneAndUpdate(
    { _id: certId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapCertification(doc) : null;
}

export async function deleteCertification(userId: string, certId: string): Promise<CareerCertification | null> {
  await connectToDatabase();
  const doc = await CareerCertificationModel.findOneAndDelete({ _id: certId, userId }).lean();
  return doc ? mapCertification(doc) : null;
}

// ─── Portfolio Projects ───────────────────────────────────────────

export async function getProjects(userId: string): Promise<PortfolioProject[]> {
  await connectToDatabase();
  const docs = await PortfolioProjectModel.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(mapProject);
}

export async function getProjectById(userId: string, projectId: string): Promise<PortfolioProject | null> {
  await connectToDatabase();
  const doc = await PortfolioProjectModel.findOne({ _id: projectId, userId }).lean();
  return doc ? mapProject(doc) : null;
}

export async function createProject(input: CreatePortfolioProjectInput): Promise<PortfolioProject> {
  await connectToDatabase();
  const doc = await PortfolioProjectModel.create(input);
  return mapProject(doc.toObject());
}

export async function updateProject(userId: string, projectId: string, input: Partial<CreatePortfolioProjectInput>): Promise<PortfolioProject | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await PortfolioProjectModel.findOneAndUpdate(
    { _id: projectId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapProject(doc) : null;
}

export async function deleteProject(userId: string, projectId: string): Promise<PortfolioProject | null> {
  await connectToDatabase();
  const doc = await PortfolioProjectModel.findOneAndDelete({ _id: projectId, userId }).lean();
  return doc ? mapProject(doc) : null;
}

// ─── Achievements ─────────────────────────────────────────────────

export async function getAchievements(userId: string): Promise<CareerAchievement[]> {
  await connectToDatabase();
  const docs = await CareerAchievementModel.find({ userId })
    .sort({ date: -1 })
    .lean();
  return docs.map(mapAchievement);
}

export async function getAchievementById(userId: string, achievementId: string): Promise<CareerAchievement | null> {
  await connectToDatabase();
  const doc = await CareerAchievementModel.findOne({ _id: achievementId, userId }).lean();
  return doc ? mapAchievement(doc) : null;
}

export async function createAchievement(input: CreateCareerAchievementInput): Promise<CareerAchievement> {
  await connectToDatabase();
  const doc = await CareerAchievementModel.create(input);
  return mapAchievement(doc.toObject());
}

export async function updateAchievement(userId: string, achievementId: string, input: Partial<CreateCareerAchievementInput>): Promise<CareerAchievement | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await CareerAchievementModel.findOneAndUpdate(
    { _id: achievementId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapAchievement(doc) : null;
}

export async function deleteAchievement(userId: string, achievementId: string): Promise<CareerAchievement | null> {
  await connectToDatabase();
  const doc = await CareerAchievementModel.findOneAndDelete({ _id: achievementId, userId }).lean();
  return doc ? mapAchievement(doc) : null;
}

// ─── Salary Records ───────────────────────────────────────────────

export async function getSalaryRecords(userId: string): Promise<CareerSalaryRecord[]> {
  await connectToDatabase();
  const docs = await SalaryRecordModel.find({ userId })
    .sort({ effectiveDate: -1 })
    .lean();
  return docs.map(mapSalaryRecord);
}

export async function getSalaryRecordById(userId: string, recordId: string): Promise<CareerSalaryRecord | null> {
  await connectToDatabase();
  const doc = await SalaryRecordModel.findOne({ _id: recordId, userId }).lean();
  return doc ? mapSalaryRecord(doc) : null;
}

export async function createSalaryRecord(input: CreateCareerSalaryRecordInput): Promise<CareerSalaryRecord> {
  await connectToDatabase();
  const doc = await SalaryRecordModel.create(input);
  return mapSalaryRecord(doc.toObject());
}

export async function updateSalaryRecord(userId: string, recordId: string, input: Partial<CreateCareerSalaryRecordInput>): Promise<CareerSalaryRecord | null> {
  await connectToDatabase();
  const { userId: _, ...updateData } = input;
  const doc = await SalaryRecordModel.findOneAndUpdate(
    { _id: recordId, userId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapSalaryRecord(doc) : null;
}

export async function deleteSalaryRecord(userId: string, recordId: string): Promise<CareerSalaryRecord | null> {
  await connectToDatabase();
  const doc = await SalaryRecordModel.findOneAndDelete({ _id: recordId, userId }).lean();
  return doc ? mapSalaryRecord(doc) : null;
}
