import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCountdownEvent, updateCountdownEvent, deleteCountdownEvent, updateEventSchema } from "@/modules/countdown";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const event = await getCountdownEvent(id, userId);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    console.error("[countdown:get:id]", error);
    return NextResponse.json({ error: "Failed to fetch countdown", details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateEventSchema.parse(body);
    const event = await updateCountdownEvent(id, userId, parsed);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    console.error("[countdown:patch]", error);
    return NextResponse.json({ error: "Failed to update countdown", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteCountdownEvent(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[countdown:delete]", error);
    return NextResponse.json({ error: "Failed to delete countdown", details: String(error) }, { status: 500 });
  }
}
