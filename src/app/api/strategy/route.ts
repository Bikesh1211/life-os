import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getStrategy } from "@/modules/strategy";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sections = await getStrategy(userId);
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch operating manual" }, { status: 500 });
  }
}
