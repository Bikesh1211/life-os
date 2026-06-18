import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getWellnessInsights } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await getWellnessInsights(userId);
    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
