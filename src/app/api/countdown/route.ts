import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCountdownEvents, createCountdownEvent, createEventSchema } from "@/modules/countdown";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const events = await getCountdownEvents(userId, status, limit);
    return NextResponse.json(events);
  } catch (error) {
    console.error("[countdown:get]", error);
    return NextResponse.json({ error: "Failed to fetch countdowns", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createEventSchema.parse(body);
    const event = await createCountdownEvent(userId, parsed);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    console.error("[countdown:post]", error);
    return NextResponse.json({ error: "Failed to create countdown", details: String(error) }, { status: 500 });
  }
}
