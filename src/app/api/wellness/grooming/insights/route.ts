import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGroomingInsights } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await getGroomingInsights(userId);
    return NextResponse.json(insights);
  } catch {
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
