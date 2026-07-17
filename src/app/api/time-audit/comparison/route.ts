import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getComparison } from "@/modules/time-audit";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const comparison = await getComparison(userId);
    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comparison" }, { status: 500 });
  }
}
