import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats } from "@/modules/wardrobe/service/index";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const stats = await getDashboardStats(userId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching wardrobe dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
