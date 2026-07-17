import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getProductivityStats } from "@/modules/time-audit";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getProductivityStats(userId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
