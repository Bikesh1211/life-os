import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getTimeline } from "@/modules/curb";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const timeline = await getTimeline(userId, date);
    return NextResponse.json(timeline);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}
