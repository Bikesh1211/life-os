/**
 * The theme contract.
 *
 * Fourteen tokens, and every surface in Life OS is painted from them. The point
 * of keeping the list this short is that adding a theme has to stay a data
 * change: a token set nobody can hold in their head is a token set that grows a
 * fifteenth entry for one component, and then a sixteenth.
 *
 * Colours are plain CSS colour strings because they end up in CSS custom
 * properties, where a colour is whatever the browser can parse. Several of the
 * borders below are deliberately `rgba(…)` rather than a solid: a hairline that
 * tints the surface underneath sits differently on a card and on a modal, and
 * that difference is most of what makes a border look considered.
 */
export interface ThemeTokens {
  /** The page itself — the furthest-back surface. */
  background: string;
  /** Cards, panels, inputs: one step forward from the page. */
  surface: string;
  /** Menus, popovers, hover states: one step forward again. */
  surfaceElevated: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  /** The hairline. Usually a translucent tint of the accent or the text. */
  border: string;
  /** For a border that has to be seen rather than felt — focus, selection. */
  borderStrong: string;

  accent: string;
  accentHover: string;
  /** The wash behind a selected chip or a light-variant button. */
  accentSubtle: string;
  /** Text placed *on* the accent. Contrast, not decoration. */
  accentContrast: string;

  success: string;
  warning: string;
  danger: string;

  /** The `box-shadow` colour. Deeper on dark themes, barely there on light. */
  shadow: string;
}

/**
 * Whether a theme is a dark room or a lit one.
 *
 * Load-bearing rather than cosmetic: Mantine renders whole components
 * differently per scheme, so picking a theme sets the scheme too. Dune is the
 * only light one so far, and it is the reason this field exists at all.
 */
export type ThemeScheme = "light" | "dark";

/**
 * Everything a theme is beyond its palette.
 *
 * The Library and Explore are not just coloured differently — they are *made*
 * of something. Paper has grain, a chart has a wash across it, a card has a
 * gilt hairline along its top edge and lifts into a warm shadow. That is what
 * makes those two modes feel built rather than tinted, and it is what this
 * block carries into the rest of the application.
 *
 * Every value is a CSS string that reads `var(--lo-*)`, so an atmosphere is
 * written once against the token contract and re-tints itself per theme. All of
 * it is gradients — no images, no requests, nothing to decode — because the
 * whole point is that atmosphere costs the reader nothing.
 *
 * Applied only under `data-theme-depth="full"`. The other setting keeps the
 * palette and drops all of this, which is the honest option for anyone who
 * wants the colours without the texture.
 */
export interface ThemeAtmosphere {
  /** Layered onto `<body>`: the grain, and where the light comes from. */
  page: string;
  /** Layered onto cards, panels, modals and dropdowns. */
  surface: string;
  /** The chrome — sidebar and header. Usually a gradient, not a flat fill. */
  chrome: string;
  /** The hairline along a card's top edge. A full `box-shadow` value. */
  gilt: string;
  /** What a card's shadow warms to. A full `box-shadow` value. */
  glow: string;
  /** The ornamental separator, as a `background` value. */
  rule: string;
}

export interface MovieTheme {
  id: ThemeId;
  /** Shown on the card. */
  name: string;
  /** The one-word register — "Wizarding", "Cosmic". */
  subtitle: string;
  /** One sentence on the card, under the name. */
  description: string;
  /** Announced to screen readers in place of the swatch. */
  mood: string;
  scheme: ThemeScheme;
  tokens: ThemeTokens;
  atmosphere: ThemeAtmosphere;
}

/**
 * How far a theme goes.
 *
 * `full` is the Library treatment — grain, washes, gilt edges, warmed shadows.
 * `palette` is colour only. Separate from the theme itself because they are
 * separate questions: someone can want Gotham's charcoal without wanting
 * texture on every card.
 */
export type ThemeDepth = "full" | "palette";

export const DEPTH_STORAGE_KEY = "lifeos-theme-depth";

/**
 * `default` is not a movie theme — it is the absence of one, and it exists
 * because a preference you cannot leave is a trap. Selecting it removes the
 * attribute entirely, so Life OS's own palette applies with nothing overriding
 * it.
 */
export type ThemeId =
  | "default"
  | "harry-potter"
  | "marvel"
  | "dc"
  | "interstellar"
  | "star-wars"
  | "lotr"
  | "dune"
  | "jurassic-park"
  | "matrix"
  | "bond"
  | "dark-knight";

export const THEME_STORAGE_KEY = "lifeos-theme";
