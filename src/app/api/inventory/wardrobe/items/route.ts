import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createClothingItem, getClothingItems } from "@/modules/wardrobe/service/index";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || undefined;
    const condition = url.searchParams.get("condition") || undefined;
    const season = url.searchParams.get("season") || undefined;
    const laundryStatus = url.searchParams.get("laundryStatus") || undefined;
    const isFavorite = url.searchParams.get("isFavorite");
    const isArchived = url.searchParams.get("isArchived");
    const search = url.searchParams.get("search") || undefined;
    const sort = url.searchParams.get("sort") || undefined;

    const items = await getClothingItems(userId, {
      category, condition, season, laundryStatus,
      isFavorite: isFavorite === "true" ? true : isFavorite === "false" ? false : undefined,
      isArchived: isArchived === "true" ? true : undefined,
      search, sort,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching wardrobe items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const item = await createClothingItem(userId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating wardrobe item:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create item" }, { status: 500 });
  }
}
