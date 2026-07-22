import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getPracticeSessionStats } from "@/modules/scripts/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getPracticeSessionStats(userId);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch practice stats" }, { status: 500 });
  }
}
