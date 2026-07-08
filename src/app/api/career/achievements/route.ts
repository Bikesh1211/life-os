import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAchievements, createAchievement, createAchievementSchema } from "@/modules/career";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const achievements = await getAchievements(userId);
    return NextResponse.json(achievements);
  } catch {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createAchievementSchema.parse(body);
    const achievement = await createAchievement(userId, parsed);
    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
  }
}
