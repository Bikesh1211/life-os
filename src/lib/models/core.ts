import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICoreTag extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  color?: string;
  createdAt: Date;
}

const CoreTagSchema = new Schema<ICoreTag>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export interface ICoreTagging extends Document {
  _id: Types.ObjectId;
  tagId: Types.ObjectId;
  entityId: string;
  entityType: string;
  createdAt: Date;
}

const CoreTaggingSchema = new Schema<ICoreTagging>(
  {
    tagId: { type: Schema.Types.ObjectId, ref: "CoreTag", required: true, index: true },
    entityId: { type: String, required: true },
    entityType: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CoreTaggingSchema.index({ entityId: 1, entityType: 1 });
CoreTaggingSchema.index({ tagId: 1, entityId: 1, entityType: 1 }, { unique: true });

export interface ISidebarPreference extends Document {
  _id: Types.ObjectId;
  userId: string;
  favorites: string[];
  visibility: { hiddenGroups: string[]; hiddenItems: string[] };
  updatedAt: Date;
}

const SidebarPreferenceSchema = new Schema<ISidebarPreference>(
  {
    userId: { type: String, required: true, unique: true },
    favorites: { type: [String], default: [] },
    visibility: {
      type: {
        hiddenGroups: { type: [String], default: [] },
        hiddenItems: { type: [String], default: [] },
      },
      default: { hiddenGroups: [], hiddenItems: [] },
    },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
);

export const CoreTagModel =
  mongoose.models.CoreTag || mongoose.model<ICoreTag>("CoreTag", CoreTagSchema);
export const CoreTaggingModel =
  mongoose.models.CoreTagging || mongoose.model<ICoreTagging>("CoreTagging", CoreTaggingSchema);
export const SidebarPreferenceModel =
  mongoose.models.SidebarPreference ||
  mongoose.model<ISidebarPreference>("SidebarPreference", SidebarPreferenceSchema);
