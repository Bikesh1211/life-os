import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { updateRating, deleteRating, updateRatingSchema } from "@/modules/music";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRatingSchema.parse(body);
    const rating = await updateRating(id, userId, parsed);
    if (!rating) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rating);
  } catch {
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteRating(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 });
  }
}
