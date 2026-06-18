import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { updateMedicineReminder, deleteMedicineReminder, getMedicineReminders } from "@/modules/wellness";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const reminders = await getMedicineReminders(userId);
    const reminder = reminders.find((r: any) => r.id === id);
    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reminder);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch medicine reminder" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const reminder = await updateMedicineReminder(id, userId, body);
    return NextResponse.json(reminder);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update medicine reminder" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteMedicineReminder(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete medicine reminder" }, { status: 500 });
  }
}
