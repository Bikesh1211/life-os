import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStrategySection extends Document {
  _id: Types.ObjectId;
  userId: string;
  sectionType: string;
  title?: string;
  content: Record<string, any>;
  order: number;
  isPinned: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const StrategySectionSchema = new Schema<IStrategySection>(
  {
    userId: { type: String, required: true, index: true },
    sectionType: { type: String, required: true, index: true },
    title: { type: String },
    content: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IStrategyVersion extends Document {
  _id: Types.ObjectId;
  userId: string;
  sections: Record<string, any>;
  snapshot: Record<string, any>;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StrategyVersionSchema = new Schema<IStrategyVersion>(
  {
    userId: { type: String, required: true, index: true },
    sections: { type: Schema.Types.Mixed, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const StrategySectionModel =
  mongoose.models.StrategySection ||
  mongoose.model<IStrategySection>("StrategySection", StrategySectionSchema);
export const StrategyVersionModel =
  mongoose.models.StrategyVersion ||
  mongoose.model<IStrategyVersion>("StrategyVersion", StrategyVersionSchema);
