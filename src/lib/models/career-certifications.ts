import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICareerCertification extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  issuingOrganization?: string;
  credentialId?: string;
  issueDate?: Date;
  expiryDate?: Date;
  verificationUrl?: string;
  certificateUrl?: string;
  skillsCovered: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const CareerCertificationSchema = new Schema<ICareerCertification>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    issuingOrganization: { type: String },
    credentialId: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    verificationUrl: { type: String },
    certificateUrl: { type: String },
    skillsCovered: { type: [String], default: [] },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export const CareerCertificationModel =
  mongoose.models.CareerCertification ||
  mongoose.model<ICareerCertification>("CareerCertification", CareerCertificationSchema);
