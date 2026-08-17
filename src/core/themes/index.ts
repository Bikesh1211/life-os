import { darkKnight } from "./dark-knight";
import { dc } from "./dc";
import { dune } from "./dune";
import { harryPotter } from "./harry-potter";
import { interstellar } from "./interstellar";
import { jamesBond } from "./james-bond";
import { jurassicPark } from "./jurassic-park";
import { lordOfTheRings } from "./lord-of-the-rings";
import { marvel } from "./marvel";
import { matrix } from "./matrix";
import { starWars } from "./star-wars";
import type { MovieTheme, ThemeId } from "./types";

export type {
  MovieTheme,
  ThemeAtmosphere,
  ThemeDepth,
  ThemeId,
  ThemeScheme,
  ThemeTokens,
} from "./types";
export { DEPTH_STORAGE_KEY, THEME_STORAGE_KEY } from "./types";

/** The setting a browser with no stored preference gets. */
export const DEFAULT_DEPTH = "full" as const;

export function isDepth(value: unknown): value is import("./types").ThemeDepth {
  return value === "full" || value === "palette";
}

/**
 * Every theme that has been written.
 *
 * Authored is not the same as shipped — see `RELEASED` below. A theme in the
 * catalogue but not in the release costs nothing: it is a typed object nobody
 * imports, its CSS is never generated, and promoting it later is one line.
 */
const CATALOGUE: MovieTheme[] = [
  harryPotter,
  marvel,
  dc,
  interstellar,
  starWars,
  lordOfTheRings,
  dune,
  jurassicPark,
  matrix,
  jamesBond,
  /* Written and held back: Gotham is close enough to DC's near-black and to
     Bond's neutral charcoal that shipping all three at once would make the
     grid look like it repeats itself. */
  darkKnight,
];

/**
 * What ships, and in what order.
 *
 * The order is the order of the grid, and it alternates deliberately rather
 * than grouping: two dark-blue themes side by side read as one theme rendered
 * twice, so warm and cool take turns.
 *
 * Adding a theme to the release is adding its id to this list. Nothing else in
 * the application knows a theme by name — the settings grid maps over it, the
 * stylesheet is generated from it, and every component is painted through the
 * token bridge below.
 */
const RELEASED: ThemeId[] = [
  "harry-potter",
  "marvel",
  "dc",
  "interstellar",
  "star-wars",
  "lotr",
  "dune",
  "jurassic-park",
  "matrix",
  "bond",
];

const CATALOGUE_BY_ID = new Map(CATALOGUE.map((theme) => [theme.id, theme]));

export const MOVIE_THEMES: MovieTheme[] = RELEASED.map((id) => {
  const theme = CATALOGUE_BY_ID.get(id);
  // A released id with no theme behind it would ship an empty grid cell and a
  // selectable option that paints nothing. Better to fail at import.
  if (!theme) throw new Error(`Released theme "${id}" is not in the catalogue`);
  return theme;
});

const BY_ID = new Map(MOVIE_THEMES.map((theme) => [theme.id, theme]));

export function themeById(id: string): MovieTheme | undefined {
  return BY_ID.get(id as ThemeId);
}

export function isThemeId(value: unknown): value is ThemeId {
  return value === "default" || (typeof value === "string" && BY_ID.has(value as ThemeId));
}

/* ── The bridge ──────────────────────────────────────────────────────────── */

/**
 * Fourteen tokens, painted onto the variables the application already reads.
 *
 * This function is the entire reason no component had to change. Life OS is
 * built on Mantine and Tailwind, and both resolve their colours through CSS
 * custom properties at *use* time — so a page that writes
 * `text-[var(--mantine-color-dimmed)]` is already asking a variable what colour
 * it is. Redefining that variable under a `[data-movie-theme]` selector
 * repaints every one of those call sites at once, with no provider, no context
 * read, and no re-render.
 *
 * The mapping was not guessed. Counting the variables the codebase actually
 * uses gives a clear shape: `--mantine-color-dimmed` (280 uses),
 * `--mantine-color-dark-6` (163), `--mantine-color-text` (139),
 * `--border-subtle` (92). Those four plus their neighbours are what a theme has
 * to own; everything else follows from them.
 *
 * Two deliberate omissions. Mantine's *semantic* palettes beyond the status
 * trio — violet, cyan, teal, orange — are left alone, because a chart series or
 * a category chip that means "violet" should keep meaning it under every theme.
 * And nothing here touches `--lb-*`: the Library keeps its own light.
 */
