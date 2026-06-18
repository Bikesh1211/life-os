import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const photos = await travelService.getPhotos(userId);
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const photo = await travelService.createPhoto(userId, body);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
  }
}
