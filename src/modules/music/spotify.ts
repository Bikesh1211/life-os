const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

const SPOTIFY_TIMEOUT = 3000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = SPOTIFY_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getClientToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set");
  }

  const res = await fetchWithTimeout(SPOTIFY_ACCOUNTS, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Spotify auth error: ${res.status} ${body.slice(0, 100)}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000,
  };

  return cachedToken.accessToken;
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getClientToken();
  const res = await fetchWithTimeout(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Spotify API error: ${res.status} ${body.slice(0, 100)}`);
  }
  return res.json();
}

// ─── Search ───────────────────────────────────────────────────────

type SpotifyArtist = {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
};

type SpotifyAlbum = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: { url: string; height: number; width: number }[];
  release_date: string;
  total_tracks: number;
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: { id: string; name: string; images: { url: string }[] };
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  track_number: number;
};

type SearchResponse = {
  tracks?: { items: SpotifyTrack[] };
  artists?: { items: SpotifyArtist[] };
  albums?: { items: SpotifyAlbum[] };
};

function pickImage(images: { url: string }[] | undefined): string | null {
  if (!images || images.length === 0) return null;
  return images[0]?.url ?? null;
}

export async function searchSpotify(query: string, type: "artist" | "album" | "track") {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=${type}&limit=10`,
  );

  switch (type) {
    case "artist":
      return (data.artists?.items ?? []).map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: a.genres.slice(0, 2).join(", ") || null,
        imageUrl: pickImage(a.images),
        type: "artist" as const,
        popularity: a.popularity,
      }));

    case "album":
      return (data.albums?.items ?? []).map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: a.artists.map((ar) => ar.name).join(", "),
        imageUrl: pickImage(a.images),
        type: "album" as const,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
      }));

    case "track":
      return (data.tracks?.items ?? []).map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: t.artists.map((a) => a.name).join(", "),
        imageUrl: pickImage(t.album?.images),
        type: "track" as const,
        albumName: t.album?.name,
        duration: Math.round(t.duration_ms / 1000),
        popularity: t.popularity,
        explicit: t.explicit,
      }));
  }
}

// ─── New Releases (for explore/trending) ──────────────────────────

type NewReleasesResponse = {
  albums: { items: SpotifyAlbum[] };
};

export async function getNewReleases(limit = 12) {
  const data = await spotifyFetch<NewReleasesResponse>(
    `/browse/new-releases?limit=${limit}`,
  );

  return (data.albums?.items ?? []).map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: a.artists.map((ar) => ar.name).join(", "),
    imageUrl: pickImage(a.images),
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
  }));
}

// ─── Trending / Featured Playlists ────────────────────────────────

type PlaylistsResponse = {
  playlists: { items: SpotifyPlaylist[] };
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
};

export async function getFeaturedPlaylists(limit = 10) {
  const data = await spotifyFetch<PlaylistsResponse>(
    `/browse/featured-playlists?limit=${limit}`,
  );

  return (data.playlists?.items ?? []).map((p) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    imageUrl: pickImage(p.images),
    trackCount: p.tracks?.total ?? 0,
  }));
}

// ─── Artist / Album / Track detail ────────────────────────────────

export async function getArtist(id: string) {
  const data = await spotifyFetch<SpotifyArtist & { popularity: number; images: { url: string }[] }>(
    `/artists/${id}`,
  );
  return {
    id: data.id,
    name: data.name,
    imageUrl: pickImage(data.images),
    genres: data.genres ?? [],
    popularity: data.popularity ?? 0,
  };
}

export async function getAlbum(id: string) {
  type AlbumResponse = SpotifyAlbum & {
    label: string;
    popularity: number;
    tracks: { items: SpotifyTrack[] };
  };
  const data = await spotifyFetch<AlbumResponse>(`/albums/${id}`);

  return {
    id: data.id,
    title: data.name,
    artistName: data.artists.map((a) => a.name).join(", "),
    artistId: data.artists[0]?.id,
    imageUrl: pickImage(data.images),
    releaseDate: data.release_date,
    totalTracks: data.total_tracks,
    label: data.label,
    popularity: data.popularity,
    tracks: (data.tracks?.items ?? []).map((t) => ({
      id: t.id,
      title: t.name,
      duration: Math.round(t.duration_ms / 1000),
      trackNumber: t.track_number,
      popularity: t.popularity,
      explicit: t.explicit,
    })),
  };
}

export async function getTrack(id: string) {
  const data = await spotifyFetch<SpotifyTrack & { popularity: number }>(`/tracks/${id}`);

  return {
    id: data.id,
    title: data.name,
    artistName: data.artists.map((a) => a.name).join(", "),
    artistId: data.artists[0]?.id,
    albumName: data.album?.name,
    albumId: data.album?.id,
    imageUrl: pickImage(data.album?.images),
    duration: Math.round(data.duration_ms / 1000),
    popularity: data.popularity,
    explicit: data.explicit,
    trackNumber: data.track_number,
  };
}

// ─── Artist Top Tracks ────────────────────────────────────────────

type TopTracksResponse = {
  tracks: SpotifyTrack[];
};

export async function getArtistTopTracks(artistId: string, market = "US") {
  const data = await spotifyFetch<TopTracksResponse>(
    `/artists/${artistId}/top-tracks?market=${market}`,
  );

  return (data.tracks ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    duration: Math.round(t.duration_ms / 1000),
    trackNumber: t.track_number,
    popularity: t.popularity,
    explicit: t.explicit,
    albumId: t.album?.id ?? null,
    albumName: t.album?.name ?? null,
  }));
}

// ─── Artist Albums ────────────────────────────────────────────────

type ArtistAlbumsResponse = {
  items: SpotifyAlbum[];
};

export async function getArtistAlbums(artistId: string, limit = 10) {
  const data = await spotifyFetch<ArtistAlbumsResponse>(
    `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&market=US`,
  );

  return (data.items ?? []).map((a) => ({
    id: a.id,
    title: a.name,
    artistId: a.artists[0]?.id,
    artistName: a.artists.map((ar) => ar.name).join(", "),
    imageUrl: pickImage(a.images),
    releaseDate: a.release_date,
    totalTracks: a.total_tracks,
  }));
}

// ─── Track Audio Features ─────────────────────────────────────────

export async function getTracksAudioFeatures(trackIds: string[]) {
  if (trackIds.length === 0) return [];
  const ids = trackIds.slice(0, 100).join(",");
  type AudioFeaturesResponse = {
    audio_features: Array<{
      id: string;
      danceability: number;
      energy: number;
      valence: number;
      tempo: number;
      acousticness: number;
      instrumentalness: number;
    } | null>;
  };
  const data = await spotifyFetch<AudioFeaturesResponse>(
    `/audio-features?ids=${ids}`,
  );
  return (data.audio_features ?? []).filter(Boolean);
}

// ─── Recommendations (based on seed genres) ───────────────────────

export async function getRecommendations(seedGenres = "pop,rock,electronic", limit = 10) {
  type RecommendationsResponse = {
    tracks: SpotifyTrack[];
  };

  const data = await spotifyFetch<RecommendationsResponse>(
    `/recommendations?seed_genres=${encodeURIComponent(seedGenres)}&limit=${limit}`,
  );

  return (data.tracks ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: t.artists.map((a) => a.name).join(", "),
    imageUrl: pickImage(t.album?.images),
    type: "track" as const,
    duration: Math.round(t.duration_ms / 1000),
    popularity: t.popularity,
  }));
}
