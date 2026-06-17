import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { travelService } from "@/modules/travel";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const item = await travelService.getWishlistItem(userId, id);
    if (!item) return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to fetch wishlist item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await travelService.updateWishlist(userId, id, body);
    if (!item) return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update wishlist item" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const item = await travelService.deleteWishlist(userId, id);
    if (!item) return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete wishlist item" }, { status: 500 });
  }
}
