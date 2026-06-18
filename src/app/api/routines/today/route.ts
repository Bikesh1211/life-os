import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getTodayRoutines } from "@/modules/routines";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const routines = await getTodayRoutines(userId);
    return NextResponse.json(routines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch today's routines" }, { status: 500 });
  }
}
