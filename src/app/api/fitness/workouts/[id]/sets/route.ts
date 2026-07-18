import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSession, getSetsForSession, logExerciseSets } from "@/modules/fitness";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const session = await getSession(id, userId);
    if (!session) return NextResponse.json({ error: "Workout not found" }, { status: 404 });

    const sets = await getSetsForSession(id);
    return NextResponse.json(sets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const session = await getSession(id, userId);
    if (!session) return NextResponse.json({ error: "Workout not found" }, { status: 404 });

    const body = await request.json();
    const sets = await logExerciseSets(id, body.sets ?? []);
    return NextResponse.json(sets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save sets" }, { status: 500 });
  }
}
