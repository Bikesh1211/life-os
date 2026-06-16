import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateTaskLabel, deleteTaskLabel } from "@/modules/tasks";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const label = await updateTaskLabel(id, userId, body);
    if (!label) return NextResponse.json({ error: "Label not found" }, { status: 404 });
    return NextResponse.json(label);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update label" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const label = await deleteTaskLabel(id, userId);
    if (!label) return NextResponse.json({ error: "Label not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete label" }, { status: 500 });
  }
}
