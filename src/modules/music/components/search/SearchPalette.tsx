"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { apiFetch, toSearchParams } from "@/core/api/http";

type QuickResult = {
  id: string;
  title: string;
  subtitle: string | null;
  type: "artist" | "album" | "track";
};

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const { data } = useQuery({
    queryKey: ["music-palette-search", query],
    queryFn: async () => {
      if (!query.trim()) return { results: [] };
      return apiFetch<{ results: QuickResult[] }>(
        `/api/music/search${toSearchParams({ q: query, type: "track", limit: 5 })}`,
      );
    },
    enabled: query.length > 0,
  });

  const results = data?.results ?? [];

  const handleSelect = (result: QuickResult) => {
    const path = `/music/${result.type === "artist" ? "artists" : result.type === "album" ? "albums" : "tracks"}/${result.id}`;
    router.push(path);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-all hover:shadow-md hover:text-white"
      >
        <IconSearch size={16} />
        Search music...
        <kbd className="ml-auto rounded-md border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px]">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2"
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl">
                <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4">
                  <IconSearch size={18} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search artists, albums, tracks..."
                    className="flex-1 bg-transparent py-4 text-base text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none"
                  />
                </div>
                {results.length > 0 && (
                  <div className="max-h-72 overflow-y-auto p-2">
                    {results.map((result, i) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          i === selectedIndex
                            ? "bg-white/10 text-white"
                            : "text-[var(--mantine-color-dimmed,#5c5f66)]"
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">
                          {result.type}
                        </span>
                        <span className="font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                          {result.title}
                        </span>
                        {result.subtitle && (
                          <span className="text-[var(--mantine-color-dimmed,#5c5f66)]">
                            {result.subtitle}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {query && results.length === 0 && (
                  <div className="p-6 text-center text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                    No results found
                  </div>
                )}
                <div className="border-t border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                  ↑↓ Navigate · Enter Select · Esc Close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
