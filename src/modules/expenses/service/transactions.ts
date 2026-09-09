import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getRecentMerchants,
  getRecurringTransactions,
  type Transaction,
  type TransactionFilters,
} from "../repository/transactions";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionParams,
  type UpdateTransactionParams,
} from "./validators";
import { addTagToTransaction, removeTagFromTransaction } from "../repository/tags";

export async function createExpenseTransaction(userId: string, params: CreateTransactionParams) {
  const validated = createTransactionSchema.parse(params);
  const { tagIds, ...data } = validated;

  const transaction = await createTransaction({
    ...data,
    userId,
    amount: Number(validated.amount),
    transactionDate: new Date(validated.transactionDate),
    recurrenceEndDate: validated.recurrenceEndDate ? new Date(validated.recurrenceEndDate) : undefined,
  });

  if (tagIds?.length) {
    for (const tagId of tagIds) {
      await addTagToTransaction(transaction.id, tagId);
    }
  }

  return transaction;
}

export async function getExpenseTransactions(filters: TransactionFilters) {
  return getTransactions(filters);
}

export async function getExpenseTransaction(id: string, userId: string) {
  return getTransactionById(id, userId);
}

export async function updateExpenseTransaction(id: string, userId: string, params: UpdateTransactionParams) {
  const validated = updateTransactionSchema.parse(params);
  const { tagIds, ...data } = validated;

  const updateData: Record<string, unknown> = { ...data };
  if (validated.transactionDate) {
    updateData.transactionDate = new Date(validated.transactionDate);
  }
  if (validated.recurrenceEndDate) {
    updateData.recurrenceEndDate = new Date(validated.recurrenceEndDate);
  }

  const transaction = await updateTransaction(id, userId, updateData);
  if (!transaction) return null;

  if (tagIds) {
    for (const tagId of tagIds) {
      await addTagToTransaction(transaction.id, tagId);
    }
  }

  return transaction;
}

export async function deleteExpenseTransaction(id: string, userId: string) {
  return deleteTransaction(id, userId);
}

export async function getRecentMerchantList(userId: string, limit = 10) {
  return getRecentMerchants(userId, limit);
}

export async function getSubscriptionTransactions(userId: string) {
  return getRecurringTransactions(userId);
}

export const defaultTransactionFilters = (userId: string, overrides?: Partial<TransactionFilters>): TransactionFilters => ({
  userId,
  sortBy: "date",
  sortOrder: "desc",
  limit: 50,
  offset: 0,
  ...overrides,
});
