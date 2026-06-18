import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getTaskStats } from "@/modules/tasks";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getTaskStats(userId);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task summary" }, { status: 500 });
  }
}
