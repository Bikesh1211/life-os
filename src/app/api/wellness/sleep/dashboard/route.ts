import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSleepDashboard } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dashboard = await getSleepDashboard(userId);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("[DEBUG-d1] getSleepDashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch sleep dashboard" }, { status: 500 });
  }
}
