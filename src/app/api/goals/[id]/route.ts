import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoalById, updateGoal, deleteGoal, updateGoalSchema } from "@/modules/goals";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const goal = await getGoalById(userId, id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    return NextResponse.json(goal);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateGoalSchema.parse(body);
    const goal = await updateGoal(userId, id, parsed);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    return NextResponse.json(goal);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const goal = await deleteGoal(userId, id);
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
