import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGoal extends Document {
  userId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  progress: number;
  deadline?: Date;
  category?: string;
  startDate?: Date;
  completionDate?: Date;
  linkedEntityType?: string;
  linkedEntityId?: string;
  aiSuggested: boolean;
  reward?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoalMilestone extends Document {
  goalId: Types.ObjectId;
  title: string;
  completed: boolean;
  order: number;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, default: "short-term" },
    status: { type: String, default: "draft", index: true },
    progress: { type: Number, default: 0 },
    deadline: { type: Date, index: true },
    category: { type: String },
    startDate: { type: Date },
    completionDate: { type: Date },
    linkedEntityType: { type: String },
    linkedEntityId: { type: String },
    aiSuggested: { type: Boolean, default: false },
    reward: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, status: 1 });

const GoalMilestoneSchema = new Schema<IGoalMilestone>(
  {
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    targetDate: { type: Date },
  },
  { timestamps: true }
);

export const Goal: Model<IGoal> =
  mongoose.models.Goal ||
  mongoose.model<IGoal>("Goal", GoalSchema);

export const GoalMilestone: Model<IGoalMilestone> =
  mongoose.models.GoalMilestone ||
  mongoose.model<IGoalMilestone>("GoalMilestone", GoalMilestoneSchema);
