const ITUNES_SEARCH = "https://itunes.apple.com/search";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";
const ITUNES_TIMEOUT = 3000;

async function fetchWithTimeout(url: string, timeoutMs = ITUNES_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

type ItunesResult = {
  wrapperType: string;
  artistId: number;
  artistName: string;
  collectionId?: number;
  collectionName?: string;
  trackId?: number;
  trackName?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
  trackCount?: number;
  releaseDate?: string;
};

type ItunesSearchResponse = {
  resultCount: number;
  results: ItunesResult[];
};

function pickImage(artworkUrl100: string | undefined): string | null {
  if (!artworkUrl100) return null;
  return artworkUrl100.replace("100x100bb", "400x400bb");
}

export async function searchItunes(query: string, type: "artist" | "album" | "track") {
  const entity = type === "artist" ? "musicArtist" : type === "album" ? "album" : "song";

  const res = await fetchWithTimeout(
    `${ITUNES_SEARCH}?term=${encodeURIComponent(query)}&entity=${entity}&limit=15`,
  );

  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);

  const data: ItunesSearchResponse = await res.json();

  switch (type) {
    case "artist":
      return data.results
        .filter((r) => r.wrapperType === "artist")
        .map((r) => ({
          id: `itunes-${r.artistId}`,
          title: r.artistName,
          subtitle: r.primaryGenreName ?? null,
          imageUrl: pickImage(r.artworkUrl100),
          type: "artist" as const,
          popularity: null as number | null,
        }));

    case "album":
      return data.results
        .filter((r) => r.wrapperType === "collection")
        .map((r) => ({
          id: `itunes-${r.collectionId}`,
          title: r.collectionName ?? "",
          subtitle: r.artistName,
          imageUrl: pickImage(r.artworkUrl100),
          type: "album" as const,
          releaseDate: r.releaseDate ?? null,
          totalTracks: r.trackCount ?? null,
        }));

    case "track":
      return data.results
        .filter((r) => r.wrapperType === "track")
        .map((r) => ({
          id: `itunes-${r.trackId}`,
          title: r.trackName ?? "",
          subtitle: r.artistName,
          imageUrl: pickImage(r.artworkUrl100),
          type: "track" as const,
          albumName: r.collectionName ?? null,
          duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : null,
          explicit: false,
          popularity: null as number | null,
        }));
  }
}


export async function lookupItunesEntity(id: string) {
  const res = await fetchWithTimeout(`${ITUNES_LOOKUP}?id=${id}`);
  if (!res.ok) throw new Error(`iTunes lookup error: ${res.status}`);

  const data: ItunesSearchResponse = await res.json();
  const item = data.results[0];
  if (!item) throw new Error("Not found");

  return {
    id: `itunes-${id}`,
    title: item.trackName ?? item.collectionName ?? item.artistName ?? "Unknown",
    subtitle: item.artistName,
    imageUrl: pickImage(item.artworkUrl100),
    wrapperType: item.wrapperType,
    artistName: item.artistName,
    collectionName: item.collectionName ?? null,
    trackName: item.trackName ?? null,
    releaseDate: item.releaseDate ?? null,
    primaryGenreName: item.primaryGenreName ?? null,
  };
}

const EXPLORE_QUERIES = ["pop", "rock", "electronic", "hip hop", "rnb", "jazz", "classical", "indie"];

type ItunesAlbumItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "album";
  releaseDate: string | null;
  totalTracks: number | null;
};

export async function getExploreAlbums(limit = 12) {
  const queries = EXPLORE_QUERIES.slice(0, Math.ceil(limit / 3));
  const results = await Promise.allSettled(
    queries.map((q) => searchItunes(q, "album")),
  );

  const albums: ItunesAlbumItem[] = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value as ItunesAlbumItem[] : []));

  return albums.slice(0, limit).map((a) => ({
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    imageUrl: a.imageUrl,
    type: "album" as const,
  }));
}
