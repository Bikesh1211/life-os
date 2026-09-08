import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICareerAchievement extends Document {
  _id: Types.ObjectId;
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
}

const CareerAchievementSchema = new Schema<ICareerAchievement>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date },
    organization: { type: String },
    images: { type: [String], default: [] },
    links: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const CareerAchievementModel =
  mongoose.models.CareerAchievement ||
  mongoose.model<ICareerAchievement>("CareerAchievement", CareerAchievementSchema);
