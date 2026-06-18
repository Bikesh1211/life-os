import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getXpHistory } from "@/modules/gamification";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const history = await getXpHistory(userId, limit);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
