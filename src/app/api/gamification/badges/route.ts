import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBadges } from "@/modules/gamification";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const badges = await getBadges(userId);
    return NextResponse.json(badges);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
