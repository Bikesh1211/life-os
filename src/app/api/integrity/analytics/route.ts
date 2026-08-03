import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAnalytics, getInsights } from "@/modules/integrity";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const includeInsights = searchParams.get("insights") === "true";

    const analytics = await getAnalytics(userId);
    if (includeInsights) {
      const insights = await getInsights(userId, analytics);
      return NextResponse.json({ ...analytics, insights });
    }

    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
