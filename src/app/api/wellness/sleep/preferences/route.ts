import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSleepGoal, upsertSleepGoal } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goal = await getSleepGoal(userId);
    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sleep goal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const goal = await upsertSleepGoal(userId, body.sleepGoalHours);
    return NextResponse.json(goal);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update sleep goal" }, { status: 500 });
  }
}
