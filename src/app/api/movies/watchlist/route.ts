import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import * as repo from "@/modules/movies/repository";
import { addToWatchlist } from "@/modules/movies/service";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await repo.getWatchlist(userId));
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { mediaId, status } = await request.json();
  return NextResponse.json(await addToWatchlist(userId, mediaId, status));
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await request.json();
  return NextResponse.json(await repo.updateWatchlistItem(id, userId, data));
}
