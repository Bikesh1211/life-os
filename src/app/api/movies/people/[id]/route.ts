import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";
import { getPersonByTmdbId } from "@/modules/movies/repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const local = await getPersonByTmdbId(id);
  return NextResponse.json(local ? { ...local, imageUrl: local.profilePath ? `${TMDB_IMAGE_BASE_URL}/w185${local.profilePath}` : null } : null);
}
