const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "LifeOS/0.1.0 (bikesh@example.com)";
const RATE_LIMIT_MS = 1000;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`MusicBrainz API error: ${res.status}`);
    lastRequestTime = Date.now();
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

type MusicBrainzArtist = {
  id: string;
  name: string;
  country?: string;
  type?: "Person" | "Group" | "Orchestra" | "Choir" | "Character" | string;
  "release-groups"?: MusicBrainzReleaseGroup[];
  tags?: { name: string; count: number }[];
};

type MusicBrainzReleaseGroup = {
  id: string;
  title: string;
  "primary-type"?: string;
  "first-release-date"?: string;
  "cover-art-archive"?: { artwork: boolean; front: boolean; back: boolean };
};

type MusicBrainzRecording = {
  id: string;
  title: string;
  length?: number;
  "artist-credit"?: { name: string; artist: { id: string } }[];
};

type MusicBrainzRelease = {
  id: string;
  title: string;
  date?: string;
  country?: string;
  status?: string;
  "release-events"?: { date: string }[];
};

export type SearchResult<T> = {
  count: number;
  results: { score: number; entity: T }[];
};

export async function searchArtists(query: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/artist/?query=artist:${encodeURIComponent(query)}&fmt=json&limit=20`,
  );
  return data as SearchResult<MusicBrainzArtist>;
}

export async function searchAlbums(query: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/release-group/?query=release:${encodeURIComponent(query)}&fmt=json&limit=20`,
  );
  return data as SearchResult<MusicBrainzReleaseGroup>;
}

export async function searchTracks(query: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/recording/?query=recording:${encodeURIComponent(query)}&fmt=json&limit=20`,
  );
  return data as SearchResult<MusicBrainzRecording>;
}

export async function searchReleases(query: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/release/?query=release:${encodeURIComponent(query)}&fmt=json&limit=20`,
  );
  return data as SearchResult<MusicBrainzRelease>;
}

export async function lookupArtist(mbid: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/artist/${mbid}?fmt=json&inc=release-groups+tags`,
  );
  return data as MusicBrainzArtist;
}

export async function lookupAlbum(mbid: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/release-group/${mbid}?fmt=json`,
  );
  return data as MusicBrainzReleaseGroup;
}

export async function lookupTrack(mbid: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/recording/${mbid}?fmt=json`,
  );
  return data as MusicBrainzRecording;
}

export async function getArtistAlbums(artistMbid: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/release-group?artist=${artistMbid}&fmt=json&limit=50`,
  );
  return data as SearchResult<MusicBrainzReleaseGroup>;
}

export async function getAlbumTracks(releaseGroupMbid: string) {
  const data = await rateLimitedFetch(
    `${MUSICBRAINZ_BASE}/release?release-group=${releaseGroupMbid}&fmt=json&inc=recordings`,
  );
  return data as SearchResult<MusicBrainzRelease>;
}

export function parseGenres(tags: { name: string; count: number }[] | undefined): string[] {
  if (!tags) return [];
  return tags
    .filter((t) => ["rock", "pop", "jazz", "electronic", "hip hop", "classical", "r&b", "folk", "metal", "blues", "country", "indie", "soul", "punk", "reggae", "funk", "ambient", "alternative", "experimental", "world", "latin", "dance"].includes(t.name.toLowerCase()))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((t) => t.name.toLowerCase());
}
