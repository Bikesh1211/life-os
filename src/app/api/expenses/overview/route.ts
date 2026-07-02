import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getDashboardSummary, getCategoryBreakdown, getDailySpendingTimeline, getTopMerchantsList } from "@/modules/expenses/service/dashboard";
import { getExpenseCategories } from "@/modules/expenses/service/categories";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  const [summary, categoryBreakdown, timeline, topMerchants, categories] = await Promise.all([
    getDashboardSummary(userId),
    getCategoryBreakdown(userId),
    getDailySpendingTimeline(userId, 365),
    getTopMerchantsList(userId),
    getExpenseCategories(userId),
  ]);

  return NextResponse.json({
    summary,
    categoryBreakdown,
    timeline,
    topMerchants,
    categories,
  });
}
