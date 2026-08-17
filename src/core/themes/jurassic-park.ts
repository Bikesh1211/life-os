import { paperAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🦕 Jurassic Park — Wilderness.
 *
 * Jungle at dusk. Amber does the accenting — the colour of the film's own
 * signage and of the thing in the walking stick — against green and dark olive.
 * Warmer and wetter than Middle-earth, which is the only thing separating two
 * themes that would otherwise be the same idea.
 */
export const jurassicPark: MovieTheme = {
  id: "jurassic-park",
  name: "Jurassic Park",
  subtitle: "Wilderness",
  description: "Deep forest green and charcoal, cut with muted amber.",
  mood: "Deep forest green background with a muted amber accent",
  scheme: "dark",
  tokens: {
    background: "#0d1210",
    surface: "#141a16",
    surfaceElevated: "#1c231d",

    textPrimary: "#e9ece7",
    textSecondary: "#bfc5bc",
    textMuted: "#8b9389",

    border: "color-mix(in oklab, #d9a441 18%, transparent)",
    borderStrong: "color-mix(in oklab, #d9a441 34%, transparent)",

    accent: "#d9a441",
    accentHover: "#e7bb69",
    accentSubtle: "color-mix(in oklab, #d9a441 13%, transparent)",
    accentContrast: "#0d1210",

    success: "#5fa377",
    warning: "#d9a441",
    danger: "#c4685a",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: paperAtmosphere({ light: "var(--lo-accent)", fill: "#2f5c3d", grain: 2 }),
};
