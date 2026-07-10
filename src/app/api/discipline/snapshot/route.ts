import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { computeDailySnapshot } from "@/modules/integrity";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snapshot = await computeDailySnapshot(userId);
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({ error: "Failed to compute snapshot" }, { status: 500 });
  }
}
