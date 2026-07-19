import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { computeRoute, osrmRouteRequestSchema } from "@/modules/travel-helper";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const params = osrmRouteRequestSchema.parse(body);
    const result = await computeRoute(params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message.startsWith("OSRM")) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Failed to compute route" }, { status: 500 });
  }
}
