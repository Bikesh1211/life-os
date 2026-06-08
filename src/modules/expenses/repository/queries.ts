import { db } from "@/core/database";
import { transactions } from "../schema/transactions";
import { expenseCategories } from "../schema/categories";
import { eq, and, isNull, sql, gte, lte } from "drizzle-orm";

export async function getMonthlySpending(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const rows = await db
    .select({
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    );

  return {
    total: Number(rows[0]?.total ?? 0),
    count: rows[0]?.count ?? 0,
  };
}

export async function getMonthlyIncome(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const rows = await db
    .select({
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "income"),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    );

  return Number(rows[0]?.total ?? 0);
}

export async function getSpendingByCategory(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return db
    .select({
      categoryId: transactions.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      categoryIcon: expenseCategories.icon,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .leftJoin(expenseCategories, eq(transactions.categoryId, expenseCategories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .groupBy(transactions.categoryId, expenseCategories.name, expenseCategories.color, expenseCategories.icon)
    .orderBy(sql`SUM(${transactions.amount}) DESC`);
}

export async function getDailySpending(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  return db
    .select({
      date: sql<string>`DATE(${transactions.transactionDate})`,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .groupBy(sql`DATE(${transactions.transactionDate})`)
    .orderBy(sql`DATE(${transactions.transactionDate})`);
}

export async function getTopMerchants(userId: string, year: number, month: number, limit = 10) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return db
    .select({
      merchant: transactions.merchant,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        isNull(transactions.deletedAt),
        sql`${transactions.merchant} IS NOT NULL`,
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .groupBy(transactions.merchant)
    .orderBy(sql`SUM(${transactions.amount}) DESC`)
    .limit(limit);
}

export async function getSpendingByPaymentMethod(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return db
    .select({
      paymentMethod: transactions.paymentMethod,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        isNull(transactions.deletedAt),
        sql`${transactions.paymentMethod} IS NOT NULL`,
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate),
      ),
    )
    .groupBy(transactions.paymentMethod)
    .orderBy(sql`SUM(${transactions.amount}) DESC`);
}

export async function getAverageDailySpend(userId: string, year: number, month: number) {
  const { total, count } = await getMonthlySpending(userId, year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  return {
    average: daysInMonth > 0 ? total / daysInMonth : 0,
    total,
    daysInMonth,
  };
}
