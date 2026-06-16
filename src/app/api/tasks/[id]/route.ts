import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTask, updateTaskEntry, deleteTaskEntry, restoreTaskEntry } from "@/modules/tasks";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const entry = await getTask(id, userId);
    if (!entry) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    if (body._action === "restore") {
      const entry = await restoreTaskEntry(id, userId);
      if (!entry) return NextResponse.json({ error: "Task not found" }, { status: 404 });
      return NextResponse.json(entry);
    }

    const entry = await updateTaskEntry(id, userId, body);
    if (!entry) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const entry = await deleteTaskEntry(id, userId);
    if (!entry) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
