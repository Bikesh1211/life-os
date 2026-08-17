"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CompassRose } from "./compass-rose";

const BRASS = "#D9A441";
const EXPEDITION = "#E0705C";

/** Once per browsing session, and never twice. */
const SESSION_KEY = "life-os:explore-entered";

/** Short. Cinematic, and explicitly skippable. */
const DURATION_MS = 2600;

/**
 * Whether this session has already opened the archive.
 *
 * Read through an external store rather than set from an effect — the answer
 * lives in `sessionStorage`, which is exactly what a store subscription is for,
 * and deciding it in an effect would mean a synchronous `setState` and a second
 * render pass on every visit. Memoised on first call so the snapshot stays
 * referentially stable, which `useSyncExternalStore` requires.
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

/** Nothing to subscribe to: neither answer below changes after the first read. */
const noSubscription = () => () => {};

/**
 * Whether React has hydrated.
 *
 * `useSyncExternalStore` with a constant client snapshot and a constant server
 * snapshot is the hook's intended shape for exactly this: the server says
 * `false`, the client says `true`, and React reconciles the difference on
 * hydration without a `setState` in an effect and the extra render pass that
 * comes with one.
 */
const onClient = () => true;
const onServer = () => false;

/** The route the sheet draws, and the fix it plants at the end. */
const ROUTE = "M 40 250 L 108 214 L 168 236 L 236 168 L 302 190 L 360 128";
const FIX = { x: 360, y: 128 };

/**
 * The way in: a map unfolding, a route drawing itself, a compass settling on a
 * bearing, and a marker dropped on the destination.
 *
 * Three constraints shape it:
 *
 *   It is mounted only after hydration, over content the server already
 *   rendered, so the archive is readable the moment it arrives and nothing
 *   waits on this to paint.
 *
 *   It never plays twice in a session. Walking between the archive's nine
 *   sections must not re-run a curtain each time.
 *
 *   It is skippable by anything a reader might reach for — the button, Escape,
 *   Tab, space, a scroll, a touch, a click — and under `prefers-reduced-motion`
 *   it does not arm at all.
 */
export function ExploreEntrance() {
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hydrated = useSyncExternalStore(noSubscription, onClient, onServer);
  const armed = useSyncExternalStore(noSubscription, readFirstVisit, onServer);
  const playing = hydrated && !reduced && armed && !dismissed;

  const finish = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    // Marked as seen as soon as it starts, not when it ends: a reader who
    // navigates away mid-sequence has still been shown the way in.
    markExploreEntered();

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
     would arrive somewhere in the middle of the archive. */
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
          className="fixed inset-0 z-[1300] flex items-center justify-center overflow-hidden bg-[#0A0705]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeInOut" }}
          onClick={finish}
        >
          {/* The sheet, unfolding. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scaleX: 0.05, scaleY: 0.55 }}
            animate={{
              opacity: [0, 1, 1, 1],
              scaleX: [0.05, 0.48, 1, 1],
              scaleY: [0.55, 0.8, 1, 1],
            }}
            transition={{ duration: total, times: [0, 0.12, 0.26, 1], ease: [0.16, 0.9, 0.3, 1] }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 400 300" className="w-[min(90vw,660px)]" fill="none">
              <rect
                x={8}
                y={8}
                width={384}
                height={284}
                fill={`${BRASS}0A`}
                stroke={`${BRASS}4D`}
                strokeWidth={1}
              />
              {[136, 264].map((x) => (
                <line key={x} x1={x} y1={8} x2={x} y2={292} stroke={`${BRASS}1F`} strokeWidth={1} />
              ))}
              <line x1={8} y1={150} x2={392} y2={150} stroke={`${BRASS}1F`} strokeWidth={1} />

              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 0.55, 0.55] }}
                transition={{ duration: total, times: [0, 0.2, 0.36, 1], ease: "linear" }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M 20 ${104 + i * 26} Q 110 ${72 + i * 26} 200 ${100 + i * 26} T 380 ${86 + i * 26}`}
                    stroke={`${BRASS}44`}
                    strokeWidth={1}
                    fill="none"
                  />
                ))}
              </motion.g>

              <motion.path
                d={ROUTE}
                stroke={EXPEDITION}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] }}
                transition={{ duration: total, times: [0, 0.26, 0.56, 1], ease: [0.4, 0, 0.2, 1] }}
              />

              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0, 1, 1], scale: [0, 0, 1, 1] }}
                transition={{ duration: total, times: [0, 0.54, 0.62, 1], ease: [0.16, 0.9, 0.3, 1] }}
                style={{ transformOrigin: `${FIX.x}px ${FIX.y}px` }}
              >
                <circle cx={FIX.x} cy={FIX.y} r={15} fill={EXPEDITION} opacity={0.18} />
                <circle cx={FIX.x} cy={FIX.y} r={5} fill={EXPEDITION} />
                <circle
                  cx={FIX.x}
                  cy={FIX.y}
                  r={10}
                  stroke={EXPEDITION}
                  strokeWidth={1.4}
                  fill="none"
                />
              </motion.g>
            </svg>
          </motion.div>

          {/* The compass, swinging past north and settling. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.72, rotate: -32 }}
            animate={{
              opacity: [0, 0, 0.8, 0.42, 0.28],
              scale: [0.72, 0.88, 1, 1, 1.06],
              rotate: [-32, -10, 5, 0, 0],
            }}
            transition={{
              duration: total,
              times: [0, 0.32, 0.5, 0.68, 1],
              ease: [0.22, 0.8, 0.3, 1],
            }}
            aria-hidden="true"
          >
            <CompassRose
              className="size-[min(56vw,330px)]"
              tone={BRASS}
              warm={EXPEDITION}
              id="entrance-compass"
            />
          </motion.div>

          {/* The name of the archive. */}
          <motion.div
            className="relative flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 0, 1, 1], y: [10, 10, 0, 0] }}
            transition={{ duration: total, times: [0, 0.52, 0.66, 1], ease: "easeOut" }}
          >
            <p className="text-2xl font-bold tracking-[0.18em] text-white sm:text-4xl">
              EXPEDITION ARCHIVE
            </p>
            <p
              className="xp-label mt-4"
              style={{ color: `${BRASS}CC` }}
            >
              Adventure log initialized
            </p>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            className="xp-label absolute bottom-8 rounded-full border border-white/25 px-4 py-1.5 text-white/60 transition-colors hover:border-white/50 hover:text-white"
          >
            Skip animation
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Marks the entrance as already played. */
export function markExploreEntered() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Nothing to do — worst case the reader sees the entrance once more.
  }
}
