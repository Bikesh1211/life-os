import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { logCompletion } from "@/modules/habits";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { habitId, note } = body;
    if (!habitId) {
      return NextResponse.json({ error: "habitId is required" }, { status: 400 });
    }
    const completedDate = body.completedDate ?? new Date().toISOString().split("T")[0];
    const completion = await logCompletion(userId, habitId, completedDate, note);
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log habit" }, { status: 500 });
  }
}
