import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getReviewQueue, markAsReviewed, markAsMastered } from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await getReviewQueue(userId);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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
    const { entryId, action, masteryLevel } = body;

    if (!entryId || !action) {
      return NextResponse.json(
        { error: "entryId and action are required" },
        { status: 400 },
      );
    }

    let result;
    if (action === "reviewed") {
      result = await markAsReviewed(entryId, userId, masteryLevel);
    } else if (action === "mastered") {
      result = await markAsMastered(entryId, userId);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'reviewed' or 'mastered'" },
        { status: 400 },
      );
    }

    if (!result) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 },
    );
  }
}
