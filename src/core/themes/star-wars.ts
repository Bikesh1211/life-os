import { deepAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🌠 Star Wars — Galactic.
 *
 * The blue is a sabre held a long way off: muted well past the film's own, and
 * used once per screen. Everything else is the black between things.
 */
export const starWars: MovieTheme = {
  id: "star-wars",
  name: "Star Wars",
  subtitle: "Galactic",
  description: "Near-black and charcoal, a muted blue, soft white type.",
  mood: "Near-black background with a muted blue accent",
  scheme: "dark",
  tokens: {
    background: "#0a0a0c",
    surface: "#141518",
    surfaceElevated: "#1c1e22",

    textPrimary: "#f2f3f5",
    textSecondary: "#c4c8ce",
    textMuted: "#888d95",

    border: "color-mix(in oklab, #7fa9d6 18%, transparent)",
    borderStrong: "color-mix(in oklab, #7fa9d6 34%, transparent)",

    accent: "#7fa9d6",
    accentHover: "#9cbfe4",
    accentSubtle: "color-mix(in oklab, #7fa9d6 13%, transparent)",
    accentContrast: "#0a0a0c",

    success: "#6aa88f",
    warning: "#cfa860",
    danger: "#cc6259",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: deepAtmosphere({}),
};
