import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCompletionTrends, analyticsFilterSchema } from "@/modules/habits";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const params = analyticsFilterSchema.parse({
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      period: searchParams.get("period"),
    });
    const data = await getCompletionTrends(userId, params);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
