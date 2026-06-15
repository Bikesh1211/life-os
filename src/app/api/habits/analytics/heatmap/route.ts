import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getHeatmap, analyticsFilterSchema } from "@/modules/habits";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const params = analyticsFilterSchema.parse({
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      period: searchParams.get("period"),
    });
    const data = await getHeatmap(userId, params);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch heatmap" }, { status: 500 });
  }
}
