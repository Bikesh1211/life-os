import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGroomingDashboardStats, getGroomingScore } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, groomingScore] = await Promise.all([
      getGroomingDashboardStats(userId),
      getGroomingScore(userId),
    ]);

    return NextResponse.json({ ...stats, groomingScore });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
