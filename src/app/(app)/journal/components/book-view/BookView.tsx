"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader, Center, Text, Box } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import "./book-styles.css";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useBookData, type BookPage as BookPageType } from "./useBookData";
import { BookPage } from "./BookPage";
import { BookCover } from "./BookCover";
import { BookToolbar } from "./BookToolbar";
import { BookTimelineDrawer } from "./BookTimelineDrawer";
import { SearchOverlay } from "./SearchOverlay";
import { StatsOverlay } from "./StatsOverlay";

const LS_PAGE_DATE_KEY = "life-os:journal-book-date";

type BookViewProps = {
  onClose: () => void;
};

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    rotateY: direction > 0 ? -15 : 15,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    rotateY: direction > 0 ? 15 : -15,
  }),
};

function getYearRange(pages: BookPageType[]): string {
  const entryPages = pages.filter((p) => p.type === "entry");
  if (entryPages.length === 0) return "No entries";
  const first = entryPages[0].date;
  const last = entryPages[entryPages.length - 1].date;
  return `${first.slice(0, 4)} — ${last.slice(0, 4)}`;
}

export function BookView({ onClose }: BookViewProps) {
  const { pages, loading, error, coverage, loadedYears, loadYear } = useBookData();
  const { setMinimalChrome } = useAppShell();
  const [[pageIndex, direction], setPageIndex] = useState([0, 0]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [handwritten, setHandwritten] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
        localStorage.setItem(LS_PAGE_DATE_KEY, targetPage.date);
        const year = parseInt(targetPage.date.slice(0, 4), 10);
        if (!loadedYears.includes(year)) {
          loadYear(year);
        }
        if (newDirection > 0 && next + 1 < totalPages) {
          const nextPage = pages[next + 1];
          if (nextPage?.type === "entry") {
            const nextYear = parseInt(nextPage.date.slice(0, 4), 10);
            if (nextYear !== year && !loadedYears.includes(nextYear)) {
              loadYear(nextYear);
            }
          }
        }
      }

      setPageIndex([next, newDirection]);
    },
    [pageIndex, totalPages, pages, loadedYears, loadYear],
  );

  const jumpToMonth = useCallback(
    (year: number, month: number) => {
      const targetDate = `${year}-${String(month).padStart(2, "0")}`;
      const idx = pages.findIndex(
        (p) => p.type === "entry" && p.date.startsWith(targetDate),
      );
      if (idx >= 0) {
        setPageIndex([idx, 1]);
        if (!loadedYears.includes(year)) loadYear(year);
      }
      setTimelineOpen(false);
    },
    [pages, loadedYears, loadYear],
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (searchOpen || timelineOpen || statsOpen) return;
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
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) break;
          e.preventDefault();
          setSearchOpen(true);
          break;
        case "Escape":
          onClose();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, totalPages, searchOpen, timelineOpen, statsOpen, onClose]);

  const currentPageData = pages[pageIndex] ?? null;
  const allEntryPages = pages.filter((p) => p.type === "entry");
  const totalEntryCount = allEntryPages.reduce((acc, p) => acc + p.entries.length, 0);

  if (loading) {
    return (
      <Center h="80vh">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="80vh">
        <Text c="red" size="sm">
          {error}
        </Text>
      </Center>
    );
  }

  if (totalPages === 0 || (totalPages === 1 && pages[0]?.type === "end")) {
    return (
      <Center h="80vh">
        <Text c="dimmed" size="sm">
          No journal entries yet. Start writing to fill these pages.
        </Text>
      </Center>
    );
  }

  return (
    <Box className="relative" style={{ height: "calc(100vh - 2px)", overflow: "hidden" }}>
      <div className="flex h-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div
          className="relative h-full w-full max-w-5xl"
          style={{ perspective: "1500px" }}
        >
          {isMobile ? (
            <div className="relative h-full w-full overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-850">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={pageIndex}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if (x < rect.width * 0.3) paginate(-1);
                    else if (x > rect.width * 0.7) paginate(1);
                  }}
                >
                  {currentPageData?.type === "entry" ? (
                    <BookPage page={currentPageData} handwritten={handwritten} />
                  ) : currentPageData?.type === "end" ? (
                    <BookPage page={currentPageData} handwritten={handwritten} />
                  ) : (
                    <BookCover
                      totalEntries={totalEntryCount}
                      yearRange={getYearRange(pages)}
                      handwritten={handwritten}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="relative flex h-full gap-2 overflow-hidden"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width * 0.2) paginate(-1);
                else if (x > rect.width * 0.8) paginate(1);
              }}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={`left-${pageIndex}`}
                  className="flex-1 overflow-hidden rounded-l-lg bg-white shadow-lg dark:bg-[#1c1c1e]"
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? -100 : 100,
                      opacity: 0,
                    }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({
                      x: dir > 0 ? -100 : 100,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {pageIndex % 2 === 0 ? (
                    pageIndex < totalPages ? (
                      <BookPage page={pages[pageIndex]} handwritten={handwritten} />
                    ) : (
                      <BookCover
                        totalEntries={totalEntryCount}
                        yearRange={getYearRange(pages)}
                        handwritten={handwritten}
                      />
                    )
                  ) : pageIndex - 1 >= 0 && pageIndex - 1 < totalPages ? (
                    <BookPage page={pages[pageIndex - 1]} handwritten={handwritten} />
                  ) : (
                    <BookCover
                      totalEntries={totalEntryCount}
                      yearRange={getYearRange(pages)}
                      handwritten={handwritten}
                    />
                  )}
                </motion.div>
                <motion.div
                  key={`right-${pageIndex}`}
                  className="flex-1 overflow-hidden rounded-r-lg bg-white shadow-lg dark:bg-[#1c1c1e]"
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      rotateY: dir > 0 ? -20 : 20,
                      opacity: 0,
                    }),
                    center: { rotateY: 0, opacity: 1 },
                    exit: (dir: number) => ({
                      rotateY: dir > 0 ? 20 : -20,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {pageIndex % 2 === 0 ? (
                    pageIndex + 1 < totalPages ? (
                      <BookPage page={pages[pageIndex + 1]} handwritten={handwritten} />
                    ) : (
                      <BookCover
                        totalEntries={totalEntryCount}
                        yearRange={getYearRange(pages)}
                        handwritten={handwritten}
                      />
                    )
                  ) : pageIndex < totalPages ? (
                    <BookPage page={pages[pageIndex]} handwritten={handwritten} />
                  ) : (
                    <BookCover
                      totalEntries={totalEntryCount}
                      yearRange={getYearRange(pages)}
                      handwritten={handwritten}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <BookToolbar
        currentPage={pageIndex}
        totalPages={totalPages}
        progress={totalPages > 0 ? pageIndex / (totalPages - 1) : 0}
        currentPageData={currentPageData}
        handwritten={handwritten}
        isFullscreen={false}
        searchOpen={searchOpen}
        timelineOpen={timelineOpen}
        statsOpen={statsOpen}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onToggleSearch={() => setSearchOpen((p) => !p)}
        onToggleHandwritten={() => setHandwritten((p) => !p)}
        onToggleFullscreen={() => {}}
        onToggleTimeline={() => setTimelineOpen((p) => !p)}
        onToggleStats={() => setStatsOpen((p) => !p)}
        onClose={onClose}
      />

      <BookTimelineDrawer
        open={timelineOpen}
        coverage={coverage}
        onClose={() => setTimelineOpen(false)}
        onJumpToDate={jumpToMonth}
      />

      <SearchOverlay
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        pages={pages}
        onJumpToDate={jumpToDate}
      />

      <StatsOverlay
        opened={statsOpen}
        onClose={() => setStatsOpen(false)}
        pages={pages}
      />
    </Box>
  );
}
