import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  getCategoryBreakdown,
  getDailySpendingTimeline,
  getTopMerchantsList,
  getPaymentMethodBreakdown,
  getAverageDailySpending,
  getMonthlySpending,
  getMonthlyIncomeTotal,
} from "@/modules/expenses/service/dashboard";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
  const month = searchParams.get("month") ? Number(searchParams.get("month")) : undefined;

  const [categoryBreakdown, timeline, topMerchants, paymentMethods, averageDaily, spending, income] =
    await Promise.all([
      getCategoryBreakdown(userId, year, month),
      getDailySpendingTimeline(userId, 90),
      getTopMerchantsList(userId, year, month),
      getPaymentMethodBreakdown(userId, year, month),
      getAverageDailySpending(userId, year, month),
      getMonthlySpending(userId, year, month),
      getMonthlyIncomeTotal(userId, year, month),
    ]);

  return NextResponse.json({
    categoryBreakdown,
    timeline,
    topMerchants,
    paymentMethods,
    averageDaily,
    totalSpending: spending.total,
    totalIncome: income,
  });
}
