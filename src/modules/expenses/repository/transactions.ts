import { connectToDatabase } from "@/lib/mongodb";
import { Transaction as TransactionModel } from "@/lib/models/expenses";

type TransactionType = string;

export type Transaction = {
  id: string;
  userId: string;
  accountId?: string;
  categoryId?: string;
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
};

export type CreateTransactionInput = {
  userId: string;
  accountId?: string;
  categoryId?: string;
  type: string;
  amount: number;
  currency?: string;
  merchant?: string;
  description?: string;
  paymentMethod?: string;
  transactionDate: Date;
  location?: string;
  isRecurring?: boolean;
  recurrence?: string;
  recurrenceEndDate?: Date;
  attachments?: string[];
  notes?: string;
};

export type UpdateTransactionInput = Partial<Omit<CreateTransactionInput, "userId">>;

export type TransactionFilters = {
  userId: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
  merchant?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

function mapTransaction(doc: any): Transaction {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    accountId: doc.accountId?.toString?.(),
    categoryId: doc.categoryId?.toString?.(),
    type: doc.type,
    amount: doc.amount,
    currency: doc.currency,
    merchant: doc.merchant,
    description: doc.description,
    paymentMethod: doc.paymentMethod,
    transactionDate: doc.transactionDate,
    location: doc.location,
    isRecurring: doc.isRecurring,
    recurrence: doc.recurrence,
    recurrenceEndDate: doc.recurrenceEndDate,
    attachments: doc.attachments,
    notes: doc.notes,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  await connectToDatabase();
  const doc = await TransactionModel.create({
    userId: input.userId,
    accountId: input.accountId,
    categoryId: input.categoryId,
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? "NPR",
    merchant: input.merchant,
    description: input.description,
    paymentMethod: input.paymentMethod,
    transactionDate: input.transactionDate,
    location: input.location,
    isRecurring: input.isRecurring ?? false,
    recurrence: input.recurrence ?? "none",
    recurrenceEndDate: input.recurrenceEndDate,
    attachments: input.attachments ?? [],
    notes: input.notes,
  });
  return mapTransaction(doc);
}

export async function getTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  await connectToDatabase();
  const conditions: Record<string, any> = {
    userId: filters.userId,
    deletedAt: null,
  };

  if (filters.type) conditions.type = filters.type;
  if (filters.categoryId) conditions.categoryId = filters.categoryId;
  if (filters.accountId) conditions.accountId = filters.accountId;
  if (filters.merchant) {
    conditions.merchant = { $regex: filters.merchant, $options: "i" };
  }
  if (filters.startDate || filters.endDate) {
    conditions.transactionDate = {};
    if (filters.startDate) conditions.transactionDate.$gte = filters.startDate;
    if (filters.endDate) conditions.transactionDate.$lte = filters.endDate;
  }
  if (filters.search) {
    const term = filters.search;
    conditions.$or = [
      { merchant: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { notes: { $regex: term, $options: "i" } },
    ];
  }

  const sortField = filters.sortBy === "amount" ? "amount" : "transactionDate";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const docs = await TransactionModel.find(conditions)
    .sort({ [sortField]: sortOrder })
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 50)
    .lean();

  return docs.map(mapTransaction);
}

export async function getTransactionById(
  id: string,
  userId: string,
): Promise<Transaction | null> {
  await connectToDatabase();
  const doc = await TransactionModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapTransaction(doc) : null;
}

export async function updateTransaction(
  id: string,
  userId: string,
  input: UpdateTransactionInput,
): Promise<Transaction | null> {
  await connectToDatabase();
  const doc = await TransactionModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapTransaction(doc) : null;
}

export async function deleteTransaction(
  id: string,
  userId: string,
): Promise<Transaction | null> {
  await connectToDatabase();
  const doc = await TransactionModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapTransaction(doc) : null;
}

export async function getTransactionsByIds(
  ids: string[],
  userId: string,
): Promise<Transaction[]> {
  await connectToDatabase();
  const docs = await TransactionModel.find({
    _id: { $in: ids },
    userId,
    deletedAt: null,
  })
    .sort({ transactionDate: -1 })
    .lean();
  return docs.map(mapTransaction);
}

export async function getRecentMerchants(userId: string, limit = 10): Promise<string[]> {
  await connectToDatabase();

  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId,
        deletedAt: null,
        merchant: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$merchant",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    { $limit: limit },
  ]);

  return results.map((r: any) => r._id).filter(Boolean);
}

export async function getRecurringTransactions(userId: string): Promise<Transaction[]> {
  await connectToDatabase();
  const docs = await TransactionModel.find({
    userId,
    isRecurring: true,
    deletedAt: null,
  })
    .sort({ transactionDate: -1 })
    .lean();
  return docs.map(mapTransaction);
}
