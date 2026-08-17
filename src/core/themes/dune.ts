import { paperAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/**
 * 🏛️ Dune — Desert.
 *
 * The one light theme in the set, and the reason `scheme` exists on the
 * contract at all. Sand for the page, a warmer sand for the cards, and text in
 * the brown-black of shadow rather than in true black — nothing in a desert is
 * pure black, and a page that uses one reads as a spreadsheet.
 *
 * Bronze does the accenting. No dunes, no photographs, no ornament.
 */
export const dune: MovieTheme = {
  id: "dune",
  name: "Dune",
  subtitle: "Desert",
  description: "Warm sand, shadow-brown type, muted bronze.",
  mood: "Warm sand background with a muted bronze accent",
  scheme: "light",
  tokens: {
    background: "#f1e8d9",
    surface: "#f9f3e8",
    surfaceElevated: "#fdf9f1",

    textPrimary: "#2b2318",
    textSecondary: "#564936",
    /* Darkened from the first pass: `textMuted` becomes
       `--mantine-color-dimmed`, which this codebase uses 280 times, and the
       warmer value it started on only reached 3.4:1 on sand. */
    textMuted: "#6b5e4b",

    border: "rgba(94, 72, 40, 0.18)",
    borderStrong: "rgba(94, 72, 40, 0.34)",

    /* Bronze, taken a step down so text on a filled button clears 4.5:1 —
       a light accent with light text on it is the usual way a warm theme
       fails contrast. */
    accent: "#8a5e28",
    accentHover: "#9f6f34",
    accentSubtle: "rgba(138, 94, 40, 0.12)",
    accentContrast: "#fdf9f1",

    success: "#4f7a52",
    warning: "#9c6f26",
    danger: "#a54b3a",

    /* Barely there. A dark shadow on sand reads as dirt, not depth. */
    shadow: "rgba(94, 72, 40, 0.16)",
  },

  atmosphere: paperAtmosphere({ light: "#fff", fill: "var(--lo-accent)", edge: "#fff", grain: 3 }),
};
