import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { computeInsights } from "@/modules/network";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await computeInsights(userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
