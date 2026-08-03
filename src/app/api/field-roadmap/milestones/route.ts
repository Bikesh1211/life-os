import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { toggleMilestone, toggleMilestoneSchema } from "@/modules/field-roadmap";

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { milestoneId, completed } = toggleMilestoneSchema.parse(body);
    const milestone = await toggleMilestone(userId, milestoneId, completed);
    if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    return NextResponse.json(milestone);
  } catch {
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 400 });
  }
}