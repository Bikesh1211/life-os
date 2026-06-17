import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  createReadingItem,
  getReadingItems,
  createItemSchema,
} from "@/modules/reading";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};
    for (const key of ["type", "status", "search", "sortBy", "sortOrder"] as const) {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    }
    const tags = searchParams.get("tags");
    if (tags) filters.tags = tags.split(",");
    if (searchParams.get("favorites") === "true") filters.favorites = true;
    const limit = searchParams.get("limit");
    if (limit) filters.limit = parseInt(limit, 10);
    const offset = searchParams.get("offset");
    if (offset) filters.offset = parseInt(offset, 10);

    const items = await getReadingItems(userId, filters);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createItemSchema.parse(body);
    const item = await createReadingItem(userId, parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
