import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardMetrics, getTimeDistribution, getWeeklyTrend, getComparison, getWeeklySummary } from "@/modules/time-audit";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "week";

    const [metrics, distribution, trend, comparison, summary] = await Promise.all([
      getDashboardMetrics(userId, period),
      getTimeDistribution(userId, period),
      getWeeklyTrend(userId),
      getComparison(userId),
      getWeeklySummary(userId),
    ]);

    return NextResponse.json({
      metrics,
      distribution,
      trend,
      comparison,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
