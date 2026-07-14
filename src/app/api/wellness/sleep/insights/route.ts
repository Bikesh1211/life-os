import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSleepInsights } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await getSleepInsights(userId);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("[DEBUG-i1] getSleepInsights error:", error);
    return NextResponse.json({ error: "Failed to fetch sleep insights" }, { status: 500 });
  }
}
