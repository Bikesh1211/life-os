import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScript extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  subtitle?: string;
  categoryId?: Types.ObjectId;
  purpose?: string;
  audience?: string;
  venue?: string;
  language?: string;
  eventDate?: Date;
  eventTime?: string;
  expectedDuration?: number;
  speaker?: string;
  organization?: string;
  priority: string;
  difficulty: string;
  visibility: string;
  status: string;
  notes?: string;
  attachments: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptSchema = new Schema<IScript>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "ScriptCategory" },
    purpose: { type: String },
    audience: { type: String },
    venue: { type: String },
    language: { type: String },
    eventDate: { type: Date },
    eventTime: { type: String },
    expectedDuration: { type: Number },
    speaker: { type: String },
    organization: { type: String },
    priority: { type: String, default: "medium" },
    difficulty: { type: String, default: "medium" },
    visibility: { type: String, default: "private" },
    status: { type: String, default: "draft", index: true },
    notes: { type: String },
    attachments: { type: [String], default: [] },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IScriptSection extends Document {
  _id: Types.ObjectId;
  scriptId: Types.ObjectId;
  title: string;
  content: Record<string, any>;
  sortOrder: number;
  estimatedDurationSeconds?: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptSectionSchema = new Schema<IScriptSection>(
  {
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    sortOrder: { type: Number, required: true },
    estimatedDurationSeconds: { type: Number },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IScriptSpeakerNote extends Document {
  _id: Types.ObjectId;
  sectionId: Types.ObjectId;
  nodePath: string;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptSpeakerNoteSchema = new Schema<IScriptSpeakerNote>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: "ScriptSection", required: true, index: true },
    nodePath: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

ScriptSpeakerNoteSchema.index({ sectionId: 1, nodePath: 1 }, { unique: true });

export interface IScriptCategory extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  defaultTemplateId?: Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptCategorySchema = new Schema<IScriptCategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    sortOrder: { type: Number, default: 0 },
    defaultTemplateId: { type: Schema.Types.ObjectId, ref: "ScriptStructureTemplate" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface IScriptStructureTemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  categoryId?: Types.ObjectId;
  sections: Record<string, any>;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptStructureTemplateSchema = new Schema<IScriptStructureTemplate>(
  {
    name: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ScriptCategory" },
    sections: { type: Schema.Types.Mixed, required: true },
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IScriptPracticeSession extends Document {
  _id: Types.ObjectId;
  userId: string;
  scriptId: Types.ObjectId;
  practicedAt: Date;
  durationSeconds?: number;
  confidence?: number;
  mistakes: string[];
  voiceQuality?: number;
  eyeContact?: number;
  bodyLanguageNotes?: string;
  rating?: number;
  improvements?: string;
  sectionsPracticed: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ScriptPracticeSessionSchema = new Schema<IScriptPracticeSession>(
  {
    userId: { type: String, required: true, index: true },
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    practicedAt: { type: Date, default: Date.now },
    durationSeconds: { type: Number },
    confidence: { type: Number },
    mistakes: { type: [String], default: [] },
    voiceQuality: { type: Number },
    eyeContact: { type: Number },
    bodyLanguageNotes: { type: String },
    rating: { type: Number },
    improvements: { type: String },
    sectionsPracticed: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface IScriptQuestion extends Document {
  _id: Types.ObjectId;
  userId: string;
  scriptId: Types.ObjectId;
  question: string;
  suggestedAnswer?: string;
  difficulty: string;
  confidence?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptQuestionSchema = new Schema<IScriptQuestion>(
  {
    userId: { type: String, required: true, index: true },
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    question: { type: String, required: true },
    suggestedAnswer: { type: String },
    difficulty: { type: String, default: "medium" },
    confidence: { type: Number },
    status: { type: String, default: "needs_practice" },
  },
  { timestamps: true }
);

export interface IScriptActionItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  scriptId: Types.ObjectId;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptActionItemSchema = new Schema<IScriptActionItem>(
  {
    userId: { type: String, required: true, index: true },
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IScriptChecklistTemplate extends Document {
  _id: Types.ObjectId;
  scriptId: Types.ObjectId;
  text: string;
  isCompleted: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptChecklistTemplateSchema = new Schema<IScriptChecklistTemplate>(
  {
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IScriptVersion extends Document {
  _id: Types.ObjectId;
  scriptId: Types.ObjectId;
  snapshot: Record<string, any>;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptVersionSchema = new Schema<IScriptVersion>(
  {
    scriptId: { type: Schema.Types.ObjectId, ref: "Script", required: true, index: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const ScriptModel =
  mongoose.models.Script || mongoose.model<IScript>("Script", ScriptSchema);
export const ScriptSectionModel =
  mongoose.models.ScriptSection || mongoose.model<IScriptSection>("ScriptSection", ScriptSectionSchema);
export const ScriptSpeakerNoteModel =
  mongoose.models.ScriptSpeakerNote || mongoose.model<IScriptSpeakerNote>("ScriptSpeakerNote", ScriptSpeakerNoteSchema);
export const ScriptCategoryModel =
  mongoose.models.ScriptCategory || mongoose.model<IScriptCategory>("ScriptCategory", ScriptCategorySchema);
export const ScriptStructureTemplateModel =
  mongoose.models.ScriptStructureTemplate || mongoose.model<IScriptStructureTemplate>("ScriptStructureTemplate", ScriptStructureTemplateSchema);
export const ScriptPracticeSessionModel =
  mongoose.models.ScriptPracticeSession || mongoose.model<IScriptPracticeSession>("ScriptPracticeSession", ScriptPracticeSessionSchema);
export const ScriptQuestionModel =
  mongoose.models.ScriptQuestion || mongoose.model<IScriptQuestion>("ScriptQuestion", ScriptQuestionSchema);
export const ScriptActionItemModel =
  mongoose.models.ScriptActionItem || mongoose.model<IScriptActionItem>("ScriptActionItem", ScriptActionItemSchema);
export const ScriptChecklistTemplateModel =
  mongoose.models.ScriptChecklistTemplate || mongoose.model<IScriptChecklistTemplate>("ScriptChecklistTemplate", ScriptChecklistTemplateSchema);
export const ScriptVersionModel =
  mongoose.models.ScriptVersion || mongoose.model<IScriptVersion>("ScriptVersion", ScriptVersionSchema);
