import { getMonthlySpending as getMonthlySpendingRepo, getMonthlyIncome, getSpendingByCategory, getDailySpending, getTopMerchants, getSpendingByPaymentMethod, getAverageDailySpend } from "../repository/queries";
import dayjs from "dayjs";

export async function getMonthlySpending(userId: string, year?: number, month?: number) {
  const now = dayjs();
  return getMonthlySpendingRepo(userId, year ?? now.year(), month ?? now.month() + 1);
}

export async function getMonthlyIncomeTotal(userId: string, year?: number, month?: number) {
  const now = dayjs();
  return getMonthlyIncome(userId, year ?? now.year(), month ?? now.month() + 1);
}

export async function getCategoryBreakdown(userId: string, year?: number, month?: number) {
  const now = dayjs();
  return getSpendingByCategory(userId, year ?? now.year(), month ?? now.month() + 1);
}

export async function getDailySpendingTimeline(userId: string, days = 30) {
  const endDate = dayjs().endOf("day").toDate();
  const startDate = dayjs().subtract(days, "day").startOf("day").toDate();
  return getDailySpending(userId, startDate, endDate);
}

export async function getTopMerchantsList(userId: string, year?: number, month?: number, limit = 10) {
  const now = dayjs();
  return getTopMerchants(userId, year ?? now.year(), month ?? now.month() + 1, limit);
}

export async function getPaymentMethodBreakdown(userId: string, year?: number, month?: number) {
  const now = dayjs();
  return getSpendingByPaymentMethod(userId, year ?? now.year(), month ?? now.month() + 1);
}

export async function getAverageDailySpending(userId: string, year?: number, month?: number) {
  const now = dayjs();
  return getAverageDailySpend(userId, year ?? now.year(), month ?? now.month() + 1);
}

export async function getDashboardSummary(userId: string) {
  const now = dayjs();
  const year = now.year();
  const month = now.month() + 1;

  const [monthlySpending, monthlyIncome, averageDaily] = await Promise.all([
    getMonthlySpending(userId, year, month),
    getMonthlyIncomeTotal(userId, year, month),
    getAverageDailySpending(userId, year, month),
  ]);

  const savingsRate = monthlyIncome > 0
    ? ((monthlyIncome - monthlySpending.total) / monthlyIncome) * 100
    : 0;

  return {
    monthlySpending: monthlySpending.total,
    monthlyIncome,
    savingsRate: Math.max(0, savingsRate),
    averageDailySpend: averageDaily.average,
    transactionCount: monthlySpending.count,
  };
}
