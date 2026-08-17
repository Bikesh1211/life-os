"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { entryKey, type LibraryEntry } from "@/modules/library";

/**
 * What the library remembers about a reader: what they saved, and where they
 * stopped.
 *
 * It lives in `localStorage` and nowhere else. Life OS *does* have accounts, so
 * this could have been a table — and deliberately is not, yet. Reading position
 * is high-frequency, low-value state: it changes on every scroll frame, it is
 * worthless to anyone but the person who made it, and losing it costs a reader
 * one scroll. A table would mean a write endpoint taking a request per percent.
 *
 * The consequence is honest and stated where the reader will see it (the
 * favourites page says so): this is per-device, and clearing site data clears
 * it. If it ever needs to follow a reader between devices, this file is the
 * seam — the reducer already speaks in whole positions.
 *
 * State is loaded in an effect rather than during render so the server and the
 * first client render agree on an empty shelf. `ready` tells the interface when
 * the stored state has landed; anything that would otherwise flicker — a filled
 * bookmark, a progress ring, a "Continue reading" panel — waits for it.
 */

/* ── Shapes ──────────────────────────────────────────────────────────────── */

export interface ReadingPosition {
  /** How far through, 0–100. */
  percent: number;
  /** The chapter slug last open, on a chaptered entry. */
  chapter?: string;
  updatedAt: string;
  completed: boolean;
}

interface ReaderState {
  bookmarks: string[];
  progress: Record<string, ReadingPosition>;
  ready: boolean;
}

const EMPTY: ReaderState = { bookmarks: [], progress: {}, ready: false };

/**
 * Past this, an entry is finished rather than nearly finished. Deliberately
 * short of 100: a footer, a related-reading block and a comment-free page end
 * mean the last screen of an article is rarely prose, and demanding 100% would
 * leave everything permanently "in progress".
 */
export const COMPLETION_THRESHOLD = 92;

/**
 * Progress is only worth remembering once a reader is actually into something.
 * Below this, the "position" is just the top of the page.
 */
const MINIMUM_TRACKED = 3;

/** How many entries keep a stored position. Oldest fall off the end. */
const MAX_TRACKED = 60;

/* ── Reducer ─────────────────────────────────────────────────────────────── */

type Action =
  | { type: "hydrate"; state: Omit<ReaderState, "ready"> }
  | { type: "toggleBookmark"; key: string }
  | { type: "recordProgress"; key: string; percent: number; chapter?: string }
  | { type: "clearProgress"; key: string }
  | { type: "clearAll" };

function reducer(state: ReaderState, action: Action): ReaderState {
  switch (action.type) {
    case "hydrate":
      return { ...action.state, ready: true };

    case "toggleBookmark":
      return {
        ...state,
        bookmarks: state.bookmarks.includes(action.key)
          ? state.bookmarks.filter((key) => key !== action.key)
          : [action.key, ...state.bookmarks],
      };

    case "recordProgress": {
      if (action.percent < MINIMUM_TRACKED) return state;

      const previous = state.progress[action.key];
      const completed = previous?.completed || action.percent >= COMPLETION_THRESHOLD;

      /* Scrolling back up does not un-read a book. The stored percentage is a
         high-water mark; only the chapter follows the reader in both
         directions, because that is a position rather than an achievement. */
      const percent = Math.max(previous?.percent ?? 0, Math.round(action.percent));

      if (
        previous &&
        previous.percent === percent &&
        previous.chapter === (action.chapter ?? previous.chapter) &&
        previous.completed === completed
      ) {
        return state;
      }

      const progress = {
        ...state.progress,
        [action.key]: {
          percent,
          chapter: action.chapter ?? previous?.chapter,
          updatedAt: new Date().toISOString(),
          completed,
        },
      };

      return { ...state, progress: prune(progress) };
    }

    case "clearProgress": {
      const progress = { ...state.progress };
      delete progress[action.key];
      return { ...state, progress };
    }

    case "clearAll":
      return { ...state, bookmarks: [], progress: {} };

    default:
      return state;
  }
}

