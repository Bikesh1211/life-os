import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAchievements } from "@/modules/gamification";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const achievements = await getAchievements(userId);
    return NextResponse.json(achievements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
