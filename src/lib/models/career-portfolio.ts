import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPortfolioProject extends Document {
  _id: Types.ObjectId;
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
}

const PortfolioProjectSchema = new Schema<IPortfolioProject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    technologies: { type: [String], default: [] },
    githubUrl: { type: String },
    liveDemoUrl: { type: String },
    screenshots: { type: [String], default: [] },
    role: { type: String },
    teamSize: { type: Number },
    timeline: { type: String },
    achievements: { type: String },
    lessonsLearned: { type: String },
  },
  { timestamps: true }
);

export const PortfolioProjectModel =
  mongoose.models.PortfolioProject ||
  mongoose.model<IPortfolioProject>("PortfolioProject", PortfolioProjectSchema);
