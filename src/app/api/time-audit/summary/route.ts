import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getWeeklySummary } from "@/modules/time-audit";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getWeeklySummary(userId);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
