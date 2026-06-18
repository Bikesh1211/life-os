import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createBloodPressureEntry, getBloodPressureEntries } from "@/modules/wellness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      period: (searchParams.get("period") ?? undefined) as "week" | "month" | "quarter" | "year" | undefined,
    };
    const entries = await getBloodPressureEntries(userId, filters);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blood pressure entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const entry = await createBloodPressureEntry(userId, body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create blood pressure entry" }, { status: 500 });
  }
}
