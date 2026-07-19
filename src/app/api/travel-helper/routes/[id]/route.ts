import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getRouteById, updateRoute, deleteRoute } from "@/modules/travel-helper";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const route = await getRouteById(id, userId);
    if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const route = await updateRoute(id, userId, body);
    if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const route = await deleteRoute(id, userId);
    if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 });
  }
}
