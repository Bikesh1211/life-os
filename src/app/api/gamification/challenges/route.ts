import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getChallenges } from "@/modules/gamification";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const challenges = await getChallenges(userId);
    return NextResponse.json(challenges);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}
