"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { JournalEntry } from "@/modules/journal";

type CoverageEntry = { year: number; month: number };

export type BookPage =
  | { type: "entry"; date: string; dateLabel: string; entries: JournalEntry[] }
  | { type: "empty" };

type UseBookDataResult = {
  pages: BookPage[];
  loading: boolean;
  error: string | null;
  coverage: CoverageEntry[];
  sortOrder: "asc" | "desc";
  toggleSortOrder: () => void;
  loadedYears: number[];
  loadYear: (year: number) => Promise<void>;
};

const LS_SORT_KEY = "life-os:journal-book-sort";

async function fetchCoverage(): Promise<CoverageEntry[]> {
  const res = await fetch("/api/journal/coverage");
  if (!res.ok) throw new Error("Failed to fetch coverage");
  return res.json();
}

async function fetchYearEntries(year: number, sortOrder: "asc" | "desc"): Promise<JournalEntry[]> {
  const params = new URLSearchParams({
    dateFrom: `${year}-01-01T00:00:00.000Z`,
    dateTo: `${year}-12-31T23:59:59.999Z`,
    sortBy: "createdAt",
    sortOrder,
    limit: "500",
  });
  const res = await fetch(`/api/journal?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch entries for ${year}`);
  return res.json();
}

function groupEntriesByDate(entries: JournalEntry[]): { date: string; dateLabel: string; entries: JournalEntry[] }[] {
  const map = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.eventDate ?? entry.createdAt);
    const key = d.toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.push(entry);
    } else {
      map.set(key, [entry]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dateEntries]) => ({
      date,
      dateLabel: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      entries: dateEntries,
    }));
}

function buildPages(entriesByDate: { date: string; dateLabel: string; entries: JournalEntry[] }[], sortOrder: "asc" | "desc"): BookPage[] {
  const sorted = sortOrder === "asc" ? entriesByDate : [...entriesByDate].reverse();
  if (sorted.length === 0) return [{ type: "empty" }];
  return sorted.map((g) => ({ type: "entry" as const, ...g }));
}

export function useBookData(): UseBookDataResult {
  const [coverage, setCoverage] = useState<CoverageEntry[]>([]);
  const [entriesByYear, setEntriesByYear] = useState<Map<number, JournalEntry[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [version, setVersion] = useState(0);
  const pendingYears = useRef(new Set<number>());
  const loadedRef = useRef<number[]>([]);
  const sortRef = useRef<"asc" | "desc">("asc");

  useEffect(() => {
    const stored = localStorage.getItem(LS_SORT_KEY);
    if (stored === "asc" || stored === "desc") {
      setSortOrder(stored);
      sortRef.current = stored;
    }
  }, []);

  const loadYear = useCallback(async (year: number) => {
    if (pendingYears.current.has(year) || loadedRef.current.includes(year)) return;
    pendingYears.current.add(year);
    try {
      const entries = await fetchYearEntries(year, sortRef.current);
      loadedRef.current = [...loadedRef.current, year].sort();
      setEntriesByYear((prev) => {
        const next = new Map(prev);
        next.set(year, entries);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${year}`);
    } finally {
      pendingYears.current.delete(year);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCoverage()
      .then((data) => {
        if (cancelled) return;
        setCoverage(data);
        if (data.length > 0) {
          const years = [...new Set(data.map((d) => d.year))];
          const latestYear = sortOrder === "desc" ? years[0] : years[years.length - 1];
          return loadYear(latestYear);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [loadYear, sortOrder]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => {
      const next = prev === "asc" ? "desc" : "asc";
      localStorage.setItem(LS_SORT_KEY, next);
      sortRef.current = next;
      setEntriesByYear(new Map());
      loadedRef.current = [];
      setLoading(true);
      setVersion((v) => v + 1);
      fetchCoverage().then((data) => {
        setCoverage(data);
        if (data.length > 0) {
          const years = [...new Set(data.map((d) => d.year))];
          const latestYear = next === "desc" ? years[0] : years[years.length - 1];
          loadYear(latestYear);
        } else {
          setLoading(false);
        }
      });
      return next;
    });
  }, [loadYear]);

  const allEntries = Array.from(entriesByYear.entries())
    .sort(([a], [b]) => a - b)
    .flatMap(([, entries]) => entries);

  const groupedByDate = groupEntriesByDate(allEntries);
  const pages = buildPages(groupedByDate, sortOrder);

  return { pages, loading, error, coverage, sortOrder, toggleSortOrder, loadedYears: loadedRef.current, loadYear };
}
