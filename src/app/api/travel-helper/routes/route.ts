import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getRoutes, createRoute } from "@/modules/travel-helper";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const transportMode = searchParams.get("transportMode");
    const filters = {
      search: searchParams.get("search") ?? undefined,
      transportMode: (transportMode && ["driving", "motorcycle", "walking", "cycling"].includes(transportMode)
        ? transportMode
        : undefined) as "driving" | "motorcycle" | "walking" | "cycling" | undefined,
      isFavorite: searchParams.has("isFavorite") ? searchParams.get("isFavorite") === "true" : undefined,
      isArchived: searchParams.has("isArchived") ? searchParams.get("isArchived") === "true" : undefined,
      tag: searchParams.get("tag") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    };
    const routes = await getRoutes(userId, filters);
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const route = await createRoute(userId, body);
    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}
