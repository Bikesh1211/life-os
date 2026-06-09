import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
  createFavoriteSchema,
  syncTrackFromSpotify,
  syncAlbumFromSpotify,
  syncArtistFromSpotify,
} from "@/modules/music";

const spotifyFavoriteSchema = z.object({
  spotifyId: z.string().min(1),
  entityType: z.enum(["track", "album", "artist"]),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const favorites = await getFavorites(userId);
    return NextResponse.json(favorites);
  } catch {
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // Spotify ID flow: sync entity, get local UUID, then favorite
    if (body.spotifyId) {
      const { spotifyId, entityType } = spotifyFavoriteSchema.parse(body);

      // iTunes IDs: store directly without sync
      if (spotifyId.startsWith("itunes-")) {
        const favorites = await addFavorite(userId, { entityType, entityId: spotifyId });
        return NextResponse.json(favorites, { status: 201 });
      }

      let entityId: string;

      switch (entityType) {
        case "track": {
          const track = await syncTrackFromSpotify(spotifyId);
          entityId = track.id;
          break;
        }
        case "album": {
          const album = await syncAlbumFromSpotify(spotifyId);
          entityId = album.id;
          break;
        }
        case "artist": {
          const artist = await syncArtistFromSpotify(spotifyId);
          entityId = artist.id;
          break;
        }
      }

      const favorites = await addFavorite(userId, { entityType, entityId });
      return NextResponse.json(favorites, { status: 201 });
    }

    // Local UUID flow (backward compat)
    const parsed = createFavoriteSchema.parse(body);
    const favorites = await addFavorite(userId, parsed);
    return NextResponse.json(favorites, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    if (!entityType || !entityId) {
      return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
    }
    await removeFavorite(userId, entityType, entityId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
