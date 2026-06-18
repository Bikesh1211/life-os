import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  getRoutine,
  updateRoutineForUser,
  deleteRoutineForUser,
} from "@/modules/routines";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const routine = await getRoutine(id, userId);
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json(routine);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const routine = await updateRoutineForUser(id, userId, body);
    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json(routine);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const deleted = await deleteRoutineForUser(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}
