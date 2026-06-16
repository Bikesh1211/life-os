import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { computeWellnessScores } from "@/modules/wellness";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const scores = await computeWellnessScores(userId);
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: "Failed to compute wellness scores" }, { status: 500 });
  }
}
