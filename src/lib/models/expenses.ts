import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAccount extends Document {
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseCategory extends Document {
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  userId: string;
  accountId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  type: string;
  amount: number;
  currency: string;
  merchant?: string;
  description?: string;
  paymentMethod?: string;
  transactionDate: Date;
  location?: string;
  isRecurring: boolean;
  recurrence: string;
  recurrenceEndDate?: Date;
  attachments: string[];
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget extends Document {
  userId: string;
  categoryId: Types.ObjectId;
  amount: number;
  period: string;
  startDate: Date;
  endDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseTag extends Document {
  userId: string;
  name: string;
  color?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionTag extends Document {
  transactionId: Types.ObjectId;
  tagId: Types.ObjectId;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "NPR" },
    icon: { type: String },
    color: { type: String },
    isArchived: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    sortOrder: { type: Number, default: 0 },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    categoryId: { type: Schema.Types.ObjectId, ref: "ExpenseCategory" },
    type: { type: String, default: "expense" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NPR" },
    merchant: { type: String },
    description: { type: String },
    paymentMethod: { type: String },
    transactionDate: { type: Date, required: true, index: true },
    location: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurrence: { type: String, default: "none" },
    recurrenceEndDate: { type: Date },
    attachments: { type: [String], default: [] },
    notes: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, type: 1, transactionDate: 1 });
TransactionSchema.index({ categoryId: 1 });

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },
    amount: { type: Number, required: true },
    period: { type: String, default: "monthly" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const ExpenseTagSchema = new Schema<IExpenseTag>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const TransactionTagSchema = new Schema<ITransactionTag>({
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
    index: true,
  },
  tagId: {
    type: Schema.Types.ObjectId,
    ref: "ExpenseTag",
    required: true,
    index: true,
  },
});

TransactionTagSchema.index({ transactionId: 1, tagId: 1 }, { unique: true });

export const Account: Model<IAccount> =
  mongoose.models.Account ||
  mongoose.model<IAccount>("Account", AccountSchema);

export const ExpenseCategory: Model<IExpenseCategory> =
  mongoose.models.ExpenseCategory ||
  mongoose.model<IExpenseCategory>("ExpenseCategory", ExpenseCategorySchema);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export const Budget: Model<IBudget> =
  mongoose.models.Budget ||
  mongoose.model<IBudget>("Budget", BudgetSchema);

export const ExpenseTag: Model<IExpenseTag> =
  mongoose.models.ExpenseTag ||
  mongoose.model<IExpenseTag>("ExpenseTag", ExpenseTagSchema);

export const TransactionTag: Model<ITransactionTag> =
  mongoose.models.TransactionTag ||
  mongoose.model<ITransactionTag>("TransactionTag", TransactionTagSchema);
