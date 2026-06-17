import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { computeWellnessScores } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const scores = await computeWellnessScores(userId);
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: "Failed to compute wellness scores" }, { status: 500 });
  }
}
