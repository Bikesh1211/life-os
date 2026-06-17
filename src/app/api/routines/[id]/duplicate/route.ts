import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { duplicateRoutine } from "@/modules/routines";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const routine = await duplicateRoutine(id, userId);
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to duplicate routine" }, { status: 500 });
  }
}
