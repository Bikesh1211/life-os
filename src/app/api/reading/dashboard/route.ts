import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReadingDashboard } from "@/modules/reading";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dashboard = await getReadingDashboard(userId);
    return NextResponse.json(dashboard);
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
