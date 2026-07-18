import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats, getPRs } from "@/modules/fitness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const includePRs = searchParams.get("includePRs") === "true";

    const stats = await getDashboardStats(userId);
    const result: Record<string, unknown> = { ...stats };

    if (includePRs) {
      result.personalRecords = await getPRs(userId);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
