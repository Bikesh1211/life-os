import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Routine ─────────────────────────────────────────────────────────────────

export interface IRoutine extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  scheduleType: string;
  customDays: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoutineSchema = new Schema<IRoutine>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    scheduleType: { type: String, default: "daily" },
    customDays: { type: [String], default: [] },
  },
  { timestamps: true }
);

RoutineSchema.index({ userId: 1, isActive: 1 });

// ─── RoutineItem ─────────────────────────────────────────────────────────────

export interface IRoutineItem extends Document {
  _id: Types.ObjectId;
  routineId?: Types.ObjectId;
  userId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  order: number;
  isOptional: boolean;
  category?: string;
  priority?: string;
  location?: string;
  date?: string;
  status?: string;
  linkedHabitId?: string;
  linkedTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineItemSchema = new Schema<IRoutineItem>(
  {
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", index: true },
    userId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String },
    order: { type: Number, default: 0 },
    isOptional: { type: Boolean, default: false },
    category: { type: String },
    priority: { type: String },
    location: { type: String },
    date: { type: String, index: true },
    status: { type: String },
    linkedHabitId: { type: String },
    linkedTaskId: { type: String },
  },
  { timestamps: true }
);

RoutineItemSchema.index({ userId: 1, date: 1 });

// ─── RoutineExecution ────────────────────────────────────────────────────────

