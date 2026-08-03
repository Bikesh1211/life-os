import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getDashboard } from "@/modules/field-roadmap";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const dashboard = await getDashboard(userId);
    return NextResponse.json(dashboard);
  } catch {
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}