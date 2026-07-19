import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getUpcomingRoutes } from "@/modules/travel-helper";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limit = 10;
    const routes = await getUpcomingRoutes(userId, limit);
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch upcoming routes" }, { status: 500 });
  }
}
