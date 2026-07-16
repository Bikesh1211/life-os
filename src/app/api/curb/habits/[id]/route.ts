import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getHabitById, updateHabit, archiveHabit, unarchiveHabit, deleteHabit } from "@/modules/curb";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const habit = await getHabitById(id, userId);
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch habit" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (body.isArchived === true) {
      const habit = await archiveHabit(id, userId);
      if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(habit);
    }
    if (body.isArchived === false) {
      const habit = await unarchiveHabit(id, userId);
      if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(habit);
    }
    const habit = await updateHabit(id, userId, body);
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(habit);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const habit = await deleteHabit(id, userId);
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
