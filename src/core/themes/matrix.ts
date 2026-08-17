import { metalAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🟩 The Matrix — Digital.
 *
 * The one theme where restraint matters most: phosphor green is a colour that
 * wants to become a costume. So it is muted well below the film's, used only as
 * the accent, and set on true black with graphite surfaces — a terminal, not a
 * screensaver. No rain, no glyphs, no glow.
 */
export const matrix: MovieTheme = {
  id: "matrix",
  name: "The Matrix",
  subtitle: "Digital",
  description: "Black and dark green, graphite surfaces, a single terminal accent.",
  mood: "Black background with a muted terminal green accent",
  scheme: "dark",
  tokens: {
    background: "#050705",
    surface: "#0d110d",
    surfaceElevated: "#141a14",

    textPrimary: "#dbe6db",
    textSecondary: "#a8b8a8",
    textMuted: "#7d8b7d",

    border: "color-mix(in oklab, #4fbf7f 18%, transparent)",
    borderStrong: "color-mix(in oklab, #4fbf7f 34%, transparent)",

    accent: "#4fbf7f",
    accentHover: "#74d29c",
    accentSubtle: "color-mix(in oklab, #4fbf7f 13%, transparent)",
    accentContrast: "#050705",

    success: "#4fbf7f",
    warning: "#c2a95e",
    danger: "#c46a63",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: metalAtmosphere({ light: "var(--lo-accent)", edge: "#7fbf95" }),
};
