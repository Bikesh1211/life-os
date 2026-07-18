import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getMeasurementHistory, logBodyMeasurement, getLatestMeasurement } from "@/modules/fitness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get("latest") === "true";

    if (latest) {
      const measurement = await getLatestMeasurement(userId);
      return NextResponse.json(measurement);
    }

    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;
    const measurements = await getMeasurementHistory(userId, dateFrom, dateTo);
    return NextResponse.json(measurements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const measurement = await logBodyMeasurement(userId, body);
    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log measurement" }, { status: 500 });
  }
}
