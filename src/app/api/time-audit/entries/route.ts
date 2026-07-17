import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createTimeEntry, getTimeEntries, createEntrySchema } from "@/modules/time-audit";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const entries = await getTimeEntries(userId, {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      projectId: searchParams.get("projectId") ?? undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
    });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const entry = await createTimeEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    if ((error as any)?.code === "OVERLAP") {
      return NextResponse.json(
        { error: "Time overlap", conflicts: (error as any).conflicts },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}
