import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getOutfit, updateOutfit, deleteOutfit } from "@/modules/wardrobe/service/index";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const outfit = await getOutfit(userId, id);
    return NextResponse.json(outfit);
  } catch (error: any) {
    if (error.message === "Outfit not found") {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch outfit" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const outfit = await updateOutfit(userId, id, body);
    return NextResponse.json(outfit);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.message === "Outfit not found") {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update outfit" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    await deleteOutfit(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Outfit not found") {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete outfit" }, { status: 500 });
  }
}
