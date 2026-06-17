import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createTechItem, getTechItems } from "@/modules/tech-gear/service/index";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const items = await getTechItems(userId, {
      category: url.searchParams.get("category") || undefined,
      condition: url.searchParams.get("condition") || undefined,
      ownershipStatus: url.searchParams.get("ownershipStatus") || undefined,
      search: url.searchParams.get("search") || undefined,
      sort: url.searchParams.get("sort") || undefined,
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching tech items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const item = await createTechItem(userId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: error.message || "Failed to create item" }, { status: 500 });
  }
}
