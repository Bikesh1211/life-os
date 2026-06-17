import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateMilestone, deleteMilestone, updateMilestoneSchema } from "@/modules/goals";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { milestoneId } = await params;
    const body = await request.json();
    const parsed = updateMilestoneSchema.parse(body);
    const milestone = await updateMilestone(milestoneId, parsed);
    if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    return NextResponse.json(milestone);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { milestoneId } = await params;
    const milestone = await deleteMilestone(milestoneId);
    if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
