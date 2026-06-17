import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAnalytics } from "@/modules/goals";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const analytics = await getAnalytics(userId);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals analytics" }, { status: 500 });
  }
}
