import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createGift, getGifts, getGiftsByConnection } from "@/modules/network";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    if (connectionId) {
      const data = await getGiftsByConnection(connectionId, userId);
      return NextResponse.json(data);
    }

    const data = await getGifts(userId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gifts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await createGift(userId, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}
