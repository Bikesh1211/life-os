import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAnalytics } from "@/modules/goals";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const analytics = await getAnalytics(userId);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals analytics" }, { status: 500 });
  }
}