export function bridgeVariables(theme: MovieTheme): Record<string, string> {
  const t = theme.tokens;
  return {
    ...tailwindPalette(theme),

    /* ── The contract itself, for anything that wants to opt in directly ── */
    "--lo-background": t.background,
    "--lo-surface": t.surface,
    "--lo-surface-elevated": t.surfaceElevated,
    "--lo-text-primary": t.textPrimary,
    "--lo-text-secondary": t.textSecondary,
    "--lo-text-muted": t.textMuted,
    "--lo-border": t.border,
    "--lo-border-strong": t.borderStrong,
    "--lo-accent": t.accent,
    "--lo-accent-hover": t.accentHover,
    "--lo-accent-subtle": t.accentSubtle,
    "--lo-accent-contrast": t.accentContrast,
    "--lo-success": t.success,
    "--lo-warning": t.warning,
    "--lo-danger": t.danger,
    "--lo-shadow": t.shadow,

    /* ── Mantine's core semantics ───────────────────────────────────────── */
    "--mantine-color-body": t.background,
    "--mantine-color-text": t.textPrimary,
    "--mantine-color-dimmed": t.textMuted,
    "--mantine-color-default": t.surface,
    "--mantine-color-default-hover": t.surfaceElevated,
    "--mantine-color-default-color": t.textPrimary,
    "--mantine-color-default-border": t.border,
    "--mantine-color-placeholder": t.textMuted,
    "--mantine-color-anchor": t.accent,
    "--mantine-color-error": t.danger,

    /* ── The primary colour, in every form Mantine asks for it ──────────── */
    "--mantine-primary-color-filled": t.accent,
    "--mantine-primary-color-filled-hover": t.accentHover,
    "--mantine-primary-color-light": t.accentSubtle,
    "--mantine-primary-color-light-hover": t.accentSubtle,
    "--mantine-primary-color-light-color": t.accent,
    "--mantine-primary-color-contrast": t.accentContrast,

    /*
     * The dark scale, which in this codebase is not a scale at all.
     *
     * 163 call sites write `bg-[var(--mantine-color-dark-6,#1a1b1e)]` and mean
     * "a card". Mantine's `dark` ramp runs light-to-dark, so 0–3 are text, 4 is
     * where a border lands, and 5–9 are surfaces. Mapping it that way is what
     * carries the long tail of hand-styled panels across without touching them.
     */
    "--mantine-color-dark-0": t.textPrimary,
    "--mantine-color-dark-1": t.textSecondary,
    "--mantine-color-dark-2": t.textSecondary,
    "--mantine-color-dark-3": t.textMuted,
    "--mantine-color-dark-4": t.border,
    "--mantine-color-dark-5": t.surfaceElevated,
    "--mantine-color-dark-6": t.surface,
    "--mantine-color-dark-7": t.surface,
    "--mantine-color-dark-8": t.background,
    "--mantine-color-dark-9": t.background,

    /* The same shape for the grey ramp, which the light-mode surfaces use. */
    "--mantine-color-gray-0": t.surfaceElevated,
    "--mantine-color-gray-1": t.surface,
    "--mantine-color-gray-2": t.border,
    "--mantine-color-gray-3": t.border,
    "--mantine-color-gray-4": t.textMuted,
    "--mantine-color-gray-5": t.textMuted,
    "--mantine-color-gray-6": t.textSecondary,
    "--mantine-color-gray-7": t.textSecondary,
    "--mantine-color-gray-8": t.textPrimary,
    "--mantine-color-gray-9": t.textPrimary,

    /* ── Accent ramps ───────────────────────────────────────────────────── */
    "--mantine-color-brand-light": t.accentSubtle,
    "--mantine-color-brand-filled": t.accent,
    "--mantine-color-brand-filled-hover": t.accentHover,
    "--mantine-color-brand-4": t.accentHover,
    "--mantine-color-brand-5": t.accent,
    "--mantine-color-brand-6": t.accent,
    "--mantine-color-brand-7": t.accentHover,
    "--mantine-color-blue-0": t.accentSubtle,
    "--mantine-color-blue-4": t.accentHover,
    "--mantine-color-blue-5": t.accent,
    "--mantine-color-blue-6": t.accent,
    "--mantine-color-blue-8": t.accentHover,
    "--mantine-color-blue-light": t.accentSubtle,
    "--mantine-color-blue-filled": t.accent,

    /* ── Status. Still red, green and amber — just this theme's. ────────── */
    "--mantine-color-green-5": t.success,
    "--mantine-color-green-6": t.success,
    "--mantine-color-green-filled": t.success,
    "--mantine-color-yellow-5": t.warning,
    "--mantine-color-yellow-6": t.warning,
    "--mantine-color-yellow-8": t.warning,
    "--mantine-color-yellow-filled": t.warning,
    "--mantine-color-red-5": t.danger,
    "--mantine-color-red-6": t.danger,
    "--mantine-color-red-filled": t.danger,

    /* ── Life OS's own, from globals.css ────────────────────────────────── */
    "--surface-card": t.surface,
    "--surface-muted": t.surfaceElevated,
    "--border-subtle": t.border,
    "--color-body": t.background,

    /* ── Depth ──────────────────────────────────────────────────────────── */
    "--shadow-card": `0 1px 3px 0 ${t.shadow}`,
    "--shadow-card-hover": `0 10px 25px -5px ${t.shadow}, 0 4px 10px -6px ${t.shadow}`,
    "--shadow-dark-card": `0 1px 3px 0 ${t.shadow}`,
    "--shadow-dark-card-hover": `0 10px 25px -5px ${t.shadow}, 0 4px 10px -6px ${t.shadow}`,
    "--shadow-modal": `0 25px 50px -12px ${t.shadow}`,
    "--shadow-dark-modal": `0 25px 50px -12px ${t.shadow}`,
    "--shadow-sidebar": `4px 0 24px 0 ${t.shadow}`,
    "--shadow-dark-sidebar": `4px 0 24px 0 ${t.shadow}`,
  };
}

