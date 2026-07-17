import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardMetrics, getTimeDistribution } from "@/modules/time-audit";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "week";

    const [metrics, distribution] = await Promise.all([
      getDashboardMetrics(userId, period),
      getTimeDistribution(userId, period),
    ]);

    return NextResponse.json({
      metrics,
      distribution,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
