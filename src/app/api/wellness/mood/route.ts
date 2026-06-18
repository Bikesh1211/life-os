import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createMoodLog, getMoodLogs } from "@/modules/wellness";

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
    const logs = await getMoodLogs(userId, filters);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mood logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const log = await createMoodLog(userId, body);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create mood log" }, { status: 500 });
  }
}
