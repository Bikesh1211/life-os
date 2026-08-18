"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconSearch, IconMicrophone, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { apiFetch, toSearchParams } from "@/core/api/http";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "artist" | "album" | "track";
};

type SearchResponse = {
  artists: SearchResult[];
  albums: SearchResult[];
  tracks: SearchResult[];
  query: string;
  source: string;
};

export function SearchContent() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["music-search", query],
    queryFn: async () => {
      if (!query.trim()) return { artists: [], albums: [], tracks: [], query: "", source: "itunes" };
      return apiFetch<SearchResponse>(`/api/music/search${toSearchParams({ q: query })}`);
    },
    enabled: query.length > 0,
  });

  const artists = data?.artists ?? [];
  const albums = data?.albums ?? [];
  const tracks = data?.tracks ?? [];
  const hasResults = artists.length > 0 || albums.length > 0 || tracks.length > 0;

  return (
    <MusicContainer>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
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
              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-4 pl-12 pr-12 text-lg text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
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

        <AnimatePresence mode="wait">
          {isLoading ? (
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
          ) : query && !hasResults ? (
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
          ) : query && hasResults ? (
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
                      <div key={result.id} className="w-40 shrink-0">
                        <Link href={`/music/artists/${result.id}`}>
                          <MusicCard
                            imageUrl={result.imageUrl}
                            title={result.title}
                            subtitle={result.subtitle}
                            aspectRatio="square"
                          />
                        </Link>
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
                      <div key={result.id} className="w-40 shrink-0">
                        <Link href={`/music/albums/${result.id}`}>
                          <MusicCard
                            imageUrl={result.imageUrl}
                            title={result.title}
                            subtitle={result.subtitle}
                            aspectRatio="portrait"
                          />
                        </Link>
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
                      <div key={result.id} className="w-40 shrink-0">
                        <Link href={`/music/tracks/${result.id}`}>
                          <MusicCard
                            imageUrl={result.imageUrl}
                            title={result.title}
                            subtitle={result.subtitle}
                            aspectRatio="square"
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MusicContainer>
  );
}
