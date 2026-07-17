import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getHabitStats } from "@/modules/curb";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getHabitStats(id, userId);
    if (!stats) return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch habit stats" }, { status: 500 });
  }
}
