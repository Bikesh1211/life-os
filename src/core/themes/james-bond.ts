import { metalAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🥂 James Bond — 007.
 *
 * Black tie. Neutral black, charcoal surfaces and champagne on the edges —
 * warmer than Gotham's steel and colder than the Library's candlelight, which
 * is the whole distance between a dinner jacket and a library.
 */
export const jamesBond: MovieTheme = {
  id: "bond",
  name: "James Bond",
  subtitle: "007",
  description: "Black and charcoal, with champagne gold and a tailored edge.",
  mood: "Black background with a champagne gold accent",
  scheme: "dark",
  tokens: {
    background: "#0a0a0a",
    surface: "#141414",
    surfaceElevated: "#1c1c1c",

    textPrimary: "#f0efec",
    textSecondary: "#c4c2bc",
    textMuted: "#8c8a84",

    border: "color-mix(in oklab, #cbb27c 18%, transparent)",
    borderStrong: "color-mix(in oklab, #cbb27c 34%, transparent)",

    accent: "#cbb27c",
    accentHover: "#dcc79a",
    accentSubtle: "color-mix(in oklab, #cbb27c 13%, transparent)",
    accentContrast: "#0a0a0a",

    success: "#69a68b",
    warning: "#cbb27c",
    danger: "#c26a62",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: metalAtmosphere({ light: "var(--lo-accent)", edge: "#d8c9a4" }),
};
