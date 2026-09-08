import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILoan extends Document {
  _id: Types.ObjectId;
  userId: string;
  connectionId: string;
  direction: string;
  principalAmount: number;
  interestRate?: number;
  interestType: string;
  totalPayable: number;
  loanDate: Date;
  dueDate?: Date;
  status: string;
  installmentCount?: number;
  installmentAmount?: number;
  installmentFrequency?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  isPinned: boolean;
  archivedAt?: Date;
  deletedAt?: Date;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: String, required: true, index: true },
    connectionId: { type: String, required: true, index: true },
    direction: { type: String, required: true },
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number },
    interestType: { type: String, default: "none" },
    totalPayable: { type: Number, required: true },
    loanDate: { type: Date, required: true },
    dueDate: { type: Date, index: true },
    status: { type: String, default: "active", index: true },
    installmentCount: { type: Number },
    installmentAmount: { type: Number },
    installmentFrequency: { type: String },
    linkedEntityType: { type: String },
    linkedEntityId: { type: String },
    isPinned: { type: Boolean, default: false },
    archivedAt: { type: Date },
    deletedAt: { type: Date },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface ILoanEvent extends Document {
  _id: Types.ObjectId;
  loanId: Types.ObjectId;
  userId: string;
  eventType: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanEventSchema = new Schema<ILoanEvent>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    userId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface ILoanRepayment extends Document {
  _id: Types.ObjectId;
  loanId: Types.ObjectId;
  userId: string;
  amount: number;
  date: Date;
  paymentMethod?: string;
  notes?: string;
  receiptUrl?: string;
  installmentNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoanRepaymentSchema = new Schema<ILoanRepayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    paymentMethod: { type: String },
    notes: { type: String },
    receiptUrl: { type: String },
    installmentNumber: { type: Number },
  },
  { timestamps: true }
);

export const LoanModel =
  mongoose.models.Loan || mongoose.model<ILoan>("Loan", LoanSchema);
export const LoanEventModel =
  mongoose.models.LoanEvent || mongoose.model<ILoanEvent>("LoanEvent", LoanEventSchema);
export const LoanRepaymentModel =
  mongoose.models.LoanRepayment || mongoose.model<ILoanRepayment>("LoanRepayment", LoanRepaymentSchema);
