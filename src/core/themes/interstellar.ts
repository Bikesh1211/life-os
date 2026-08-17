import { deepAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/**
 * 🌌 Interstellar — Cosmic.
 *
 * Navy that has been left out in the cold, and one blue that is doing all the
 * work. The restraint is the reference: the film's palette is almost entirely
 * greys and blacks with light used sparingly, and the accent here is used the
 * same way — a single muted blue that never appears twice on one screen if it
 * can be helped.
 *
 * No stars, no planets, no galaxy. The atmosphere comes from the ground being
 * cold and the type being quiet.
 */
export const interstellar: MovieTheme = {
  id: "interstellar",
  name: "Interstellar",
  subtitle: "Cosmic",
  description: "Cold navy, soft grey surfaces, one restrained blue.",
  mood: "Deep navy background with a muted blue accent",
  scheme: "dark",
  tokens: {
    background: "#0a0e16",
    surface: "#111825",
    surfaceElevated: "#182031",

    textPrimary: "#e7edf6",
    textSecondary: "#b2bfd1",
    textMuted: "#7c8a9e",

    border: "rgba(140, 172, 214, 0.14)",
    borderStrong: "rgba(140, 172, 214, 0.3)",

    accent: "#6f9fd8",
    accentHover: "#8bb6e8",
    accentSubtle: "rgba(111, 159, 216, 0.13)",
    accentContrast: "#06101c",

    success: "#4f9d87",
    warning: "#d8a45c",
    danger: "#cf6a5f",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: deepAtmosphere(),
};
