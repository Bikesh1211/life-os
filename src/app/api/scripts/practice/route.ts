import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getRecentPracticeSessions } from "@/modules/scripts/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await getRecentPracticeSessions(userId, 50);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch practice sessions" }, { status: 500 });
  }
}