/**
 * Tailwind's own palette, re-tinted.
 *
 * The other half of why nothing had to be rewritten. 496 utilities across 50
 * files are hardcoded to Tailwind's ramps — `text-gray-400` alone appears 65
 * times — and none of them would have followed a theme. But Tailwind v4
 * compiles `text-gray-400` to `color: var(--color-gray-400)` and declares that
 * variable inside `@layer theme`, so redefining it from an unlayered rule wins
 * outright: unlayered CSS beats every layer regardless of specificity.
 *
 * The neutral ramp keeps its *direction* — 50 lightest, 950 darkest — and only
 * its hues change, which is what makes the remap safe. In a dark theme the
 * light end is text and the dark end is surfaces; in a light theme it is the
 * other way round. That is exactly how the ramp was already being used, so
 * `text-gray-400` stays muted text and `bg-gray-800` stays a panel under both.
 *
 * `violet`, `pink`, `teal`, `cyan`, `rose` and `purple` are deliberately left
 * alone. They are category and chart colours, where the specific hue is the
 * information — a habit chip that means "violet" should mean it under every
 * theme.
 */
function tailwindPalette(theme: MovieTheme): Record<string, string> {
  const t = theme.tokens;
  const dark = theme.scheme === "dark";

  /* Light end → dark end. Reading the two arrays side by side is the clearest
     statement of what "re-tinted, same direction" means. */
  const neutral = dark
    ? [
        t.textPrimary, // 50
        t.textPrimary, // 100
        t.textSecondary, // 200
        t.textSecondary, // 300
        t.textMuted, // 400
        t.textMuted, // 500
        t.borderStrong, // 600
        t.surfaceElevated, // 700
        t.surface, // 800
        t.background, // 900
        t.background, // 950
      ]
    : [
        t.surfaceElevated, // 50
        t.surface, // 100
        t.border, // 200
        t.borderStrong, // 300
        t.textMuted, // 400
        t.textMuted, // 500
        t.textSecondary, // 600
        t.textSecondary, // 700
        t.textPrimary, // 800
        t.textPrimary, // 900
        t.textPrimary, // 950
      ];

  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const out: Record<string, string> = {};

  for (const [index, step] of STEPS.entries()) {
    out[`--color-gray-${step}`] = neutral[index];
  }

  /* Blue is this application's accent by convention — `bg-blue-600` for a
     primary button, `text-blue-400` for a link. The ramp collapses onto the
     theme's accent, with the pale end becoming the wash. */
  const accentRamp: Record<number, string> = {
    50: t.accentSubtle,
    100: t.accentSubtle,
    200: t.accentSubtle,
    300: t.accentHover,
    400: t.accentHover,
    500: t.accent,
    600: t.accent,
    700: t.accent,
    800: t.accent,
    900: t.accent,
    950: t.accent,
  };
  for (const [step, value] of Object.entries(accentRamp)) {
    out[`--color-blue-${step}`] = value;
  }

  /* Status keeps its meaning and loses its exact hue. The pale steps are mixed
     rather than picked, so a `bg-red-50` alert panel stays a wash of whatever
     this theme calls danger instead of a hardcoded pink. */
  const status: [string, string][] = [
    ["red", t.danger],
    ["rose", t.danger],
    ["green", t.success],
    ["emerald", t.success],
    ["yellow", t.warning],
    ["amber", t.warning],
    ["orange", t.warning],
  ];

  for (const [family, colour] of status) {
    for (const step of STEPS) {
      out[`--color-${family}-${step}`] =
        step <= 200
          ? `color-mix(in oklab, ${colour} ${step <= 100 ? 12 : 22}%, transparent)`
          : colour;
    }
  }

  return out;
}

