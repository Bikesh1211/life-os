import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDashboardStats } from "@/modules/tech-gear/service/index";

export async function GET() {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const stats = await getDashboardStats(userId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