/** Keeps the stored map bounded: the most recently touched entries survive. */
function prune(progress: Record<string, ReadingPosition>): Record<string, ReadingPosition> {
  const keys = Object.keys(progress);
  if (keys.length <= MAX_TRACKED) return progress;

  const kept = keys
    .sort((a, b) => progress[b].updatedAt.localeCompare(progress[a].updatedAt))
    .slice(0, MAX_TRACKED);

  return Object.fromEntries(kept.map((key) => [key, progress[key]]));
}

/* ── Persistence ─────────────────────────────────────────────────────────── */

const STORAGE_KEY = "life-os:library-reader:v1";

function read(): Omit<ReaderState, "ready"> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bookmarks: [], progress: {} };
    const parsed = JSON.parse(raw) as Partial<ReaderState>;

    // Re-checked field by field rather than trusted: this is user-editable
    // storage that may also have been written by an older build.
    const progress: Record<string, ReadingPosition> = {};
    if (parsed.progress && typeof parsed.progress === "object") {
      for (const [key, value] of Object.entries(parsed.progress)) {
        if (isPosition(value)) progress[key] = value;
      }
    }

    return {
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks.filter((key): key is string => typeof key === "string")
        : [],
      progress,
    };
  } catch {
    return { bookmarks: [], progress: {} };
  }
}

function isPosition(value: unknown): value is ReadingPosition {
  const position = value as ReadingPosition;
  return (
    !!position &&
    typeof position === "object" &&
    Number.isFinite(position.percent) &&
    position.percent >= 0 &&
    position.percent <= 100 &&
    typeof position.updatedAt === "string"
  );
}

/* ── Provider ────────────────────────────────────────────────────────────── */

interface ReaderValue extends ReaderState {
  isBookmarked: (entry: Pick<LibraryEntry, "kind" | "slug">) => boolean;
  toggleBookmark: (entry: Pick<LibraryEntry, "kind" | "slug">) => void;
  positionOf: (entry: Pick<LibraryEntry, "kind" | "slug">) => ReadingPosition | undefined;
  recordProgress: (
    entry: Pick<LibraryEntry, "kind" | "slug">,
    percent: number,
    chapter?: string,
  ) => void;
  clearProgress: (entry: Pick<LibraryEntry, "kind" | "slug">) => void;
  clearAll: () => void;
  /** Entries started and not finished, most recently read first. */
  inProgressKeys: string[];
}

const ReaderContext = createContext<ReaderValue | null>(null);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);

  useEffect(() => {
    dispatch({ type: "hydrate", state: read() });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    try {
      // Written field by field rather than by stripping `ready` off the state:
      // an explicit shape is what `read()` validates against, and the two
      // drifting apart is how storage formats break.
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ bookmarks: state.bookmarks, progress: state.progress }),
      );
    } catch {
      // A full or disabled store is not worth breaking the library over — the
      // session simply stops surviving a reload.
    }
  }, [state]);

  const value = useMemo<ReaderValue>(
    () => ({
      ...state,
      isBookmarked: (entry) => state.bookmarks.includes(entryKey(entry)),
      toggleBookmark: (entry) => dispatch({ type: "toggleBookmark", key: entryKey(entry) }),
      positionOf: (entry) => state.progress[entryKey(entry)],
      recordProgress: (entry, percent, chapter) =>
        dispatch({ type: "recordProgress", key: entryKey(entry), percent, chapter }),
      clearProgress: (entry) => dispatch({ type: "clearProgress", key: entryKey(entry) }),
      clearAll: () => dispatch({ type: "clearAll" }),
      inProgressKeys: Object.entries(state.progress)
        .filter(([, position]) => !position.completed)
        .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
        .map(([key]) => key),
    }),
    [state],
  );

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

export function useReader(): ReaderValue {
  const value = useContext(ReaderContext);
  if (!value) throw new Error("useReader must be used inside <ReaderProvider>");
  return value;
}
