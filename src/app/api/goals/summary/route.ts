import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getOverview } from "@/modules/goals";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const overview = await getOverview(userId);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals overview" }, { status: 500 });
  }
}
