import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { submitFeedback, getUserFeedback } from "@/modules/feedback";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const entries = await getUserFeedback(userId, limit, offset);
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entry = await submitFeedback(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
