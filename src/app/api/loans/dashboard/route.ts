import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getLoansDashboard } from "@/modules/loans/service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

    const dashboard = await getLoansDashboard(userId);
    return NextResponse.json(dashboard);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}
