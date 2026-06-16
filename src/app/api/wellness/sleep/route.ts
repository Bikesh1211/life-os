import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSleepRecord, getSleepRecords, updateSleepRecord } from "@/modules/wellness";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      period: (searchParams.get("period") ?? undefined) as "week" | "month" | "quarter" | "year" | undefined,
    };
    const records = await getSleepRecords(userId, filters);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sleep records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const record = await createSleepRecord(userId, body);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create sleep record" }, { status: 500 });
  }
}
