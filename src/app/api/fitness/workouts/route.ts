import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSessions, startWorkoutSession } from "@/modules/fitness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const sessions = await getSessions(userId, { dateFrom, dateTo, limit });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const session = await startWorkoutSession(userId, body.date, body.programDayId ?? null);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to start workout" }, { status: 500 });
  }
}
