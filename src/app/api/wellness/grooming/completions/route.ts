import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { completeGroomingActivity, completeGroomingSchema } from "@/modules/wellness";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = completeGroomingSchema.parse(body);
    const completion = await completeGroomingActivity(userId, parsed);
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to complete activity" }, { status: 500 });
  }
}
