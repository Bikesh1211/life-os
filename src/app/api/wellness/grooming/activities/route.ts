import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGroomingActivities } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const activities = await getGroomingActivities(userId);
    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
