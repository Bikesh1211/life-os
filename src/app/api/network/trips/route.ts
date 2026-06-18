import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { addTripParticipant, removeTripParticipant } from "@/modules/network";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await addTripParticipant(userId, body.connectionId, body.tripId);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add trip participant" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");
    const tripId = searchParams.get("tripId");

    if (!connectionId || !tripId) {
      return NextResponse.json({ error: "connectionId and tripId are required" }, { status: 400 });
    }

    await removeTripParticipant(connectionId, tripId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove trip participant" }, { status: 500 });
  }
}
