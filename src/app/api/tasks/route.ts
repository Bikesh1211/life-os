import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createTaskEntry, getTasks } from "@/modules/tasks";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};

    const status = searchParams.get("status");
    if (status) filters.status = status;

    const priority = searchParams.get("priority");
    if (priority) filters.priority = priority;

    const projectId = searchParams.get("projectId");
    if (projectId && projectId !== "null") filters.projectId = projectId;

    const noProject = searchParams.get("noProject");
    if (noProject) filters.noProject = noProject;

    const parentId = searchParams.get("parentId");
    if (parentId === "null") {
      filters.parentId = null;
    } else if (parentId) {
      filters.parentId = parentId;
    }

    const dueDateFrom = searchParams.get("dueDateFrom");
    if (dueDateFrom) filters.dueDateFrom = dueDateFrom;

    const dueDateTo = searchParams.get("dueDateTo");
    if (dueDateTo) filters.dueDateTo = dueDateTo;

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const labelIds = searchParams.get("labelIds");
    if (labelIds) filters.labelIds = labelIds.split(",");

    const sortBy = searchParams.get("sortBy");
    if (sortBy) filters.sortBy = sortBy;

    const sortOrder = searchParams.get("sortOrder");
    if (sortOrder) filters.sortOrder = sortOrder;

    const limit = searchParams.get("limit");
    if (limit) filters.limit = Number(limit);

    const offset = searchParams.get("offset");
    if (offset) filters.offset = Number(offset);

    const entries = await getTasks(userId, filters as any);
    return NextResponse.json(entries);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const entry = await createTaskEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
