import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAnalytics, analyticsFilterSchema } from "@/modules/routines";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get("routineId");
    const params = analyticsFilterSchema.parse({
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
    });

    if (routineId) {
      const { getRoutineAnalytics } = await import("@/modules/routines");
      const data = await getRoutineAnalytics(routineId, userId, params);
      return NextResponse.json(data);
    }

    const data = await getAnalytics(userId, params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
