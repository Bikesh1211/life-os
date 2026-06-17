import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await travelService.getDashboard(userId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
