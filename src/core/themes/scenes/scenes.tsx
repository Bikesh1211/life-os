import {
  BlueprintGrid,
  Circuitry,
  Compass,
  Contours,
  Curtain,
  DossierMarks,
  Dust,
  Equations,
  GothicArches,
  MarketChart,
  NodeNetwork,
  Orbits,
  PaperLines,
  Racks,
  Rain,
  Ridgeline,
  RingRopes,
  Shelves,
  Skyline,
  SoundWaves,
  StarField,
  SurveyMarks,
} from "./elements";

/**
 * The environments.
 *
 * A scene is a *place*, assembled from the element library: what is in the
 * room, where the light comes from, and what the air is like. Eighteen of them
 * cover the whole application, mapped to contexts in `index.ts`.
 *
 * Each returns two things — the SVG drawing, and a light source described as a
 * CSS gradient. Splitting them matters: the drawing scales with the viewport
 * inside one `preserveAspectRatio="slice"` SVG, while the light has to stay
 * anchored to a corner of the screen regardless of that scaling, the way a lamp
 * does not move when you step back from a desk.
 *
 * No scene loads an image. Every one of them is drawing instructions, so the
 * whole system costs one composited layer and no requests, re-tints itself from
 * the context palette, and is sharp at any size.
 */

export interface Scene {
  /** The drawing, in the 1000×600 scene space. */
  art: React.ReactNode;
  /**
   * Where the light falls, as one or more CSS gradients. Painted under the
   * drawing so the scene sits *in* the light rather than on top of it.
   */
  light: string;
}

/** Shorthand for a soft pool of light at a point. */
const pool = (x: string, y: string, size: string, strength: number) =>
  `radial-gradient(${size} at ${x} ${y}, color-mix(in oklab, var(--scene-accent) ${strength}%, transparent) 0%, transparent 68%)`;

export const SCENES: Record<string, () => Scene> = {
  /* ── A magical private library ─────────────────────────────────────── */
  library: () => ({
    art: (
      <>
        <Shelves />
        <Dust count={26} />
      </>
    ),
    light: pool("14%", "-6%", "58rem circle", 16),
  }),

  /* ── An enormous old library at night ──────────────────────────────── */
  reading: () => ({
    art: (
      <>
        <Shelves opacity={0.42} />
        <Dust count={18} />
      </>
    ),
    light: `${pool("50%", "-10%", "52rem circle", 13)}, ${pool("86%", "70%", "34rem circle", 8)}`,
  }),

  /* ── An explorer's field journal ───────────────────────────────────── */
  expedition: () => ({
    art: (
      <>
        <Ridgeline />
        <Contours />
        <SurveyMarks />
        <Compass />
      </>
    ),
    light: `${pool("18%", "-8%", "50rem circle", 14)}, ${pool("88%", "16%", "30rem circle", 9)}`,
  }),

  /* ── A classified mission dossier ──────────────────────────────────── */
  dossier: () => ({
    art: (
      <>
        <BlueprintGrid opacity={0.6} />
        <DossierMarks />
      </>
    ),
    light: pool("50%", "-12%", "60rem ellipse", 11),
  }),

  /* ── A high-tech engineering bench ─────────────────────────────────── */
  workshop: () => ({
    art: (
      <>
        <BlueprintGrid step={64} opacity={0.3} />
        <Circuitry />
      </>
    ),
    light: `${pool("22%", "-8%", "46rem circle", 13)}, ${pool("82%", "84%", "36rem circle", 9)}`,
  }),

  /* ── A gothic cloister under moonlight ─────────────────────────────── */
  nightfall: () => ({
    art: (
      <>
        <GothicArches />
        <Dust count={16} />
      </>
    ),
    light: `${pool("82%", "-6%", "44rem circle", 15)}, ${pool("20%", "88%", "38rem circle", 7)}`,
  }),

  /* ── A dark luxury interior ────────────────────────────────────────── */
  continental: () => ({
    art: <BlueprintGrid step={110} opacity={0.22} />,
    light: `${pool("50%", "0%", "48rem ellipse", 10)}`,
  }),

  /* ── A private Wall Street office ──────────────────────────────────── */
  exchange: () => ({
    art: (
      <>
        <MarketChart />
        <Skyline />
      </>
    ),
    light: `${pool("50%", "-10%", "56rem ellipse", 12)}, ${pool("12%", "78%", "34rem circle", 7)}`,
  }),

  /* ── Spacetime ─────────────────────────────────────────────────────── */
  spacetime: () => ({
    art: (
      <>
        <StarField />
        <Orbits />
      </>
    ),
    light: `${pool("50%", "22%", "60rem circle", 13)}, ${pool("84%", "-6%", "30rem circle", 8)}`,
  }),

  /* ── A cosmic mixtape ──────────────────────────────────────────────── */
  cosmos: () => ({
    art: (
      <>
        <StarField count={34} opacity={0.5} />
        <SoundWaves />
      </>
    ),
    light: `${pool("28%", "8%", "46rem circle", 15)}, ${pool("78%", "72%", "40rem circle", 11)}`,
  }),

  /* ── A private cinema ──────────────────────────────────────────────── */
  cinema: () => ({
    art: <Curtain />,
    light: `${pool("50%", "42%", "54rem ellipse", 14)}`,
  }),

  /* ── A digital knowledge network ───────────────────────────────────── */
  construct: () => ({
    art: <NodeNetwork />,
    light: pool("50%", "-10%", "56rem ellipse", 12),
  }),

  /* ── A training room ───────────────────────────────────────────────── */
  gym: () => ({
    art: (
      <>
        <RingRopes />
        <BlueprintGrid step={96} opacity={0.18} />
      </>
    ),
    light: `${pool("50%", "-14%", "50rem ellipse", 12)}`,
  }),

  /* ── A cinematic city, after rain ──────────────────────────────────── */
  offworld: () => ({
    art: (
      <>
        <Skyline opacity={0.4} />
        <Rain />
      </>
    ),
    light: `${pool("74%", "18%", "36rem circle", 15)}, ${pool("20%", "44%", "30rem circle", 10)}`,
  }),

  /* ── A box of photographs ──────────────────────────────────────────── */
  keepsake: () => ({
    art: (
      <>
        <PaperLines />
        <Dust count={14} />
      </>
    ),
    light: pool("22%", "-6%", "46rem circle", 13),
  }),

  /* ── An observatory, and the working that led here ─────────────────── */
  observatory: () => ({
    art: (
      <>
        <Equations />
        <StarField count={24} opacity={0.4} />
      </>
    ),
    light: `${pool("18%", "-6%", "44rem circle", 12)}, ${pool("80%", "20%", "30rem circle", 8)}`,
  }),

  /* ── A desk with papers on it ──────────────────────────────────────── */
  desk: () => ({
    art: (
      <>
        <PaperLines opacity={0.32} />
        <NodeNetwork count={14} opacity={0.26} />
      </>
    ),
    light: pool("26%", "-4%", "44rem circle", 12),
  }),

  /* ── A fashion studio ──────────────────────────────────────────────── */
  atelier: () => ({
    art: <Racks />,
    light: `${pool("50%", "-8%", "52rem ellipse", 11)}`,
  }),

  /* ── Dark glass ────────────────────────────────────────────────────── */
  glass: () => ({
    art: <BlueprintGrid step={140} opacity={0.2} />,
    light: pool("50%", "-14%", "46rem ellipse", 9),
  }),
};

export type SceneId = keyof typeof SCENES;
