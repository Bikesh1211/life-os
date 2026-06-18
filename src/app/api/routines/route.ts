import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getRoutines, createRoutineForUser } from "@/modules/routines";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const routines = await getRoutines(userId);
    return NextResponse.json(routines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const routine = await createRoutineForUser(userId, body);
    return NextResponse.json(routine, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 });
  }
}
