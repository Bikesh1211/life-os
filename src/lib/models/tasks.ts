import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITaskProject extends Document {
  userId: string;
  title: string;
  color: string;
  description?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  userId: string;
  projectId?: Types.ObjectId;
  parentId?: Types.ObjectId;
  title: string;
  description?: string;
  descriptionJson?: Record<string, unknown>;
  status: string;
  priority: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  recurrence: string;
  recurrenceEndDate?: Date;
  order: number;
  completedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskLabel extends Document {
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskTasksLabel extends Document {
  taskId: Types.ObjectId;
  labelId: Types.ObjectId;
}

const TaskProjectSchema = new Schema<ITaskProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    color: { type: String, default: "blue" },
    description: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "TaskProject" },
    parentId: { type: Schema.Types.ObjectId, ref: "Task" },
    title: { type: String, required: true },
    description: { type: String },
    descriptionJson: { type: Schema.Types.Mixed },
    status: { type: String, default: "todo", index: true },
    priority: { type: String, default: "p3", index: true },
    dueDate: { type: Date, index: true },
    startDate: { type: Date },
    estimatedMinutes: { type: Number },
    actualMinutes: { type: Number },
    recurrence: { type: String, default: "none" },
    recurrenceEndDate: { type: Date },
    order: { type: Number, default: 0 },
    completedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ parentId: 1 });

const TaskLabelSchema = new Schema<ITaskLabel>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "blue" },
  },
  { timestamps: true }
);

const TaskTasksLabelSchema = new Schema<ITaskTasksLabel>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true,
  },
  labelId: {
    type: Schema.Types.ObjectId,
    ref: "TaskLabel",
    required: true,
    index: true,
  },
});

TaskTasksLabelSchema.index({ taskId: 1, labelId: 1 }, { unique: true });

export const TaskProject: Model<ITaskProject> =
  mongoose.models.TaskProject ||
  mongoose.model<ITaskProject>("TaskProject", TaskProjectSchema);

export const Task: Model<ITask> =
  mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);

export const TaskLabel: Model<ITaskLabel> =
  mongoose.models.TaskLabel ||
  mongoose.model<ITaskLabel>("TaskLabel", TaskLabelSchema);

export const TaskTasksLabel: Model<ITaskTasksLabel> =
  mongoose.models.TaskTasksLabel ||
  mongoose.model<ITaskTasksLabel>("TaskTasksLabel", TaskTasksLabelSchema);
