import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGroomingDashboardStats, computeWellnessScores } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [stats, scores] = await Promise.all([
      getGroomingDashboardStats(userId),
      computeWellnessScores(userId),
    ]);

    return NextResponse.json({ ...stats, groomingScore: scores.grooming });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
