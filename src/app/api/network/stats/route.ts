import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats } from "@/modules/network";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getDashboardStats(userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
