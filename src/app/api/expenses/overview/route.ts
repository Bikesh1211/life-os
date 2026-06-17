import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/modules/expenses/service/dashboard";
import { getCategoryBreakdown } from "@/modules/expenses/service/dashboard";
import { getDailySpendingTimeline } from "@/modules/expenses/service/dashboard";
import { getTopMerchantsList } from "@/modules/expenses/service/dashboard";
import { getExpenseCategories } from "@/modules/expenses/service/categories";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

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
