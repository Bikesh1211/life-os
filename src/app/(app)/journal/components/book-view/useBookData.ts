"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { JournalEntry } from "@/modules/journal";

type CoverageEntry = { year: number; month: number };

export type BookPage =
  | { type: "cover" }
  | { type: "entry"; date: string; dateLabel: string; entries: JournalEntry[] }
  | { type: "end" };

type UseBookDataResult = {
  pages: BookPage[];
  loading: boolean;
  error: string | null;
  coverage: CoverageEntry[];
  loadedYears: number[];
  loadYear: (year: number) => Promise<void>;
};

async function fetchCoverage(): Promise<CoverageEntry[]> {
  const res = await fetch("/api/journal/coverage");
  if (!res.ok) throw new Error("Failed to fetch coverage");
  return res.json();
}

async function fetchYearEntries(year: number): Promise<JournalEntry[]> {
  const params = new URLSearchParams({
    dateFrom: `${year}-01-01T00:00:00.000Z`,
    dateTo: `${year}-12-31T23:59:59.999Z`,
    sortBy: "createdAt",
    sortOrder: "asc",
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

function buildPages(entriesByDate: { date: string; dateLabel: string; entries: JournalEntry[] }[]): BookPage[] {
  const pages: BookPage[] = [{ type: "cover" }];
  for (const group of entriesByDate) {
    pages.push({ type: "entry", ...group });
  }
  pages.push({ type: "end" });
  return pages;
}

export function useBookData(): UseBookDataResult {
  const [coverage, setCoverage] = useState<CoverageEntry[]>([]);
  const [entriesByYear, setEntriesByYear] = useState<Map<number, JournalEntry[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedYears, setLoadedYears] = useState<number[]>([]);
  const pendingYears = useRef(new Set<number>());
  const loadedRef = useRef<number[]>([]);

  const loadYear = useCallback(async (year: number) => {
    if (pendingYears.current.has(year) || loadedRef.current.includes(year)) return;
    pendingYears.current.add(year);
    try {
      const entries = await fetchYearEntries(year);
      loadedRef.current = [...loadedRef.current, year].sort();
      setLoadedYears(loadedRef.current);
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
          const latestYear = years[years.length - 1];
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
  }, [loadYear]);

  const allEntries = Array.from(entriesByYear.entries())
    .sort(([a], [b]) => a - b)
    .flatMap(([, entries]) => entries);

  const groupedByDate = groupEntriesByDate(allEntries);
  const pages = buildPages(groupedByDate);

  return { pages, loading, error, coverage, loadedYears: loadedRef.current, loadYear };
}
