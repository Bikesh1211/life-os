import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSetup, updateSetup, deleteSetup } from "@/modules/tech-gear/service/index";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const setup = await getSetup(userId, id);
    return NextResponse.json(setup);
  } catch (error: any) {
    if (error.message === "Setup not found") return NextResponse.json({ error: "Setup not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to fetch setup" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const setup = await updateSetup(userId, id, body);
    return NextResponse.json(setup);
  } catch (error: any) {
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
    if (error.message === "Setup not found") return NextResponse.json({ error: "Setup not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update setup" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    await deleteSetup(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Setup not found") return NextResponse.json({ error: "Setup not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete setup" }, { status: 500 });
  }
}
