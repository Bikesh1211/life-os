"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const LS_PAGE_KEY = "life-os:journal-book-page";
const LS_FONT_KEY = "life-os:journal-book-font";

type BookNavigationOptions = {
  totalPages: number;
  defaultDate?: string;
};

export function useBookNavigation({ totalPages, defaultDate }: BookNavigationOptions) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlDate = searchParams.get("date");

  const [currentPage, setCurrentPageState] = useState(0);
  const [showHandwrittenFont, setShowHandwrittenFont] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (urlDate) {
      const saved = urlDate;
      setCurrentPageState(0);
      localStorage.setItem(LS_PAGE_KEY, saved);
    } else {
      const stored = localStorage.getItem(LS_PAGE_KEY);
      if (stored) {
        setCurrentPageState(0);
      }
    }
  }, [urlDate]);

  useEffect(() => {
    const storedFont = localStorage.getItem(LS_FONT_KEY);
    if (storedFont === "true") {
      setShowHandwrittenFont(true);
    }
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPageState((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPageState((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const toggleHandwrittenFont = useCallback(() => {
    setShowHandwrittenFont((prev) => {
      const next = !prev;
      localStorage.setItem(LS_FONT_KEY, String(next));
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;
  const progress = totalPages > 1 ? currentPage / (totalPages - 1) : 0;

  return {
    currentPage,
    currentDate: urlDate ?? defaultDate,
    showHandwrittenFont,
    isFullscreen,
    canGoNext,
    canGoPrev,
    progress,
    nextPage,
    prevPage,
    goToPage,
    toggleHandwrittenFont,
    toggleFullscreen,
    setIsFullscreen,
  };
}
