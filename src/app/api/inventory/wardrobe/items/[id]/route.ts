import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getClothingItem, updateClothingItem, deleteClothingItem } from "@/modules/wardrobe/service/index";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const item = await getClothingItem(userId, id);
    return NextResponse.json(item);
  } catch (error: any) {
    if (error.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const item = await updateClothingItem(userId, id, body);
    return NextResponse.json(item);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    await deleteClothingItem(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
