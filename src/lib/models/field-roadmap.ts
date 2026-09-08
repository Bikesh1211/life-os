import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFieldBlueprint extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  phases: Record<string, any>;
  skills: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FieldBlueprintSchema = new Schema<IFieldBlueprint>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    phases: { type: Schema.Types.Mixed, required: true },
    skills: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IFieldRoadmap extends Document {
  _id: Types.ObjectId;
  userId: string;
  blueprintId?: Types.ObjectId;
  targetRole: string;
  field: string;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FieldRoadmapSchema = new Schema<IFieldRoadmap>(
  {
    userId: { type: String, required: true, index: true },
    blueprintId: { type: Schema.Types.ObjectId, ref: "FieldBlueprint" },
    targetRole: { type: String, required: true, index: true },
    field: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IFieldRoadmapPhase extends Document {
  _id: Types.ObjectId;
  roadmapId: Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const FieldRoadmapPhaseSchema = new Schema<IFieldRoadmapPhase>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "FieldRoadmap", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    status: { type: String, default: "locked" },
  },
  { timestamps: true }
);

export interface IFieldRoadmapMilestone extends Document {
  _id: Types.ObjectId;
  roadmapId: Types.ObjectId;
  phaseId?: Types.ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FieldRoadmapMilestoneSchema = new Schema<IFieldRoadmapMilestone>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "FieldRoadmap", required: true, index: true },
    phaseId: { type: Schema.Types.ObjectId, ref: "FieldRoadmapPhase" },
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IFieldRoadmapSkill extends Document {
  _id: Types.ObjectId;
  roadmapId: Types.ObjectId;
  phaseId?: Types.ObjectId;
  name: string;
  description?: string;
  category?: string;
  evidenceSources: Record<string, any>[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FieldRoadmapSkillSchema = new Schema<IFieldRoadmapSkill>(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: "FieldRoadmap", required: true, index: true },
    phaseId: { type: Schema.Types.ObjectId, ref: "FieldRoadmapPhase" },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    evidenceSources: { type: [{ type: Schema.Types.Mixed }], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IFieldRoadmapSkillEvidence extends Document {
  _id: Types.ObjectId;
  skillId: Types.ObjectId;
  evidenceType: string;
  entityId: string;
  description?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FieldRoadmapSkillEvidenceSchema = new Schema<IFieldRoadmapSkillEvidence>(
  {
    skillId: { type: Schema.Types.ObjectId, ref: "FieldRoadmapSkill", required: true, index: true },
    evidenceType: { type: String, required: true },
    entityId: { type: String, required: true },
    description: { type: String },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const FieldBlueprintModel =
  mongoose.models.FieldBlueprint ||
  mongoose.model<IFieldBlueprint>("FieldBlueprint", FieldBlueprintSchema);
export const FieldRoadmapModel =
  mongoose.models.FieldRoadmap || mongoose.model<IFieldRoadmap>("FieldRoadmap", FieldRoadmapSchema);
export const FieldRoadmapPhaseModel =
  mongoose.models.FieldRoadmapPhase ||
  mongoose.model<IFieldRoadmapPhase>("FieldRoadmapPhase", FieldRoadmapPhaseSchema);
export const FieldRoadmapMilestoneModel =
  mongoose.models.FieldRoadmapMilestone ||
  mongoose.model<IFieldRoadmapMilestone>("FieldRoadmapMilestone", FieldRoadmapMilestoneSchema);
export const FieldRoadmapSkillModel =
  mongoose.models.FieldRoadmapSkill ||
  mongoose.model<IFieldRoadmapSkill>("FieldRoadmapSkill", FieldRoadmapSkillSchema);
export const FieldRoadmapSkillEvidenceModel =
  mongoose.models.FieldRoadmapSkillEvidence ||
  mongoose.model<IFieldRoadmapSkillEvidence>("FieldRoadmapSkillEvidence", FieldRoadmapSkillEvidenceSchema);
