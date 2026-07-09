import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGroomingActivities, updateGroomingEnrichmentSchema, updateHabitEnrichment } from "@/modules/wellness";
import { getHabitEnrichment } from "@/modules/wellness/repository";

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { enrichmentId, ...rest } = body;
    const parsed = updateGroomingEnrichmentSchema.parse(rest);
    const enrichment = await updateHabitEnrichment(enrichmentId, userId, parsed);
    if (!enrichment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrichment);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
