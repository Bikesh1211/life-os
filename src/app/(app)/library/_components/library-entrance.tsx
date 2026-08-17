"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OpenTome } from "./marks";
import { useHydrated } from "./use-hydrated";

const GOLD = "#D9B46A";
const CANDLE = "#E8A855";

/** Once per browsing session, and never twice. */
const SESSION_KEY = "bks:library-entered";

/** Short. The brief asks for magical, and explicitly for skippable. */
const DURATION_MS = 2400;

/**
 * Whether this session has already been through the door.
 *
 * Read through an external store rather than set from an effect: the answer
 * lives in `sessionStorage`, which is exactly the "external system" a store
 * subscription is for, and deciding it in an effect would mean a synchronous
 * `setState` and a second render pass on every library visit. Memoised on
 * first call so the snapshot stays referentially stable across renders, which
 * `useSyncExternalStore` requires.
 */
let firstVisit: boolean | null = null;

function readFirstVisit(): boolean {
  if (firstVisit === null) {
    try {
      firstVisit = !window.sessionStorage.getItem(SESSION_KEY);
    } catch {
      // A blocked session store means the entrance plays every time rather than
      // never — the wrong side to fail on would be showing it to nobody.
      firstVisit = true;
    }
  }
  return firstVisit;
}

/** Nothing to subscribe to: the answer changes once, on arrival. */
const noSubscription = () => () => {};

/**
 * The doorway.
 *
 * A dark screen, one mote of light, a book that opens, and the room behind it —
 * played once per session when a reader arrives at `/library` directly.
 *
 * Three constraints shape it, and all three come from decisions already made
 * elsewhere in this codebase:
 *
 *   It is mounted only after hydration, over server-rendered content. The
 *   library is underneath in the HTML the whole time, so the archive stays
 *   crawlable and readable without JavaScript — the same rule Detective Mode's
 *   activation follows.
 *
 *   It never plays twice. Arriving through the mode switch already ran the
 *   book-opening sequence in the transition overlay, and that path sets the
 *   same session key, so a reader is not made to watch two entrances in a row.
 *
 *   It is skippable by anything a reader might reach for — the button, Escape,
 *   Tab, a click, a scroll — and under `prefers-reduced-motion` it does not
 *   arm at all.
 */
export function LibraryEntrance() {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armed = useSyncExternalStore(noSubscription, readFirstVisit, () => false);

  const playing = hydrated && !reduced && armed && !dismissed;

  const finish = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    // Marked as seen as soon as it starts, not when it ends: a reader who
    // navigates away mid-sequence has still been shown the door.
    markLibraryEntered();

    timer.current = setTimeout(() => setDismissed(true), DURATION_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Tab" || event.key === " ") finish();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", finish, { passive: true, once: true });
    window.addEventListener("touchstart", finish, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
    };
  }, [playing, finish]);

  /* The page underneath must not scroll while the curtain is up — the reader
     would arrive somewhere in the middle of the shelves. */
  useEffect(() => {
    if (!playing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [playing]);

  const total = DURATION_MS / 1000;

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden bg-[#04060E]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={finish}
        >
          {/* The mote, before there is anything to read by. */}
          <motion.span
            className="absolute size-2 rounded-full"
            style={{ background: CANDLE, boxShadow: `0 0 28px 8px ${CANDLE}77` }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1, 1.6, 3.4] }}
            transition={{ duration: total, times: [0.02, 0.14, 0.24, 0.4], ease: "easeOut" }}
            aria-hidden="true"
          />

          {/* The book. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0, 1, 1, 0.2], scale: [0.7, 0.84, 1, 1.02, 1.12] }}
            transition={{
              duration: total,
              times: [0, 0.22, 0.48, 0.82, 1],
              ease: [0.16, 0.9, 0.3, 1],
            }}
            aria-hidden="true"
          >
            <OpenTome
              className="size-[min(76vw,420px)]"
              tone={GOLD}
              warm={CANDLE}
              id="entrance-tome"
            />
          </motion.div>

          {/* Leaves turning. */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute origin-left"
              style={{
                width: "min(30vw, 170px)",
                height: "min(26vw, 150px)",
                background: `linear-gradient(100deg, ${GOLD}30, ${GOLD}0A)`,
                borderTop: `1px solid ${GOLD}55`,
                borderRight: `1px solid ${GOLD}44`,
                left: "50%",
              }}
              initial={{ opacity: 0, scaleX: 1 }}
              animate={{ opacity: [0, 0, 0.85, 0], scaleX: [1, 1, -0.2, -1] }}
              transition={{
                duration: total,
                times: [0, 0.34 + i * 0.06, 0.48 + i * 0.06, 0.66 + i * 0.06],
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
          ))}

          {/* The light out of the gutter. */}
          <motion.span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 62% 46% at 50% 50%, ${CANDLE}38 0%, transparent 68%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1] }}
            transition={{ duration: total, times: [0, 0.3, 0.56, 1], ease: "linear" }}
            aria-hidden="true"
          />

          {/* The name of the room. */}
          <motion.div
            className="relative flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }}
            transition={{ duration: total, times: [0, 0.5, 0.64, 1], ease: "easeOut" }}
          >
            <p className="text-3xl font-bold tracking-[0.2em] text-white sm:text-5xl">
              THE LIBRARY
            </p>
            <p className="mt-4 text-sm text-white/60 italic sm:text-base">
              Stories, thoughts, ideas, and journeys.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-8 rounded-full border border-white/25 px-4 py-1.5 text-xs tracking-[0.2em] text-white/60 uppercase transition-colors hover:border-white/50 hover:text-white"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Marks the entrance as already played.
 *
 * Called by the mode transition when it takes a reader into the library: that
 * overlay has just run its own book-opening sequence, and a second full-screen
 * one on arrival would be a toll rather than a doorway.
 */
export function markLibraryEntered() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Nothing to do — worst case the reader sees the entrance once more.
  }
}
