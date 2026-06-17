import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBadges } from "@/modules/gamification";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const badges = await getBadges(userId);
    return NextResponse.json(badges);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
