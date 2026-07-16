import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getAnalytics, analyticsFilterSchema } from "@/modules/curb";

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
    const analytics = await getAnalytics(userId, params);
    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
