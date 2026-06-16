import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNoteEntry, getNotes } from "@/modules/notes";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      status: searchParams.get("status") ?? undefined,
      includeArchived: searchParams.get("includeArchived") ?? undefined,
      isPinned: searchParams.get("isPinned") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      folderId: searchParams.get("folderId") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };

    const entries = await getNotes(userId, filters as any);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entry = await createNoteEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
