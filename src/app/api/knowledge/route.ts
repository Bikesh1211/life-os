import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createKnowledgeEntry,
  getKnowledgeEntries,
  searchKnowledge,
  createEntrySchema,
  searchSchema,
} from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const hasSearchParams = searchParams.toString().length > 0;

    if (hasSearchParams) {
      const parsed = searchSchema.parse({
        query: searchParams.get("query") || undefined,
        subject: searchParams.get("subject") || undefined,
        tags: searchParams.get("tags")?.split(",").filter(Boolean) || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
        masteryMin: searchParams.get("masteryMin") ? Number(searchParams.get("masteryMin")) : undefined,
        masteryMax: searchParams.get("masteryMax") ? Number(searchParams.get("masteryMax")) : undefined,
        learningSource: searchParams.get("learningSource") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
      });
      const entries = await searchKnowledge(userId, parsed);
      return NextResponse.json(entries);
    }

    const entries = await getKnowledgeEntries(userId);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createEntrySchema.parse(body);
    const entry = await createKnowledgeEntry(userId, parsed);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}
