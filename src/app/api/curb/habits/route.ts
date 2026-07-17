import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getHabits, createHabit } from "@/modules/curb";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const includeArchived = searchParams.get("includeArchived") === "true";
    const habits = await getHabits(userId, { categoryId, includeArchived });
    return NextResponse.json(habits);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const habit = await createHabit(userId, body);
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
