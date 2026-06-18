import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { toggleFavorite } from "@/modules/movies/service";
import * as repo from "@/modules/movies/repository";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await repo.getFavorites(userId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { mediaId } = await request.json();
  const result = await toggleFavorite(userId, mediaId);
  return NextResponse.json(result);
}
