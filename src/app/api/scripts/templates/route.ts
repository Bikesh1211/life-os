import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getStructureTemplates } from "@/modules/scripts";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const items = await getStructureTemplates(categoryId);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
