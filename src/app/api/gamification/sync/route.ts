import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncUser } from "@/modules/gamification";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await syncUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync gamification data" }, { status: 500 });
  }
}
