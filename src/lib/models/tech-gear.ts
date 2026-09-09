import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITechItem extends Document {
  _id: Types.ObjectId;
  userId: string;
  category: string;
  brand?: string;
  modelName: string;
  serialNumber?: string;
  warrantyExpiry?: Date;
  warrantyProvider?: string;
  ownershipStatus: string;
  condition: string;
  color?: string;
  location?: string;
  specifications: Record<string, any>;
  loanedTo?: string;
  loanDate?: Date;
  expectedReturnDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TechItemSchema = new Schema<ITechItem>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String },
    modelName: { type: String, required: true },
    serialNumber: { type: String },
    warrantyExpiry: { type: Date },
    warrantyProvider: { type: String },
    ownershipStatus: { type: String, default: "owned" },
    condition: { type: String, default: "good" },
    color: { type: String },
    location: { type: String },
    specifications: { type: Schema.Types.Mixed, default: {} },
    loanedTo: { type: String },
    loanDate: { type: Date },
    expectedReturnDate: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export interface ITechSetup extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TechSetupSchema = new Schema<ITechSetup>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

export interface ITechSetupItem extends Document {
  _id: Types.ObjectId;
  setupId: Types.ObjectId;
  itemId: Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TechSetupItemSchema = new Schema<ITechSetupItem>(
  {
    setupId: { type: Schema.Types.ObjectId, ref: "TechSetup", required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "TechItem", required: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface ITechMaintenanceLog extends Document {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  date: Date;
  description: string;
  cost?: number;
  provider?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TechMaintenanceLogSchema = new Schema<ITechMaintenanceLog>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "TechItem", required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    cost: { type: Number },
    provider: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const TechItemModel =
  mongoose.models.TechItem || mongoose.model<ITechItem>("TechItem", TechItemSchema);
export const TechSetupModel =
  mongoose.models.TechSetup || mongoose.model<ITechSetup>("TechSetup", TechSetupSchema);
export const TechSetupItemModel =
  mongoose.models.TechSetupItem || mongoose.model<ITechSetupItem>("TechSetupItem", TechSetupItemSchema);
export const TechMaintenanceLogModel =
  mongoose.models.TechMaintenanceLog || mongoose.model<ITechMaintenanceLog>("TechMaintenanceLog", TechMaintenanceLogSchema);
