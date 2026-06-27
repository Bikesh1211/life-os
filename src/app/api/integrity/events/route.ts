import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getTimeline } from "@/modules/integrity";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const timeline = await getTimeline(userId);
    return NextResponse.json(timeline);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
