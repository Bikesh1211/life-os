import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITravelHelperRoute extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  origin: Record<string, any>;
  destination: Record<string, any>;
  waypoints: Record<string, any>[];
  polyline?: string;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  transportMode: string;
  routeDate?: Date;
  isArchived: boolean;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  elevationMin?: number;
  elevationMax?: number;
  elevationGain?: number;
  elevationLoss?: number;
  geometries?: Record<string, any>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TravelHelperRouteSchema = new Schema<ITravelHelperRoute>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    origin: { type: Schema.Types.Mixed, required: true },
    destination: { type: Schema.Types.Mixed, required: true },
    waypoints: { type: [{ type: Schema.Types.Mixed }], default: [] },
    polyline: { type: String },
    totalDistanceKm: { type: Number },
    totalDurationMinutes: { type: Number },
    transportMode: { type: String, default: "driving" },
    routeDate: { type: Date },
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    notes: { type: String },
    elevationMin: { type: Number },
    elevationMax: { type: Number },
    elevationGain: { type: Number },
    elevationLoss: { type: Number },
    geometries: { type: Schema.Types.Mixed },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const TravelHelperRouteModel =
  mongoose.models.TravelHelperRoute ||
  mongoose.model<ITravelHelperRoute>("TravelHelperRoute", TravelHelperRouteSchema);
