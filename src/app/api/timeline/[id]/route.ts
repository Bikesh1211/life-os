import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateTimelineEvent,
  deleteTimelineEvent,
  getTimelineEvent,
  updateEventSchema,
} from "@/modules/timeline";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string) {
  return UUID_RE.test(id);
}

type Params = { params: Promise<{ id: string }> };

function validateId(id: string) {
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }
  return null;
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invalid = validateId(id);
  if (invalid) return invalid;

  const event = await getTimelineEvent(id, userId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const invalid = validateId(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = updateEventSchema.parse(body);
    const event = await updateTimelineEvent(id, userId, parsed);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const invalid = validateId(id);
    if (invalid) return invalid;

    const event = await deleteTimelineEvent(id, userId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
