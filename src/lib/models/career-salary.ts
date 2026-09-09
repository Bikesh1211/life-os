import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISalaryRecord extends Document {
  _id: Types.ObjectId;
  userId: string;
  baseSalary: number;
  bonus?: number;
  stocks?: number;
  incentives?: number;
  currency: string;
  effectiveDate: Date;
  promotionContext?: string;
  roleContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryRecordSchema = new Schema<ISalaryRecord>(
  {
    userId: { type: String, required: true, index: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number },
    stocks: { type: Number },
    incentives: { type: Number },
    currency: { type: String, default: "NPR" },
    effectiveDate: { type: Date, required: true },
    promotionContext: { type: String },
    roleContext: { type: String },
  },
  { timestamps: true }
);

export const SalaryRecordModel =
  mongoose.models.SalaryRecord || mongoose.model<ISalaryRecord>("SalaryRecord", SalaryRecordSchema);
