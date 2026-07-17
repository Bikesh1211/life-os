import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { incrementLog, undoLastLog, decrementLastLog } from "@/modules/curb";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const log = await incrementLog(userId, body);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to log increment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") ?? "undo";
    const habitId = searchParams.get("habitId");
    if (!habitId) return NextResponse.json({ error: "habitId is required" }, { status: 400 });

    if (mode === "undo") {
      const log = await undoLastLog(habitId, userId);
      if (!log) return NextResponse.json({ error: "Nothing to undo or undo window expired" }, { status: 404 });
      return NextResponse.json({ success: true, log });
    }

    const log = await decrementLastLog(habitId, userId);
    if (!log) return NextResponse.json({ error: "Nothing to decrement" }, { status: 404 });
    return NextResponse.json({ success: true, log });
  } catch (error) {
    return NextResponse.json({ error: "Failed to undo log" }, { status: 500 });
  }
}
