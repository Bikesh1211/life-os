import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSleepStatistics } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getSleepStatistics(userId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sleep statistics" }, { status: 500 });
  }
}
