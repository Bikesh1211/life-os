import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { searchAllBooks } from "@/modules/books";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const results = await searchAllBooks(userId, query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
