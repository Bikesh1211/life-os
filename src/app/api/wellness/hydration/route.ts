import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createHydrationEntry, getHydrationEntries, getHydrationDailyTotal } from "@/modules/wellness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (date) {
      const total = await getHydrationDailyTotal(userId, date);
      return NextResponse.json({ date, totalMl: total });
    }
    const filters = {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    };
    const entries = await getHydrationEntries(userId, filters);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hydration entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const entry = await createHydrationEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create hydration entry" }, { status: 500 });
  }
}
