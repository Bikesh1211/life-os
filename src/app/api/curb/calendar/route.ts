import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCalendarData } from "@/modules/curb";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const data = await getCalendarData(userId, year, month);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
