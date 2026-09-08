import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICareerProfile extends Document {
  _id: Types.ObjectId;
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
}

const CareerProfileSchema = new Schema<ICareerProfile>(
  {
    userId: { type: String, required: true, unique: true },
    currentPosition: { type: String },
    company: { type: String },
    yearsOfExperience: { type: Number },
    careerLevel: { type: String },
    targetRole: { type: String },
    dreamCompany: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

export interface ICareerResume extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  content: Record<string, any>;
  isDefault: boolean;
  atsScore?: number;
  lastExportedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CareerResumeSchema = new Schema<ICareerResume>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    isDefault: { type: Boolean, default: false },
    atsScore: { type: Number },
    lastExportedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface ICareerResumeVersion extends Document {
  _id: Types.ObjectId;
  resumeId: Types.ObjectId;
  content: Record<string, any>;
  wordCount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CareerResumeVersionSchema = new Schema<ICareerResumeVersion>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "CareerResume", required: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
    wordCount: { type: Number, default: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

export interface IJobApplication extends Document {
  _id: Types.ObjectId;
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
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    salaryRange: { type: String },
    recruiterInfo: { type: String },
    jobDescriptionUrl: { type: String },
    applicationDate: { type: Date },
    interviewDates: { type: [Date], default: [] },
    notes: { type: String },
    documents: { type: [String], default: [] },
    status: { type: String, default: "wishlist", index: true },
  },
  { timestamps: true }
);

JobApplicationSchema.index({ userId: 1, status: 1 });

export interface ICareerInterviewPrep extends Document {
  _id: Types.ObjectId;
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
}

const CareerInterviewPrepSchema = new Schema<ICareerInterviewPrep>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String },
    category: { type: String },
    difficulty: { type: String },
    completionStatus: { type: String, default: "not_started" },
    revisionCount: { type: Number, default: 0 },
    confidenceLevel: { type: Number },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const CareerProfileModel =
  mongoose.models.CareerProfile || mongoose.model<ICareerProfile>("CareerProfile", CareerProfileSchema);
export const CareerResumeModel =
  mongoose.models.CareerResume || mongoose.model<ICareerResume>("CareerResume", CareerResumeSchema);
export const CareerResumeVersionModel =
  mongoose.models.CareerResumeVersion ||
  mongoose.model<ICareerResumeVersion>("CareerResumeVersion", CareerResumeVersionSchema);
export const JobApplicationModel =
  mongoose.models.JobApplication || mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
export const CareerInterviewPrepModel =
  mongoose.models.CareerInterviewPrep ||
  mongoose.model<ICareerInterviewPrep>("CareerInterviewPrep", CareerInterviewPrepSchema);
