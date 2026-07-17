import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getActiveTimer, startTimer, stopTimer, pauseTimer, resumeTimer } from "@/modules/time-audit";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const timer = await getActiveTimer(userId);
    return NextResponse.json(timer ?? { timer: null, entry: null, currentElapsedSeconds: 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active timer" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start": {
        const result = await startTimer(userId, body);
        return NextResponse.json(result, { status: 201 });
      }
      case "stop": {
        const entry = await stopTimer(userId);
        if (!entry) return NextResponse.json({ error: "No active timer" }, { status: 404 });
        return NextResponse.json(entry);
      }
      case "pause": {
        const timer = await pauseTimer(userId);
        if (!timer) return NextResponse.json({ error: "No active timer" }, { status: 404 });
        return NextResponse.json(timer);
      }
      case "resume": {
        const timer = await resumeTimer(userId);
        if (!timer) return NextResponse.json({ error: "No paused timer" }, { status: 404 });
        return NextResponse.json(timer);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to process timer action" }, { status: 500 });
  }
}
