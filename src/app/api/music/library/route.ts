import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import * as repo from "@/modules/music/repository";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const favorites = await repo.getFavorites(userId);
    const artistIds = favorites.filter((f) => f.entityType === "artist").map((f) => f.entityId);
    const albumIds = favorites.filter((f) => f.entityType === "album").map((f) => f.entityId);

    const albums = await Promise.all(
      albumIds.map(async (id) => {
        const album = await repo.getAlbumById(id);
        if (!album) return null;
        const artist = await repo.getArtistById(album.artistId);
        return {
          id: album.id,
          title: album.title,
          subtitle: artist?.name ?? null,
          imageUrl: album.coverArtUrl,
          type: "album" as const,
        };
      }),
    );

    const artists = await Promise.all(
      artistIds.map(async (id) => {
        const artist = await repo.getArtistById(id);
        if (!artist) return null;
        return {
          id: artist.id,
          title: artist.name,
          subtitle: artist.genres.slice(0, 2).join(", ") || null,
          imageUrl: artist.imageUrl,
          type: "artist" as const,
        };
      }),
    );

    return NextResponse.json({
      albums: albums.filter(Boolean),
      artists: artists.filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }
}
