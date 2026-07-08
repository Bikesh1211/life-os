import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getProfile, upsertProfile, profileSchema } from "@/modules/career";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await getProfile(userId);
    return NextResponse.json(profile ?? {});
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = profileSchema.parse(body);
    const profile = await upsertProfile(userId, parsed);
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
