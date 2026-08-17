import { paperAtmosphere } from "./atmospheres";
import type { MovieTheme } from "./types";

/**
 * 🪄 Harry Potter — Wizarding.
 *
 * Not a new palette: this *is* the Library's reading room, promoted to a theme.
 * Every colour below reads `--hp-*`, which globals.css declares once and which
 * `/library`'s own `.lb` scope reads from the same place. That indirection is
 * the whole point — the reading room and the theme cannot drift, because there
 * is one set of numbers and two consumers.
 *
 * Which also means `/library` looks exactly as it did before this feature
 * existed, under this theme and under every other one. The room keeps its own
 * light the way Explore Mode keeps its brass; selecting Harry Potter spreads
 * that light to the rest of the application rather than changing the room.
 *
 * Deep ink-blue ground, warm gold accent, parchment text. The magic is in the
 * palette and nothing else — no wands, no particles, no Hogwarts crest. It has
 * to survive being looked at for eight hours.
 */
export const harryPotter: MovieTheme = {
  id: "harry-potter",
  name: "Harry Potter",
  subtitle: "Wizarding",
  description: "Deep navy and burgundy, antique gold — the Library's own light.",
  mood: "Deep navy background with an antique gold accent",
  scheme: "dark",
  tokens: {
    background: "var(--hp-bg)",
    surface: "var(--hp-surface)",
    surfaceElevated: "var(--hp-card)",

    textPrimary: "var(--hp-fg)",
    /* Between parchment and muted: the Library has no such step, so it is
       mixed rather than invented, which keeps it on the same line. */
    textSecondary: "color-mix(in oklab, var(--hp-fg) 72%, var(--hp-muted))",
    textMuted: "var(--hp-muted)",

    border: "var(--hp-border)",
    borderStrong: "color-mix(in oklab, var(--hp-gold) 34%, transparent)",

    accent: "var(--hp-primary)",
    accentHover: "color-mix(in oklab, var(--hp-gold) 78%, white)",
    accentSubtle: "color-mix(in oklab, var(--hp-gold) 12%, transparent)",
    /* Gold is a light accent, so what sits on it is the ink, not the page. */
    accentContrast: "var(--hp-ink)",

    /* The house colours, pulled far enough forward to read as status on a dark
       ground — an emerald that works as a background does not work as a tick. */
    success: "color-mix(in oklab, var(--hp-emerald) 70%, #7fd8b8)",
    warning: "var(--hp-candle)",
    /* Burgundy rather than a plain red — it is one of the three colours the
       house palette is built from, and it does its work here. */
    danger: "#c25b6b",

    shadow: "rgba(0, 0, 0, 0.55)",
  },

  /*
   * Candlelight on parchment — and the model the whole `paper` family was
   * extracted from. `grain(2)` is `.paper` in `library.module.css`, so what the
   * rest of the application gets here is not an approximation of the Library's
   * texture; it is the same two gradients at the same two angles.
   */
  atmosphere: paperAtmosphere({
    light: "var(--hp-candle)",
    fill: "var(--hp-gold)",
    edge: "var(--hp-gold)",
    grain: 2,
  }),
};
