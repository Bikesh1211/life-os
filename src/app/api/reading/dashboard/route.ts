import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getReadingDashboard } from "@/modules/reading";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dashboard = await getReadingDashboard(userId);
    return NextResponse.json(dashboard);
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
