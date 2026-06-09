"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconSearch, IconMicrophone, IconX } from "@tabler/icons-react";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "artist" | "album" | "track";
};

type Tab = "artist" | "album" | "track";

const tabs: { key: Tab; label: string }[] = [
  { key: "track", label: "Tracks" },
  { key: "album", label: "Albums" },
  { key: "artist", label: "Artists" },
];

export function SearchContent() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("track");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["music-search", query, activeTab],
    queryFn: async () => {
      if (!query.trim()) return { results: [] };
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ results: SearchResult[] }>;
    },
    enabled: query.length > 0,
  });

  const results = data?.results ?? [];

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

          <div className="mt-4 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-[var(--mantine-color-dimmed,#5c5f66)] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
          ) : query && results.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MusicEmptyState
                title="No results"
                description={`No ${activeTab}s found for "${query}". Try a different search term.`}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {results.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/music/${result.type === "artist" ? "artists" : result.type === "album" ? "albums" : "tracks"}/${result.id}`}
                  >
                    <MusicCard
                      imageUrl={result.imageUrl}
                      title={result.title}
                      subtitle={result.subtitle}
                      aspectRatio={result.type === "track" ? "square" : "portrait"}
                      badge={result.type}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MusicContainer>
  );
}
