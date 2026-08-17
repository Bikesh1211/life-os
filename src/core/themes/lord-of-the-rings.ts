import { paperAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/*
 * 🗡️ The Lord of the Rings — Middle-earth.
 *
 * Green so dark it reads as brown at the corners, with gold used the way the
 * films use it: sparingly, and on an edge. The grain is canvas and map paper,
 * the same treatment the Library uses for parchment.
 */
export const lordOfTheRings: MovieTheme = {
  id: "lotr",
  name: "Lord of the Rings",
  subtitle: "Middle-earth",
  description: "Forest green and dark brown, with antique gold on the edges.",
  mood: "Dark forest green background with an antique gold accent",
  scheme: "dark",
  tokens: {
    background: "#0e120e",
    surface: "#161b16",
    surfaceElevated: "#1e241d",

    textPrimary: "#ece7db",
    textSecondary: "#c3bdad",
    textMuted: "#948d7d",

    border: "color-mix(in oklab, #c9a961 18%, transparent)",
    borderStrong: "color-mix(in oklab, #c9a961 34%, transparent)",

    accent: "#c9a961",
    accentHover: "#dcc084",
    accentSubtle: "color-mix(in oklab, #c9a961 13%, transparent)",
    accentContrast: "#0e120e",

    success: "#63a37c",
    warning: "#c9a961",
    danger: "#c06a56",

    shadow: "rgba(0, 0, 0, 0.6)",
  },

  atmosphere: paperAtmosphere({ light: "var(--lo-accent)", fill: "#3d6b45", grain: 2.2 }),
};
