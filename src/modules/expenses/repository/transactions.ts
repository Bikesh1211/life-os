import { db } from "@/core/database";
import { transactions } from "../schema/transactions";
import { eq, and, isNull, desc, asc, sql, inArray, gte, lte } from "drizzle-orm";

export type Transaction = typeof transactions.$inferSelect;
export type CreateTransactionInput = typeof transactions.$inferInsert;
export type UpdateTransactionInput = Partial<Omit<CreateTransactionInput, "id" | "userId">>;

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

export async function createTransaction(input: CreateTransactionInput) {
  const [transaction] = await db.insert(transactions).values(input).returning();
  return transaction;
}

export async function getTransactions(filters: TransactionFilters) {
  const conditions = [
    eq(transactions.userId, filters.userId),
    isNull(transactions.deletedAt),
  ];

  if (filters.type) conditions.push(eq(transactions.type, filters.type as any));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.accountId) conditions.push(eq(transactions.accountId, filters.accountId));
  if (filters.merchant) conditions.push(sql`LOWER(${transactions.merchant}) LIKE ${`%${filters.merchant.toLowerCase()}%`}`);
  if (filters.startDate) conditions.push(gte(transactions.transactionDate, filters.startDate));
  if (filters.endDate) conditions.push(lte(transactions.transactionDate, filters.endDate));
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${transactions.merchant}) LIKE ${term} OR LOWER(${transactions.description}) LIKE ${term} OR LOWER(${transactions.notes}) LIKE ${term})`,
    );
  }

  const orderBy = filters.sortBy === "amount"
    ? filters.sortOrder === "asc" ? asc(transactions.amount) : desc(transactions.amount)
    : filters.sortOrder === "asc" ? asc(transactions.transactionDate) : desc(transactions.transactionDate);

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function getTransactionById(id: string, userId: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)));
  return transaction ?? null;
}

export async function updateTransaction(id: string, userId: string, input: UpdateTransactionInput) {
  const [transaction] = await db
    .update(transactions)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)))
    .returning();
  return transaction ?? null;
}

export async function deleteTransaction(id: string, userId: string) {
  const [transaction] = await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)))
    .returning();
  return transaction ?? null;
}

export async function getTransactionsByIds(ids: string[], userId: string) {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        inArray(transactions.id, ids),
      ),
    )
    .orderBy(desc(transactions.transactionDate));
}

export async function getRecentMerchants(userId: string, limit = 10) {
  const rows = await db
    .select({ merchant: transactions.merchant })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt), sql`${transactions.merchant} IS NOT NULL`))
    .groupBy(transactions.merchant)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);
  return rows.map((r) => r.merchant).filter(Boolean) as string[];
}

export async function getRecurringTransactions(userId: string) {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.isRecurring, true),
        isNull(transactions.deletedAt),
      ),
    )
    .orderBy(desc(transactions.transactionDate));
}