/**
 * The atmosphere, as rules rather than variables.
 *
 * Everything above this point is a custom property, which is why it is free —
 * variables cost nothing until something reads them. This block is different:
 * it paints. So it is gated twice, on the theme *and* on
 * `data-theme-depth="full"`, and a reader who wants colour without texture gets
 * exactly zero of these rules.
 *
 * The surfaces were chosen by looking at what Life OS is actually built from:
 * `.sd-navbar` is the sidebar, `.mantine-Paper-root` and `.mantine-Card-root`
 * are every panel on every page, and the four dropdown-ish classes are the
 * modals, menus, popovers and drawers the brief lists. Six selectors is the
 * whole treatment — there is no per-page work here and no per-page work later.
 *
 * `background-image` rather than `background`: the colour underneath is already
 * the theme's, set through `--mantine-color-body` and friends, and painting
 * over it would mean saying every surface colour twice.
 */
function atmosphereBlock(theme: MovieTheme): string {
  const a = theme.atmosphere;
  const scope = `:root:root[data-theme-depth="full"][data-movie-theme="${theme.id}"]`;
  /* No `:root`, so it matches a preview card nested anywhere in the page. */
  const preview = `[data-theme-depth="full"][data-movie-theme="${theme.id}"]`;

  /* Panels, and everything shaped like a panel. Menus and modals get the same
     treatment as cards because in this application they are the same object at
     a different elevation. */
  const panels = [
    ".mantine-Paper-root",
    ".mantine-Card-root",
    ".mantine-Modal-content",
    ".mantine-Drawer-content",
    ".mantine-Menu-dropdown",
    ".mantine-Popover-dropdown",
  ]
    .map((selector) => `${scope} ${selector}`)
    .join(",\n");

  return `${scope} body {
  background-image: ${a.page};
  /* Not \`fixed\`: a fixed attachment repaints the whole layer on every scroll
     frame, which on a phone is the difference between a texture and a
     stutter. */
  background-attachment: scroll;
}

${scope} .sd-navbar,
${scope} .mantine-AppShell-header {
  background-image: ${a.chrome};
}

${panels} {
  background-image: ${a.surface};
  box-shadow: ${a.gilt};
}

/* The lift, on things that are actually interactive. A card that does nothing
   should not rise to meet the pointer — that is a promise the card cannot
   keep — so this is scoped to panels that carry a link, a button or a
   tabindex. */
${scope} a:hover > .mantine-Card-root,
${scope} a:hover > .mantine-Paper-root,
${scope} button:hover > .mantine-Card-root,
${scope} button:hover > .mantine-Paper-root,
${scope} .mantine-Card-root:has(a:hover),
${scope} .mantine-Card-root[tabindex]:hover {
  box-shadow: ${a.gilt}, ${a.glow};
}

/* An ornamental separator, for anything that opts in with \`data-theme-rule\`. */
${scope} [data-theme-rule] {
  height: 1px;
  border: 0;
  background: ${a.rule};
}

/*
 * The settings previews. Same three surfaces, addressed by role rather than by
 * component class, and scoped *without* \`:root\` so the rules reach a nested
 * div — which is what lets a preview card show the real texture instead of a
 * flat swatch pretending to be one.
 */
${preview} [data-theme-preview="page"] {
  background-image: ${a.page};
}

${preview} [data-theme-preview="chrome"] {
  background-image: ${a.chrome};
}

${preview} [data-theme-preview="surface"] {
  background-image: ${a.surface};
  box-shadow: ${a.gilt};
}`;
}

