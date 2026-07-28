import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getMilestones, createMilestone, createMilestoneSchema } from "@/modules/goals";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const milestones = await getMilestones(id, userId);
    return NextResponse.json(milestones);
  } catch {
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createMilestoneSchema.parse({ ...body, goalId: id });
    const milestone = await createMilestone(userId, parsed);
    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
