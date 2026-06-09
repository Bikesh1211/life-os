import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createRating, getRatings, createRatingSchema } from "@/modules/music";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType") ?? undefined;
    const ratings = await getRatings(userId, entityType);
    return NextResponse.json(ratings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createRatingSchema.parse(body);
    const rating = await createRating(userId, parsed);
    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 });
  }
}