/**
 * The whole theme set as one stylesheet.
 *
 * Generated rather than hand-written so a new theme is genuinely one file.
 *
 * Two selectors per theme, and the reason is specificity — the first version of
 * this shipped with one and did nothing at all. Mantine declares its own
 * variables under `:root[data-mantine-color-scheme='dark']`, which scores
 * (0,2,0); a plain `[data-movie-theme="x"]` scores (0,1,0) and loses every
 * cascade it enters. So:
 *
 *   `:root:root[…]`  (0,3,0) — repeating `:root` is the standard way to buy a
 *                    point of specificity without an `!important` or an id. It
 *                    beats Mantine's declarations on the document element,
 *                    which is what actually repaints the application.
 *
 *   `[…]`            (0,1,0) — for the settings previews, which are ordinary
 *                    divs carrying the attribute. Nothing competes for them:
 *                    a declaration on an element always beats a value the
 *                    element merely inherited.
 *
 * `!important` would have worked and is the wrong tool: it would also override
 * any component that legitimately sets a colour on itself, and it cannot be
 * undone by the next person who needs to.
 *
 * The transition is on `background-color`, `border-color` and `color` only.
 * Transitioning `all` would drag every layout property through 160ms of
 * animation on the frame a theme changes, which is exactly the flashy switch
 * this feature is not supposed to have.
 */
export function themeStylesheet(): string {
  const blocks = MOVIE_THEMES.map((theme) => {
    const declarations = Object.entries(bridgeVariables(theme))
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
    const selector = [
      `:root:root[data-movie-theme="${theme.id}"]`,
      `[data-movie-theme="${theme.id}"]`,
    ].join(",\n");
    return `${selector} {\n${declarations}\n}`;
  });

  return [
    ...blocks,
    ...MOVIE_THEMES.map(atmosphereBlock),
    `@media (prefers-reduced-motion: no-preference) {
  html[data-movie-theme] body,
  html[data-movie-theme] .mantine-Paper-root,
  html[data-movie-theme] .mantine-Card-root,
  html[data-movie-theme] .mantine-AppShell-navbar,
  html[data-movie-theme] .mantine-AppShell-header,
  html[data-movie-theme] .mantine-AppShell-main {
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }
}`,
  ].join("\n\n");
}
