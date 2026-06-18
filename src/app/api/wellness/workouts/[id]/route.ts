import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { deleteWorkoutEntry } from "@/modules/wellness";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteWorkoutEntry(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete workout entry" }, { status: 500 });
  }
}
