import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getLoanEvents } from "@/modules/loans/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const events = await getLoanEvents(id);
    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
  }
}
