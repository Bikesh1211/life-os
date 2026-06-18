import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getStreaks } from "@/modules/habits";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getStreaks(userId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch streaks" }, { status: 500 });
  }
}
