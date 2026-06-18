import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  createTimelineEvent,
  getTimelineEvents,
  createEventSchema,
} from "@/modules/timeline";
import { AppError } from "@/core/errors";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await getTimelineEvents(userId);
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createEventSchema.parse(body);
    const event = await createTimelineEvent(userId, parsed);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
