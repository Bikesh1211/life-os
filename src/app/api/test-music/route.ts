import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { db } from "@/core/database";
import { musicMemories } from "@/modules/music";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ working: true, userId });
}
