"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconSearch, IconX, IconMusic, IconTrendingUp, IconSparkles, IconHeart } from "@tabler/icons-react";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "artist" | "album" | "track";
};

type AlbumItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

type PlaylistItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  trackCount: number;
};

type TrackItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

type SearchResponse = {
  artists: SearchResult[];
  albums: SearchResult[];
  tracks: SearchResult[];
  query: string;
  source: string;
};

type ExploreData = {
  newReleases: AlbumItem[];
  trending: PlaylistItem[];
  recommendations: TrackItem[];
};

function ExploreSection({ title, icon, items, href, renderItem }: {
  title: string;
  icon: React.ReactNode;
  items: { id: string }[];
  href: (id: string) => string;
  renderItem: (item: any) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold text-[var(--mantine-color-text,#c1c2c5)]">{title}</h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="w-40 shrink-0"
          >
            <Link href={href(item.id)}>
              {renderItem(item)}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function MusicHome() {
  const [query, setQuery] = useState("");
  const [favoriting, setFavoriting] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["music-search", query],
    queryFn: async () => {
      if (!query.trim()) return { artists: [], albums: [], tracks: [], query: "", source: "itunes" };
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<SearchResponse>;
    },
    enabled: query.length > 0,
  });

  // Explore
  const { data: exploreData } = useQuery<ExploreData>({
    queryKey: ["music-explore"],
    queryFn: async () => {
      const res = await fetch("/api/music/explore");
      if (!res.ok) throw new Error("Failed to load explore");
      return res.json();
    },
    enabled: !query.trim(),
  });

  const artists = searchData?.artists ?? [];
  const albums = searchData?.albums ?? [];
  const tracks = searchData?.tracks ?? [];
  const hasResults = artists.length > 0 || albums.length > 0 || tracks.length > 0;
  const isSearching = query.length > 0;

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async ({ spotifyId, entityType }: { spotifyId: string; entityType: string }) => {
      const res = await fetch("/api/music/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyId, entityType }),
      });
      if (!res.ok) throw new Error("Failed to favorite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-library"] });
    },
  });

  const handleFavorite = async (spotifyId: string, entityType: string) => {
    setFavoriting((prev) => new Set(prev).add(spotifyId));
    try {
      await favoriteMutation.mutateAsync({ spotifyId, entityType });
    } finally {
      setFavoriting((prev) => {
        const next = new Set(prev);
        next.delete(spotifyId);
        return next;
      });
    }
  };

  const showExplore = !isSearching;
  const newReleases = exploreData?.newReleases ?? [];
  const trending = exploreData?.trending ?? [];
  const recommendations = exploreData?.recommendations ?? [];

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="relative">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mantine-color-dimmed,#5c5f66)]"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, albums, tracks..."
            className="w-full rounded-2xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] py-4 pl-12 pr-12 text-lg text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
            >
              <IconX size={18} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {searchLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            ))}
          </motion.div>
        ) : isSearching && !hasResults ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MusicEmptyState
              title="No results"
              description={`Nothing found for "${query}". Try a different search term.`}
            />
          </motion.div>
        ) : isSearching ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {artists.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">Artists</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {artists.map((result) => (
                    <div key={result.id} className="group relative w-40 shrink-0">
                      <Link href={`/music/artists/${result.id}`}>
                        <MusicCard
                          imageUrl={result.imageUrl}
                          title={result.title}
                          subtitle={result.subtitle}
                          aspectRatio="square"
                        />
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); handleFavorite(result.id, result.type); }}
                        disabled={favoriting.has(result.id)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 disabled:opacity-50"
                      >
                        {favoriting.has(result.id) ? (
                          <span className="h-4 w-4 animate-ping rounded-full bg-pink-500" />
                        ) : (
                          <IconHeart size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {albums.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">Albums</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {albums.map((result) => (
                    <div key={result.id} className="group relative w-40 shrink-0">
                      <Link href={`/music/albums/${result.id}`}>
                        <MusicCard
                          imageUrl={result.imageUrl}
                          title={result.title}
                          subtitle={result.subtitle}
                          aspectRatio="portrait"
                        />
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); handleFavorite(result.id, result.type); }}
                        disabled={favoriting.has(result.id)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 disabled:opacity-50"
                      >
                        {favoriting.has(result.id) ? (
                          <span className="h-4 w-4 animate-ping rounded-full bg-pink-500" />
                        ) : (
                          <IconHeart size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {tracks.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">Tracks</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {tracks.map((result) => (
                    <div key={result.id} className="group relative w-40 shrink-0">
                      <Link href={`/music/tracks/${result.id}`}>
                        <MusicCard
                          imageUrl={result.imageUrl}
                          title={result.title}
                          subtitle={result.subtitle}
                          aspectRatio="square"
                        />
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); handleFavorite(result.id, result.type); }}
                        disabled={favoriting.has(result.id)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70 disabled:opacity-50"
                      >
                        {favoriting.has(result.id) ? (
                          <span className="h-4 w-4 animate-ping rounded-full bg-pink-500" />
                        ) : (
                          <IconHeart size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Explore Feed (shown when not searching) */}
      {showExplore && (
        <div className="space-y-8">
          {!newReleases.length && !trending.length && !recommendations.length ? (
            <div className="pt-8">
              <MusicEmptyState
                title="Discover music"
                description="Search for your favorite artists, albums, or tracks to get started."
              />
            </div>
          ) : (
            <>
              <ExploreSection
                title="New Releases"
                icon={<IconMusic size={18} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />}
                items={newReleases}
                href={(id) => `/music/albums/${id}`}
                renderItem={(item: AlbumItem) => (
                  <MusicCard
                    imageUrl={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                    aspectRatio="portrait"
                  />
                )}
              />

              <ExploreSection
                title="Trending"
                icon={<IconTrendingUp size={18} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />}
                items={trending}
                href={() => "#"}
                renderItem={(item: PlaylistItem) => (
                  <MusicCard
                    imageUrl={item.imageUrl}
                    title={item.title}
                    subtitle={`${item.trackCount} tracks`}
                    aspectRatio="portrait"
                  />
                )}
              />

              <ExploreSection
                title="Recommended"
                icon={<IconSparkles size={18} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />}
                items={recommendations}
                href={(id) => `/music/tracks/${id}`}
                renderItem={(item: TrackItem) => (
                  <MusicCard
                    imageUrl={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                    aspectRatio="square"
                  />
                )}
              />
            </>
          )}
        </div>
      )}
    </MusicContainer>
  );
}
