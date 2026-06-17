import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDayMetrics } from "@/modules/routines";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  try {
    const metrics = await getDayMetrics(userId, date);
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
