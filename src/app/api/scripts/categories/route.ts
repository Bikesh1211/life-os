import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCategories, addCategory, createCategorySchema } from "@/modules/scripts";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await getCategories(userId);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createCategorySchema.parse(body);
    const item = await addCategory(userId, parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
