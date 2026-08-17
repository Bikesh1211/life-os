/**
 * The pattern library.
 *
 * Nineteen abstract textures, every one of them built from CSS gradients and
 * nothing else. That constraint is deliberate and it buys three things at once:
 *
 *   Nothing is downloaded. No image request, no decode, no layout shift, and
 *   the whole library adds no weight to any page beyond the CSS itself.
 *
 *   Everything re-tints. A gradient can read `var(--ctx-accent)`, so one motif
 *   serves a dozen contexts and each of them looks like itself. An SVG data URI
 *   cannot — its colours are baked in at authoring time — which is the reason
 *   there is not a single one here.
 *
 *   Nothing is copyrighted. These are grids, rings, contours and bands. The
 *   cinematic identity comes from colour, density and where the light falls,
 *   never from anyone's artwork.
 *
 * Each motif returns a `background-image` value. They are composed at very low
 * opacity by the layer that paints them (see `.ctx-bg` in globals.css), so the
 * alpha figures below are relative to an already-faint layer — the numbers read
 * higher than what actually reaches the screen.
 */

/** Shorthand: the context accent at a given strength. */
const a = (percent: number) => `color-mix(in oklab, var(--ctx-accent) ${percent}%, transparent)`;

/** The same, for the ink used on structural lines. */
const ink = (percent: number) =>
  `color-mix(in oklab, var(--lo-text-primary) ${percent}%, transparent)`;

export type MotifId = keyof typeof MOTIFS;

