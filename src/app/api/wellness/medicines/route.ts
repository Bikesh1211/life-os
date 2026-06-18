import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createMedicineReminder, getMedicineReminders } from "@/modules/wellness";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reminders = await getMedicineReminders(userId);
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch medicine reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const reminder = await createMedicineReminder(userId, body);
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create medicine reminder" }, { status: 500 });
  }
}
