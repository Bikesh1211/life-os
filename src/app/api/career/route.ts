import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats } from "@/modules/career";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getDashboardStats(userId);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
