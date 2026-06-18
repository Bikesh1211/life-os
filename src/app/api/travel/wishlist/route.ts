import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const items = await travelService.getWishlist(userId);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const item = await travelService.createWishlist(userId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create wishlist item" }, { status: 500 });
  }
}