export const MOTIFS = {
  /** No pattern. For contexts that should stay perfectly plain. */
  none: () => "none",

  /** Tactical grid — the base for anything operational. */
  grid: () => [
    `repeating-linear-gradient(0deg, ${a(22)} 0 1px, transparent 1px 56px)`,
    `repeating-linear-gradient(90deg, ${a(22)} 0 1px, transparent 1px 56px)`,
    `radial-gradient(120% 80% at 50% -10%, ${a(12)} 0%, transparent 60%)`,
  ].join(", "),

  /** Grid plus a diagonal hatch and register marks: a drawing, not a table. */
  blueprint: () => [
    `repeating-linear-gradient(0deg, ${a(20)} 0 1px, transparent 1px 44px)`,
    `repeating-linear-gradient(90deg, ${a(20)} 0 1px, transparent 1px 44px)`,
    `repeating-linear-gradient(45deg, ${a(9)} 0 1px, transparent 1px 14px)`,
    `radial-gradient(100% 70% at 12% -6%, ${a(14)} 0%, transparent 58%)`,
  ].join(", "),

  /** Engineering schematic: a finer grid with heavier every-fifth lines. */
  schematic: () => [
    `repeating-linear-gradient(0deg, ${a(26)} 0 1px, transparent 1px 120px)`,
    `repeating-linear-gradient(90deg, ${a(26)} 0 1px, transparent 1px 120px)`,
    `repeating-linear-gradient(0deg, ${a(10)} 0 1px, transparent 1px 24px)`,
    `repeating-linear-gradient(90deg, ${a(10)} 0 1px, transparent 1px 24px)`,
  ].join(", "),

  /** Concentric rings — orbits, ripples, the passage of time. */
  rings: () => [
    `repeating-radial-gradient(circle at 78% 18%, transparent 0 46px, ${a(20)} 46px 47px)`,
    `repeating-radial-gradient(circle at 14% 82%, transparent 0 62px, ${a(13)} 62px 63px)`,
    `radial-gradient(120% 90% at 50% -20%, ${a(11)} 0%, transparent 62%)`,
  ].join(", "),

  /** A few wide elliptical paths, closer to an orbital diagram than a ripple. */
  orbit: () => [
    `repeating-radial-gradient(ellipse 140% 60% at 50% 30%, transparent 0 84px, ${a(16)} 84px 85px)`,
    `radial-gradient(100% 70% at 50% -12%, ${a(13)} 0%, transparent 58%)`,
  ].join(", "),

  /** Contour lines. Three centres is enough to read as terrain, not as a target. */
  topographic: () => [
    `repeating-radial-gradient(circle at 22% 28%, transparent 0 26px, ${a(17)} 26px 27px)`,
    `repeating-radial-gradient(circle at 74% 62%, transparent 0 34px, ${a(14)} 34px 35px)`,
    `repeating-radial-gradient(circle at 46% 96%, transparent 0 30px, ${a(10)} 30px 31px)`,
  ].join(", "),

  /** Paper grain — the Library's own, at two odd angles. */
  paper: () => [
    `repeating-linear-gradient(37deg, ${ink(3)} 0 1px, transparent 1px 4px)`,
    `repeating-linear-gradient(-53deg, ${ink(2.4)} 0 1px, transparent 1px 7px)`,
    `radial-gradient(110% 70% at 14% -8%, ${a(13)} 0%, transparent 60%)`,
  ].join(", "),

  /** A market grid with one rising trace across it. */
  ledger: () => [
    `repeating-linear-gradient(0deg, ${a(16)} 0 1px, transparent 1px 38px)`,
    `repeating-linear-gradient(90deg, ${a(10)} 0 1px, transparent 1px 38px)`,
    /* The trace: a wide, shallow diagonal band that reads as a trend line. */
    `linear-gradient(74deg, transparent 46%, ${a(24)} 49%, ${a(24)} 50%, transparent 53%)`,
    `radial-gradient(120% 60% at 50% 108%, ${a(14)} 0%, transparent 58%)`,
  ].join(", "),

  /** An abstract skyline: vertical bars of varying height along the foot. */
  skyline: () => [
    `repeating-linear-gradient(90deg, ${a(15)} 0 26px, transparent 26px 44px)`,
    `linear-gradient(0deg, ${a(10)} 0%, transparent 22%)`,
    `radial-gradient(120% 70% at 50% -10%, ${a(11)} 0%, transparent 58%)`,
  ].join(", "),

  /** Cinema curtain: soft vertical folds with light pooling at the centre. */
  curtain: () => [
    `repeating-linear-gradient(90deg, ${a(13)} 0 2px, transparent 2px 34px)`,
    `radial-gradient(90% 120% at 50% 50%, ${a(15)} 0%, transparent 62%)`,
    `linear-gradient(0deg, ${ink(3)} 0%, transparent 26%)`,
  ].join(", "),

  /** Sound: stacked arcs that read as a waveform without animating. */
  waves: () => [
    `repeating-radial-gradient(circle at 50% 128%, transparent 0 40px, ${a(15)} 40px 42px)`,
    `radial-gradient(120% 80% at 24% 8%, ${a(15)} 0%, transparent 56%)`,
    `radial-gradient(110% 70% at 82% 20%, ${a(11)} 0%, transparent 54%)`,
  ].join(", "),

  /** Fog through trees. Soft diagonal bands, nothing hard-edged. */
  mist: () => [
    `linear-gradient(102deg, ${a(12)} 0%, transparent 34%, ${a(8)} 62%, transparent 84%)`,
    `radial-gradient(80% 50% at 76% 6%, ${a(18)} 0%, transparent 58%)`,
    `repeating-linear-gradient(-58deg, ${ink(1.8)} 0 1px, transparent 1px 9px)`,
  ].join(", "),

  /** Stars, used as sparingly as the brief asks: nine of them, all declared. */
  stars: () => {
    const points = [
      [14, 22, 1.2],
      [31, 64, 0.9],
      [47, 12, 1.4],
      [58, 44, 0.8],
      [69, 78, 1.1],
      [77, 26, 0.9],
      [86, 58, 1.3],
      [22, 88, 0.8],
      [92, 14, 1],
    ] as const;
    return [
      ...points.map(
        ([x, y, r]) =>
          `radial-gradient(circle ${r}px at ${x}% ${y}%, ${a(70)} 0%, transparent 100%)`,
      ),
      `radial-gradient(120% 80% at 50% -14%, ${a(12)} 0%, transparent 58%)`,
    ].join(", ");
  },

  /** Fine horizontal lines. A screen, not a movie about screens. */
  scanlines: () => [
    `repeating-linear-gradient(0deg, ${a(11)} 0 1px, transparent 1px 5px)`,
    `radial-gradient(120% 70% at 50% -10%, ${a(13)} 0%, transparent 58%)`,
  ].join(", "),

  /** Bookshelves: horizontal boards with vertical spines standing on them. */
  shelf: () => [
    `repeating-linear-gradient(0deg, ${a(18)} 0 2px, transparent 2px 92px)`,
    `repeating-linear-gradient(90deg, ${a(11)} 0 3px, transparent 3px 13px)`,
    `radial-gradient(100% 60% at 50% 4%, ${a(15)} 0%, transparent 56%)`,
  ].join(", "),

  /** Data: dotted columns. Deliberately vertical, deliberately not falling. */
  dataflow: () => [
    `repeating-linear-gradient(90deg, ${a(16)} 0 1px, transparent 1px 22px)`,
    `repeating-linear-gradient(0deg, ${a(9)} 0 2px, transparent 2px 8px)`,
    `radial-gradient(120% 80% at 50% -12%, ${a(12)} 0%, transparent 60%)`,
  ].join(", "),

  /** Chalk on a board: a dot lattice with faint working lines through it. */
  equations: () => [
    `radial-gradient(circle 1px at 50% 50%, ${a(22)} 0%, transparent 100%)`,
    `repeating-linear-gradient(21deg, ${a(7)} 0 1px, transparent 1px 46px)`,
    `radial-gradient(110% 70% at 18% -8%, ${a(13)} 0%, transparent 58%)`,
  ].join(", "),

  /** Editorial: one wide diagonal and a single rule. Luxury is what is absent. */
  editorial: () => [
    `linear-gradient(108deg, ${a(11)} 0%, transparent 42%)`,
    `linear-gradient(0deg, transparent calc(100% - 1px), ${a(16)} calc(100% - 1px))`,
    `radial-gradient(90% 60% at 86% 4%, ${a(10)} 0%, transparent 54%)`,
  ].join(", "),

  /** Soft lights out of focus — for anything where photographs are the subject. */
  bokeh: () => [
    `radial-gradient(circle 120px at 18% 24%, ${a(16)} 0%, transparent 70%)`,
    `radial-gradient(circle 200px at 78% 16%, ${a(12)} 0%, transparent 70%)`,
    `radial-gradient(circle 160px at 62% 82%, ${a(10)} 0%, transparent 70%)`,
    `radial-gradient(circle 90px at 34% 66%, ${a(9)} 0%, transparent 70%)`,
  ].join(", "),

  /** A bearing: one large ring with a cross through it. */
  compass: () => [
    `repeating-radial-gradient(circle at 84% 14%, transparent 0 70px, ${a(18)} 70px 71px)`,
    `linear-gradient(0deg, transparent 49.9%, ${a(9)} 50%, transparent 50.1%)`,
    `linear-gradient(90deg, transparent 49.9%, ${a(9)} 50%, transparent 50.1%)`,
  ].join(", "),
} as const;

/** The pattern for a motif, with its `background-size` where one is needed. */
export function motifBackground(id: MotifId): { image: string; size?: string } {
  const image = MOTIFS[id]();

  /* Two motifs are built from a single repeating cell rather than from
     full-bleed gradients, so they need a tile size to repeat against. */
  if (id === "equations") return { image, size: "34px 34px, auto, auto" };
  return { image };
}
