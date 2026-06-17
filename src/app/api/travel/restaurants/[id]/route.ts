import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { travelService } from "@/modules/travel";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const restaurant = await travelService.updateRestaurant(userId, id, body);
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    return NextResponse.json(restaurant);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const restaurant = await travelService.deleteRestaurant(userId, id);
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 });
  }
}
