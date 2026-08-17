import { deepAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🌑 DC — Dark Universe.
 *
 * Colder and emptier than Marvel, and darker at the ground. The accent is steel
 * rather than a colour — silver-blue, the light off a rain-slicked street — so
 * the palette carries weight without ever raising its voice.
 */
export const dc: MovieTheme = {
  id: "dc",
  name: "DC",
  subtitle: "Dark Universe",
  description: "Near-black and graphite, lit by steel blue and muted silver.",
  mood: "Near-black background with a steel blue accent",
  scheme: "dark",
  tokens: {
    background: "#08090b",
    surface: "#121417",
    surfaceElevated: "#1a1d22",

    textPrimary: "#eceef1",
    textSecondary: "#c0c5cd",
    textMuted: "#868d97",

    border: "color-mix(in oklab, #7fa3cc 18%, transparent)",
    borderStrong: "color-mix(in oklab, #7fa3cc 34%, transparent)",

    accent: "#7fa3cc",
    accentHover: "#9bb9dc",
    accentSubtle: "color-mix(in oklab, #7fa3cc 13%, transparent)",
    accentContrast: "#08090b",

    success: "#66a189",
    warning: "#c4a163",
    danger: "#c4666a",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: deepAtmosphere({ edge: "#b9c4d2" }),
};
