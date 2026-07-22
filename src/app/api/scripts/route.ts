import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getScripts, createNewScript, createScriptSchema } from "@/modules/scripts";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};
    for (const key of ["status", "search", "sortBy", "sortOrder", "priority", "difficulty", "categoryId"] as const) {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    }

    const view = searchParams.get("view");
    if (view === "trash") filters.includeTrashed = true;
    else if (view === "favorites") filters.isFavorite = true;
    else if (view === "drafts") filters.status = "draft";
    else if (view === "practicing") filters.status = "practicing";
    else if (view === "ready") filters.status = "ready";
    else if (view === "archived") filters.status = "archived";

    const tags = searchParams.get("tags");
    if (tags) filters.tags = tags.split(",");
    const limit = searchParams.get("limit");
    if (limit) filters.limit = parseInt(limit, 10);
    const offset = searchParams.get("offset");
    if (offset) filters.offset = parseInt(offset, 10);

    const items = await getScripts(userId, filters);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch scripts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createScriptSchema.parse(body);
    const script = await createNewScript(userId, parsed);
    return NextResponse.json(script, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create script";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
