import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProfile } from "@/modules/gamification";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await getProfile(userId);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[DEBUG-gp] Profile error:", error instanceof Error ? error.message : error, error instanceof Error ? error.stack : "");
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
