import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { syncUser } from "@/modules/gamification";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await syncUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync gamification data" }, { status: 500 });
  }
}