export interface IRoutineExecution extends Document {
  _id: Types.ObjectId;
  routineId: Types.ObjectId;
  userId: string;
  date: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status: string;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineExecutionSchema = new Schema<IRoutineExecution>(
  {
    routineId: { type: Schema.Types.ObjectId, ref: "Routine", required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    plannedStart: { type: String },
    plannedEnd: { type: String },
    actualStart: { type: String },
    actualEnd: { type: String },
    status: { type: String, default: "pending" },
    completionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RoutineExecutionSchema.index({ routineId: 1, date: 1 });

// ─── RoutineExecutionItem ────────────────────────────────────────────────────

export interface IRoutineExecutionItem extends Document {
  _id: Types.ObjectId;
  executionId: Types.ObjectId;
  routineItemId: Types.ObjectId;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineExecutionItemSchema = new Schema<IRoutineExecutionItem>(
  {
    executionId: { type: Schema.Types.ObjectId, ref: "RoutineExecution", required: true, index: true },
    routineItemId: { type: Schema.Types.ObjectId, ref: "RoutineItem", required: true, index: true },
    plannedStart: { type: String },
    plannedEnd: { type: String },
    actualStart: { type: String },
    actualEnd: { type: String },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

// ─── RoutineTemplate ─────────────────────────────────────────────────────────

export interface IRoutineTemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  scheduleType: string;
  customDays: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoutineTemplateSchema = new Schema<IRoutineTemplate>(
  {
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String },
    icon: { type: String },
    scheduleType: { type: String, default: "daily" },
    customDays: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ─── RoutineTemplateItem ─────────────────────────────────────────────────────

export interface IRoutineTemplateItem extends Document {
  _id: Types.ObjectId;
  templateId: Types.ObjectId;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  order: number;
  isOptional: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineTemplateItemSchema = new Schema<IRoutineTemplateItem>(
  {
    templateId: { type: Schema.Types.ObjectId, ref: "RoutineTemplate", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String },
    order: { type: Number, default: 0 },
    isOptional: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── DailyGoal ───────────────────────────────────────────────────────────────

export interface IDailyGoal extends Document {
  _id: Types.ObjectId;
  userId: string;
  date: string;
  title: string;
  isCompleted: boolean;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyGoalSchema = new Schema<IDailyGoal>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    taskId: { type: String },
  },
  { timestamps: true }
);

DailyGoalSchema.index({ userId: 1, date: 1 }, { unique: true });

// ─── DailyPriority ───────────────────────────────────────────────────────────

export interface IDailyPriority extends Document {
  _id: Types.ObjectId;
  userId: string;
  date: string;
  title: string;
  estimatedDuration?: number;
  status: string;
  sortOrder: number;
  taskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyPrioritySchema = new Schema<IDailyPriority>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true },
    estimatedDuration: { type: Number },
    status: { type: String, default: "pending" },
    sortOrder: { type: Number, default: 0 },
    taskId: { type: String },
  },
  { timestamps: true }
);

DailyPrioritySchema.index({ userId: 1, date: 1 }, { unique: true });

// ─── DailyPlannerSnapshot ────────────────────────────────────────────────────

export interface IDailyPlannerSnapshot extends Document {
  _id: Types.ObjectId;
  userId: string;
  date: string;
  productivityScore: number;
  subScores: Record<string, unknown>;
  tasksCompleted: number;
  tasksTotal: number;
  focusMinutes: number;
  habitsCompleted: number;
  habitsTotal: number;
  dailyGoalCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DailyPlannerSnapshotSchema = new Schema<IDailyPlannerSnapshot>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    productivityScore: { type: Number, required: true },
    subScores: { type: Schema.Types.Mixed, default: {} },
    tasksCompleted: { type: Number, default: 0 },
    tasksTotal: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
    habitsCompleted: { type: Number, default: 0 },
    habitsTotal: { type: Number, default: 0 },
    dailyGoalCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DailyPlannerSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

// ─── DailyNote ───────────────────────────────────────────────────────────────

export interface IDailyNote extends Document {
  _id: Types.ObjectId;
  userId: string;
  date: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyNoteSchema = new Schema<IDailyNote>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    content: { type: String },
  },
  { timestamps: true }
);

DailyNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

// ─── PlannerPreference ───────────────────────────────────────────────────────

export interface IPlannerPreference extends Document {
  _id: Types.ObjectId;
  userId: string;
  morningReminderTime?: string;
  eveningReminderTime?: string;
  notificationConfig: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PlannerPreferenceSchema = new Schema<IPlannerPreference>(
  {
    userId: { type: String, required: true, unique: true },
    morningReminderTime: { type: String },
    eveningReminderTime: { type: String },
    notificationConfig: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ─── Exports ─────────────────────────────────────────────────────────────────

export const RoutineModel =
  mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema);

export const RoutineItemModel =
  mongoose.models.RoutineItem || mongoose.model<IRoutineItem>("RoutineItem", RoutineItemSchema);

export const RoutineExecutionModel =
  mongoose.models.RoutineExecution ||
  mongoose.model<IRoutineExecution>("RoutineExecution", RoutineExecutionSchema);

export const RoutineExecutionItemModel =
  mongoose.models.RoutineExecutionItem ||
  mongoose.model<IRoutineExecutionItem>("RoutineExecutionItem", RoutineExecutionItemSchema);

export const RoutineTemplateModel =
  mongoose.models.RoutineTemplate ||
  mongoose.model<IRoutineTemplate>("RoutineTemplate", RoutineTemplateSchema);

export const RoutineTemplateItemModel =
  mongoose.models.RoutineTemplateItem ||
  mongoose.model<IRoutineTemplateItem>("RoutineTemplateItem", RoutineTemplateItemSchema);

export const DailyGoalModel =
  mongoose.models.DailyGoal || mongoose.model<IDailyGoal>("DailyGoal", DailyGoalSchema);

export const DailyPriorityModel =
  mongoose.models.DailyPriority || mongoose.model<IDailyPriority>("DailyPriority", DailyPrioritySchema);

export const DailyPlannerSnapshotModel =
  mongoose.models.DailyPlannerSnapshot ||
  mongoose.model<IDailyPlannerSnapshot>("DailyPlannerSnapshot", DailyPlannerSnapshotSchema);

export const DailyNoteModel =
  mongoose.models.DailyNote || mongoose.model<IDailyNote>("DailyNote", DailyNoteSchema);

export const PlannerPreferenceModel =
  mongoose.models.PlannerPreference ||
  mongoose.model<IPlannerPreference>("PlannerPreference", PlannerPreferenceSchema);
