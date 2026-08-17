import { metalAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🦸 Marvel — Superhero.
 *
 * Charcoal, and one red doing all the shouting. The metallic note is in the
 * edge rather than the fill: hairlines and highlights are cool steel, which is
 * what keeps a red this saturated from reading as an alert banner.
 */
export const marvel: MovieTheme = {
  id: "marvel",
  name: "Marvel",
  subtitle: "Superhero",
  description: "Charcoal and deep red, with muted blue and a metallic hairline.",
  mood: "Charcoal background with a deep red accent",
  scheme: "dark",
  tokens: {
    background: "#111214",
    surface: "#191b1f",
    surfaceElevated: "#212429",

    textPrimary: "#f1f2f4",
    textSecondary: "#c3c7ce",
    textMuted: "#8b919b",

    border: "color-mix(in oklab, #e0555c 18%, transparent)",
    borderStrong: "color-mix(in oklab, #e0555c 34%, transparent)",

    accent: "#e0555c",
    accentHover: "#ec7178",
    accentSubtle: "color-mix(in oklab, #e0555c 13%, transparent)",
    accentContrast: "#111214",

    success: "#5aa88c",
    warning: "#d6a45a",
    danger: "#e0555c",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: metalAtmosphere({ light: "var(--lo-accent)", edge: "#c8d0dc" }),
};
