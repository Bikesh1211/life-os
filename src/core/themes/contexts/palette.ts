import type { ThemeTokens } from "../types";
import { AA, contrast, ensureContrast, readableOn } from "./contrast";

/**
 * A complete environment from five authored colours.
 *
 * The Library is not a tint. It is a *room* — its own ground, its own paper,
 * its own ink, its own gold — and that is the difference between a theme and an
 * experience. Giving thirty-one features that treatment means thirty-one full
 * palettes, and hand-authoring sixteen tokens each would be four hundred and
 * ninety-six values nobody could keep coherent.
 *
 * So each context authors the five that carry its identity — the ground, two
 * surfaces above it, the ink and the accent — and everything else is derived
 * from them here. Derivation is not a shortcut: it is what guarantees that
 * secondary text is always exactly one step quieter than primary, that every
 * border tints from the accent rather than being a grey nobody chose, and that
 * no combination in any of the thirty-one rooms falls below AA.
 */
export interface ContextPalette {
  /** The furthest-back surface: the page itself. */
  background: string;
  /** Cards and panels. */
  surface: string;
  /** Menus, popovers, raised things. */
  surfaceElevated: string;
  /** The colour text is written in. */
  ink: string;
  /** The one colour the room is identified by. */
  accent: string;
}

/**
 * Mixes two hex colours. Written here rather than left to `color-mix()` because
 * these values are checked for contrast at build time, and a CSS function
 * cannot be measured until it reaches a browser.
 */
function mix(a: string, b: string, amount: number): string {
  const parse = (h: string) =>
    [0, 2, 4].map((i) => Number.parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const [x, y] = [parse(a), parse(b)];
  const out = x.map((c, i) => Math.round(c + (y[i] - c) * amount));
  return `#${out.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** A translucent tint, for hairlines and washes where opacity is wanted. */
function alpha(hex: string, value: number): string {
  const [r, g, b] = [0, 2, 4].map((i) =>
    Number.parseInt(hex.replace("#", "").slice(i, i + 2), 16),
  );
  return `rgba(${r}, ${g}, ${b}, ${value})`;
}

export function derivePalette(p: ContextPalette, scheme: "light" | "dark"): ThemeTokens {
  const dark = scheme === "dark";
  /* Which way "quieter" goes. On a dark ground, text fades toward the ground;
     on a light one it does the same — so both simply mix toward the background,
     and the direction takes care of itself. */
  const toward = p.background;

  /* Each step is measured, not guessed: `ensureContrast` pulls a value back
     toward legibility if the mix took it too far. Secondary aims at the same
     4.5:1 body-text bar as primary because it *is* body text in most of this
     application; muted is allowed down to 4.5 as well, since Mantine uses it
     for real prose and not only for labels. */
  const textPrimary = ensureContrast(p.ink, p.surface, AA);
  const textSecondary = ensureContrast(mix(p.ink, toward, 0.26), p.surface, AA);
  const textMuted = ensureContrast(mix(p.ink, toward, 0.44), p.surface, AA);

  const accent = ensureContrast(p.accent, p.surface, AA);
  const accentHover = ensureContrast(mix(accent, dark ? "#ffffff" : "#000000", 0.22), p.surface, 3);

  return {
    background: p.background,
    surface: p.surface,
    surfaceElevated: p.surfaceElevated,

    textPrimary,
    textSecondary,
    textMuted,

    /* Borders tint from the accent rather than from grey. It is a small thing
       and it is most of why the Library's hairlines read as gold leaf and not
       as a table rule. */
    border: alpha(accent, dark ? 0.18 : 0.22),
    borderStrong: alpha(accent, dark ? 0.34 : 0.4),

    accent,
    accentHover,
    accentSubtle: alpha(accent, dark ? 0.13 : 0.11),
    accentContrast: readableOn(accent),

    /* Status keeps its meaning and takes the room's temperature: each is mixed
       a little toward the accent so a success tick in the wizarding library is
       a *warm* green, then pulled back if the mix cost it legibility. */
    success: ensureContrast(mix(dark ? "#5fbf8f" : "#3f7a58", accent, 0.16), p.surface, 3),
    warning: ensureContrast(mix(dark ? "#d9a441" : "#9c6f26", accent, 0.16), p.surface, 3),
    danger: ensureContrast(mix(dark ? "#d0655c" : "#a54b3a", accent, 0.12), p.surface, 3),

    shadow: dark ? "rgba(0, 0, 0, 0.62)" : alpha(mix(p.ink, "#000000", 0.3), 0.16),
  };
}

/** Every check a derived palette has to pass, for the build-time audit. */
export function auditPalette(t: ThemeTokens): { label: string; ratio: number; min: number }[] {
  return [
    { label: "textPrimary/background", ratio: contrast(t.textPrimary, t.background), min: AA },
    { label: "textPrimary/surface", ratio: contrast(t.textPrimary, t.surface), min: AA },
    { label: "textPrimary/elevated", ratio: contrast(t.textPrimary, t.surfaceElevated), min: AA },
    { label: "textSecondary/surface", ratio: contrast(t.textSecondary, t.surface), min: AA },
    { label: "textMuted/background", ratio: contrast(t.textMuted, t.background), min: AA },
    { label: "textMuted/surface", ratio: contrast(t.textMuted, t.surface), min: AA },
    { label: "textMuted/elevated", ratio: contrast(t.textMuted, t.surfaceElevated), min: AA },
    { label: "accent/surface", ratio: contrast(t.accent, t.surface), min: AA },
    { label: "accent/background", ratio: contrast(t.accent, t.background), min: 3 },
    { label: "onAccent", ratio: contrast(t.accentContrast, t.accent), min: AA },
    { label: "success/surface", ratio: contrast(t.success, t.surface), min: 3 },
    { label: "warning/surface", ratio: contrast(t.warning, t.surface), min: 3 },
    { label: "danger/surface", ratio: contrast(t.danger, t.surface), min: 3 },
  ];
}
