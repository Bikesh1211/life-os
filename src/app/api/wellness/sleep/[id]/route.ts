import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { updateSleepRecord, deleteSleepRecord } from "@/modules/wellness";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const record = await updateSleepRecord(id, userId, body);
    if (!record) return NextResponse.json({ error: "Sleep record not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update sleep record" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const record = await deleteSleepRecord(id, userId);
    if (!record) return NextResponse.json({ error: "Sleep record not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sleep record" }, { status: 500 });
  }
}
