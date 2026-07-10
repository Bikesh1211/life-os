import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAnalytics, getExcuseTagDistribution, getTimeline, getInsights } from "@/modules/integrity";
import dayjs from "dayjs";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get("data") ?? "overview";
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;

    switch (dataType) {
      case "overview": {
        const analytics = await getAnalytics(userId);
        return NextResponse.json(analytics);
      }

      case "excuses": {
        const excuses = await getExcuseTagDistribution(userId, dateFrom, dateTo);
        return NextResponse.json(excuses);
      }

      case "timeline": {
        const limit = parseInt(searchParams.get("limit") ?? "50", 10);
        const timeline = await getTimeline(userId, limit);
        return NextResponse.json(timeline);
      }

      case "insights": {
        const insights = await getInsights(userId);
        return NextResponse.json(insights);
      }

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
