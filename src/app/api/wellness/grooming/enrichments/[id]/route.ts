import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { deleteHabitEnrichment } from "@/modules/wellness";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const deleted = await deleteHabitEnrichment(id, userId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
