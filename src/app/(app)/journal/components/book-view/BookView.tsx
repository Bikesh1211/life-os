"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader, Center, Text, Box } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useBookData } from "./useBookData";
import { BookPage } from "./BookPage";
import { BookToolbar } from "./BookToolbar";
import { SearchOverlay } from "./SearchOverlay";

const LS_PAGE_KEY = "life-os:journal-book-page";

type BookViewProps = {
  onClose: () => void;
};

export function BookView({ onClose }: BookViewProps) {
  const { pages, loading, error, sortOrder, toggleSortOrder, loadYear, loadedYears } = useBookData();
  const { setMinimalChrome } = useAppShell();
  const [[pageIndex, direction], setPageIndex] = useState([0, 0]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  const totalPages = pages.length;

  const paginate = useCallback(
    (newDirection: number) => {
      const next = pageIndex + newDirection;
      if (next < 0 || next >= totalPages) return;

      const targetPage = pages[next];
      if (targetPage?.type === "entry") {
        const year = parseInt(targetPage.date.slice(0, 4), 10);
        if (!loadedYears.includes(year)) loadYear(year);

        if (newDirection > 0 && next + 1 < totalPages) {
          const nextPage = pages[next + 1];
          if (nextPage?.type === "entry") {
            const nextYear = parseInt(nextPage.date.slice(0, 4), 10);
            if (nextYear !== year && !loadedYears.includes(nextYear)) loadYear(nextYear);
          }
        }
      }

      setPageIndex([next, newDirection]);
    },
    [pageIndex, totalPages, pages, loadedYears, loadYear],
  );

  const jumpToDate = useCallback(
    (date: string) => {
      const idx = pages.findIndex((p) => p.type === "entry" && p.date === date);
      if (idx >= 0) {
        setPageIndex([idx, 1]);
        const year = parseInt(date.slice(0, 4), 10);
        if (!loadedYears.includes(year)) loadYear(year);
      }
    },
    [pages, loadedYears, loadYear],
  );

  const handleToggleSort = useCallback(() => {
    toggleSortOrder();
    setPageIndex([0, 0]);
  }, [toggleSortOrder]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (searchOpen) return;
      switch (e.key) {
        case "ArrowRight":
          paginate(1);
          break;
        case "ArrowLeft":
          paginate(-1);
          break;
        case "Home":
          setPageIndex([0, -1]);
          break;
        case "End":
          setPageIndex([totalPages - 1, 1]);
          break;
        case "Escape":
          onClose();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, totalPages, searchOpen, onClose]);

  const currentPageData = pages[pageIndex] ?? null;

  if (loading) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Text c="red" size="sm">{error}</Text>
      </Center>
    );
  }

  return (
    <Box style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)" className="overflow-hidden">
      <div className="flex h-full items-center justify-center px-4 pb-16 pt-4">
        <div className="relative h-full w-full max-w-4xl">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-[#1a1a1c] dark:ring-gray-800">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={pageIndex}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 200 : -200,
                    opacity: 0,
                  }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({
                    x: dir > 0 ? -200 : 200,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35, mass: 1 }}
                className="absolute inset-0"
              >
                <BookPage page={currentPageData} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BookToolbar
        currentPage={pageIndex}
        totalPages={totalPages}
        currentDateLabel={
          currentPageData?.type === "entry"
            ? currentPageData.dateLabel
            : ""
        }
        sortOrder={sortOrder}
        searchOpen={searchOpen}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onToggleSearch={() => setSearchOpen((p) => !p)}
        onToggleSort={handleToggleSort}
        onClose={onClose}
      />

      <SearchOverlay
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        pages={pages}
        onJumpToDate={jumpToDate}
      />
    </Box>
  );
}
