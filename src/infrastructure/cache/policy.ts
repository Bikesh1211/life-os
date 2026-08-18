/**
 * How long each kind of LifeOS data is allowed to be served without checking.
 *
 * These are *staleness* windows, not expiry. Within the window a cached value
 * renders immediately and no request is made; past it the cached value still
 * renders immediately and a refresh runs behind it. Nothing here ever blanks
 * the screen — that is the point of tuning it centrally rather than sprinkling
 * `staleTime` literals through 114 hook files.
 *
 * The number is chosen from how visibly wrong the data would look if it were a
 * minute out of date, not from how expensive it is to fetch:
 *
 *   - things the user is actively editing (tasks, notes) change under their own
 *     hands, and mutations invalidate them directly, so a short window is
 *     mostly a backstop against edits made in another tab;
 *   - summaries and analytics are aggregates that move slowly and cost the most
 *     to compute, so they get the longest windows;
 *   - reference data (categories, labels, tags) changes when the user opens a
 *     settings screen and essentially never otherwise.
 */
export const STALE_TIME = {
  /** Reference data: categories, labels, tags, folders, exercise library. */
  reference: 30 * 60 * 1000,
  /** Dashboard and per-module summary cards. */
  summary: 5 * 60 * 1000,
  /** Lists the user reads and edits: tasks, notes, habits, journal, events. */
  list: 60 * 1000,
  /** A single opened record. */
  detail: 2 * 60 * 1000,
  /** Charts and analytics computed over a long window. */
  analytics: 10 * 60 * 1000,
  /** Anything the user expects to be current the moment they look at it. */
  live: 30 * 1000,
} as const;

/**
 * How long an unused value stays in memory before it is dropped.
 *
 * This is what makes going back to a screen instant: the data is still there
 * from last time, so it renders with no spinner while the refresh runs. It has
 * to be comfortably longer than the staleness window or there would be nothing
 * left to revalidate.
 */
export const GC_TIME = 30 * 60 * 1000;
