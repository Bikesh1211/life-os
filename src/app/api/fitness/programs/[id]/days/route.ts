import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getProgram, addProgramDay } from "@/modules/fitness";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const program = await getProgram(id, userId);
    if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });

    const body = await request.json();
    const day = await addProgramDay(id, body.dayNumber, body.name);
    return NextResponse.json(day, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add program day" }, { status: 500 });
  }
}
