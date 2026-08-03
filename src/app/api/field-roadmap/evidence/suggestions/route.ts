import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { findEvidenceSuggestions } from "@/modules/field-roadmap";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const skillId = searchParams.get("skillId");
  const roadmapId = searchParams.get("roadmapId");
  if (!skillId || !roadmapId) {
    return NextResponse.json({ error: "skillId and roadmapId required" }, { status: 400 });
  }

  try {
    const suggestions = await findEvidenceSuggestions(userId, skillId, roadmapId);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "Failed to find suggestions" }, { status: 500 });
  }
}