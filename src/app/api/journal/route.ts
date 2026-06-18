import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createJournalEntry, getJournalEntries } from "@/modules/journal";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get("search") ?? undefined,
      mood: searchParams.get("mood") ?? undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      minScore: searchParams.get("minScore") ?? undefined,
      maxScore: searchParams.get("maxScore") ?? undefined,
      sortBy: (searchParams.get("sortBy") ?? undefined) as "createdAt" | "updatedAt" | "title" | undefined,
      sortOrder: (searchParams.get("sortOrder") ?? undefined) as "asc" | "desc" | undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };

    const entries = await getJournalEntries(userId, filters as any);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entry = await createJournalEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
