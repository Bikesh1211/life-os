import { metalAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/**
 * 🦇 Dark Knight — Gotham.
 *
 * Almost black, and the accent is not a colour so much as a temperature: steel,
 * blue-grey, the light off wet concrete. The one thing this theme spends is
 * *contrast* — the text sits harder against its ground than anywhere else in
 * the set, which is what makes it feel disciplined rather than merely dark.
 *
 * No bat, no logo, no comic. A serious room to work in.
 */
export const darkKnight: MovieTheme = {
  id: "dark-knight",
  name: "Dark Knight",
  subtitle: "Gotham",
  description: "Near-black charcoal, steel accent, hard type.",
  mood: "Almost black background with a steel blue-grey accent",
  scheme: "dark",
  tokens: {
    background: "#08090a",
    surface: "#121316",
    surfaceElevated: "#1b1d21",

    /* Brighter than the other dark themes on purpose — this is the high
       contrast the reference is built on. */
    textPrimary: "#f4f5f7",
    textSecondary: "#c3c7cd",
    textMuted: "#83878e",

    /* Neutral rather than tinted: a coloured hairline would warm a room whose
       whole character is that it is not warm. */
    border: "rgba(255, 255, 255, 0.09)",
    borderStrong: "rgba(255, 255, 255, 0.2)",

    accent: "#8fa4ba",
    accentHover: "#abbdd0",
    accentSubtle: "rgba(143, 164, 186, 0.13)",
    accentContrast: "#08090a",

    success: "#6aa88f",
    warning: "#c9a46a",
    danger: "#c96a63",

    shadow: "rgba(0, 0, 0, 0.7)",
  },

  atmosphere: metalAtmosphere({ edge: "#fff" }),
};
