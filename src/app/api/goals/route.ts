import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getGoals, createGoal, createGoalSchema } from "@/modules/goals";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const goals = await getGoals(userId, status, type);
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createGoalSchema.parse(body);
    const goal = await createGoal(userId, parsed);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
