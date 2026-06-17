import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { evaluateSmartFilter } from "@/modules/music";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const items = await evaluateSmartFilter(userId, body);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to evaluate smart filter" }, { status: 500 });
  }
}
