import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSession, saveWorkoutSession, removeWorkoutSession, completeWorkoutSession, getSetsForSession, getSessionVolume } from "@/modules/fitness";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const session = await getSession(id, userId);
    if (!session) return NextResponse.json({ error: "Workout not found" }, { status: 404 });

    const [sets, volume] = await Promise.all([
      getSetsForSession(id),
      getSessionVolume(id),
    ]);

    return NextResponse.json({ ...session, sets, volume });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workout" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    let result;
    if (body._action === "complete") {
      result = await completeWorkoutSession(id, userId);
    } else {
      result = await saveWorkoutSession(id, userId, body);
    }

    if (!result) return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update workout" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const result = await removeWorkoutSession(id, userId);
    if (!result) return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}
