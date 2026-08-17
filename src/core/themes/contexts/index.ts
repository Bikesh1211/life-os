import { CONTEXTS, contextById, contextForPath, isExemptPath } from "./contexts";
import type { CinematicContext } from "./contexts";
import { motifBackground } from "./motifs";
import { derivePalette } from "./palette";
import { bridgeVariables } from "../index";
import { paperAtmosphere, deepAtmosphere, metalAtmosphere } from "../atmospheres";
import {
  DARK_REFERENCE,
  LIGHT_REFERENCE,
  ensureContrast,
  readableOn,
} from "./contrast";

export { CONTEXTS, contextById, contextForPath, isExemptPath };
export type { CinematicContext };
export { MOTIFS } from "./motifs";
export type { MotifId } from "./motifs";
export { contrast, ensureContrast, DARK_REFERENCE, LIGHT_REFERENCE } from "./contrast";

/**
 * How much of a context is applied.
 *
 *   full   the whole room. Its own ground, surfaces, ink, borders, accent and
 *          atmosphere, plus a chrome band naming it — the treatment `/library`
 *          gets, given to every feature. The default, because it is the point.
 *   tint   the global movie theme keeps the palette; a context contributes only
 *          its accent and its texture. For anyone who wants one application
 *          that is merely tinted per area.
 *   off    nothing at all.
 */
export type ContextMode = "full" | "tint" | "off";

/** How strongly the texture is painted. */
export type BackgroundIntensity = "minimal" | "balanced" | "cinematic";

export const CONTEXT_MODE_KEY = "lifeos-context-mode";
export const BACKGROUND_INTENSITY_KEY = "lifeos-bg-intensity";

export const DEFAULT_CONTEXT_MODE: ContextMode = "full";
export const DEFAULT_INTENSITY: BackgroundIntensity = "balanced";

export function isContextMode(value: unknown): value is ContextMode {
  return value === "full" || value === "tint" || value === "off";
}

export function isIntensity(value: unknown): value is BackgroundIntensity {
  return value === "minimal" || value === "balanced" || value === "cinematic";
}

/**
 * The opacity of the texture layer, before a context's own weight.
 *
 * These numbers look high for a feature whose whole point is restraint, and the
 * reason is that they are not the final alpha — they multiply it. A motif draws
 * its lines at around 22% of the accent (see `motifs.ts`), so the figure that
 * actually reaches the screen is the product of the two:
 *
 *   minimal    0.10 x 0.22 = 2.2%   barely there by design
 *   balanced   0.28 x 0.22 = 6.2%   visible as texture, never as a picture
 *   cinematic  0.50 x 0.22 = 11%    present, still behind everything
 *
 * The first version of this multiplied 0.055 by 0.22 and produced 1.2%, which
 * is below the point where a colour is distinguishable from its background at
 * all — the layer was rendering perfectly and could not be seen. Compounding
 * two separately-reasonable "keep it subtle" numbers is an easy way to ship
 * nothing.
 */
const INTENSITY_OPACITY: Record<BackgroundIntensity, number> = {
  minimal: 0.1,
  balanced: 0.28,
  cinematic: 0.5,
};

/** What a stepped-down layer uses: phones, and `auto` below desktop widths. */
const REDUCED_OPACITY = 0.1;

/**
 * The context layer, as a stylesheet.
 *
 * Three kinds of rule, and the separation matters:
 *
 *   The `full` block is the room: the entire token bridge, generated from the
 *   context's derived palette, so every surface, every hairline and every
 *   piece of text belongs to that feature. This is what makes Tasks a mission
 *   dossier rather than a red-tinted task list.
 *
 *   The `tint` block is the modest version — accent only, over whatever global
 *   theme is selected.
 *
 *   The texture block is scoped only to the context, so it applies in both.
 *
 *   The opacity block is scoped to the intensity, so all three settings are one
 *   variable and the layer never re-paints its gradients to change strength.
 */
/*
 * The guard every opacity rule carries.
 *
 * Both exclusions belong *here* rather than in a later "turn it off" rule: a
 * rule that switches the layer off afterwards has to out-specify the rule that
 * switched it on, and the first version of this lost that fight silently —
 * `data-context="none"` scored (0,2,1) against the intensity rule's (0,3,1) and
 * the Library got a texture behind it. Expressing the exclusion as part of the
 * condition means there is only ever one rule in play.
 *
 * The doubled `:root` buys a point of specificity over the plain
 * `[data-bg-intensity]` selectors that would otherwise tie.
 */
/**
 * Which atmosphere family a motif belongs to.
 *
 * Organic textures get paper's grain, cold and empty ones get the deep wash,
 * hard-surfaced ones get metal's edge highlight. Written as a map rather than
 * a field on each context because it follows from the motif — a room drawn
 * with contour lines is a paper room, and nobody should have to say so twice.
 */
const ATMOSPHERE_FOR: Partial<Record<string, (o?: { light?: string; fill?: string; edge?: string; grain?: number }) => ReturnType<typeof paperAtmosphere>>> = {
  paper: paperAtmosphere,
  topographic: paperAtmosphere,
  shelf: paperAtmosphere,
  compass: paperAtmosphere,
  equations: paperAtmosphere,
  mist: paperAtmosphere,
  curtain: paperAtmosphere,
  rings: deepAtmosphere,
  orbit: deepAtmosphere,
  stars: deepAtmosphere,
  waves: deepAtmosphere,
  bokeh: deepAtmosphere,
  dataflow: deepAtmosphere,
  grid: metalAtmosphere,
  blueprint: metalAtmosphere,
  schematic: metalAtmosphere,
  ledger: metalAtmosphere,
  skyline: metalAtmosphere,
  scanlines: metalAtmosphere,
  editorial: metalAtmosphere,
  none: metalAtmosphere,
};

const OPACITY_SCOPE = ':root:root:not([data-context-mode="off"]):not([data-context="none"])';

export function contextStylesheet(): string {
  const blocks: string[] = [];

  for (const context of CONTEXTS) {
    const { image, size } = motifBackground(context.motif);

    /* The accent, and the small set of bridge variables that an accent owns.
       Surfaces, text and borders are deliberately absent — those belong to the
       global theme, and letting a context touch them is what would turn 46
       modules into 46 applications. */
    /* One authored accent, two legible variants. See `contrast.ts`: an accent
       tuned for charcoal is invisible on Dune's sand, and every one of the
       thirty-one failed there before this existed. */
    const onDark = ensureContrast(context.palette.accent, DARK_REFERENCE);
    const onLight = ensureContrast(context.palette.accent, LIGHT_REFERENCE);

    /* The room's full palette, and the atmosphere family its motif belongs to
       — organic motifs get paper's grain, cold ones get the deep wash, hard
       ones get metal's edge highlight. */
    const tokens = derivePalette(context.palette, context.scheme);
    const atmosphere = (ATMOSPHERE_FOR[context.motif] ?? deepAtmosphere)();

    blocks.push(`:root[data-context="${context.id}"] {
  --ctx-accent: ${onDark};
  --ctx-accent-hover: ${tokens.accentHover};
  --ctx-accent-contrast: ${readableOn(onDark)};
  --ctx-weight: ${context.weight};
}

/* A lit room needs the same colour taken down rather than up. */
:root[data-mantine-color-scheme="light"][data-context="${context.id}"] {
  --ctx-accent: ${onLight};
  --ctx-accent-hover: ${ensureContrast(tokens.accentHover, LIGHT_REFERENCE)};
  --ctx-accent-contrast: ${readableOn(onLight)};
}

:root[data-context-mode="tint"][data-context="${context.id}"] {
  --lo-accent: var(--ctx-accent);
  --lo-accent-hover: var(--ctx-accent-hover);
  --lo-accent-contrast: var(--ctx-accent-contrast);
  --lo-accent-subtle: color-mix(in oklab, var(--ctx-accent) 13%, transparent);

  --mantine-color-anchor: var(--ctx-accent);
  --mantine-primary-color-filled: var(--ctx-accent);
  --mantine-primary-color-filled-hover: var(--ctx-accent-hover);
  --mantine-primary-color-light: color-mix(in oklab, var(--ctx-accent) 13%, transparent);
  --mantine-primary-color-light-color: var(--ctx-accent);
  --mantine-primary-color-contrast: var(--ctx-accent-contrast);

  --mantine-color-brand-filled: var(--ctx-accent);
  --mantine-color-brand-filled-hover: var(--ctx-accent-hover);
  --mantine-color-brand-light: color-mix(in oklab, var(--ctx-accent) 13%, transparent);
  --mantine-color-brand-5: var(--ctx-accent);
  --mantine-color-brand-6: var(--ctx-accent);
  --mantine-color-blue-5: var(--ctx-accent);
  --mantine-color-blue-6: var(--ctx-accent);
  --mantine-color-blue-light: color-mix(in oklab, var(--ctx-accent) 13%, transparent);
  --mantine-color-blue-filled: var(--ctx-accent);
  --color-blue-500: var(--ctx-accent);
  --color-blue-600: var(--ctx-accent);
}

/*
 * The whole room. Same bridge the global themes use, so every one of the 187
 * variables a page might read is answered by this feature's palette — and the
 * atmosphere with it, at full strength rather than as a wash.
 */
:root[data-context-mode="full"][data-context="${context.id}"] {
${Object.entries(bridgeVariables({
      id: context.id as never,
      name: context.title,
      subtitle: context.inspiration,
      description: context.tagline,
      mood: context.tagline,
      scheme: context.scheme,
      tokens,
      atmosphere,
    }))
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n")}
}

:root[data-context-mode="full"][data-context="${context.id}"] body {
  background-image: ${atmosphere.page};
  background-attachment: scroll;
}

:root[data-context-mode="full"][data-context="${context.id}"] .sd-navbar,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-AppShell-header {
  background-image: ${atmosphere.chrome};
}

:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Paper-root,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Card-root,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Modal-content,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Drawer-content,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Menu-dropdown,
:root[data-context-mode="full"][data-context="${context.id}"] .mantine-Popover-dropdown {
  background-image: ${atmosphere.surface};
  box-shadow: ${atmosphere.gilt};
}

:root[data-context="${context.id}"]:not([data-context-mode="off"]) .ctx-bg {
  background-image: ${image};${size ? `\n  background-size: ${size};` : ""}
}`);
  }

  /* The layer itself. One fixed element behind everything, painting nothing but
     a gradient — no scroll listener, no repaint on scroll, no compositing cost
     beyond a single static layer. */
  blocks.push(`.ctx-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  /* Only the opacity transitions, and only between intensities. The gradients
     themselves never animate — there is nothing here that moves. */
  transition: opacity 200ms ease;
}

${Object.entries(INTENSITY_OPACITY)
  .map(
    ([level, value]) =>
      `${OPACITY_SCOPE}[data-bg-intensity="${level}"] .ctx-bg {\n  opacity: calc(${value} * var(--ctx-weight, 1));\n}`,
  )
  .join("\n\n")}

/*
 * The chrome band. Hidden unless the room is fully applied — see
 * CinematicHeader.tsx for why announcing a room the palette has not entered
 * would be the interface overselling itself.
 */
.ctx-band {
  display: none;
}

:root[data-context-mode="full"]:not([data-context="none"]) .ctx-band {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding: 0 0 0.6rem;
  border-bottom: 1px solid var(--lo-border, var(--border-subtle));
  /* Clipped rather than wrapped: on a phone the tagline drops off the end,
     which is the right thing to lose first. */
  overflow: hidden;
  white-space: nowrap;
}

.ctx-band-mark {
  width: 3px;
  height: 0.95rem;
  flex: none;
  border-radius: 2px;
  background: var(--lo-accent, var(--mantine-primary-color-filled));
  transform: translateY(0.1rem);
}

.ctx-band-title {
  flex: none;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--lo-accent, var(--mantine-primary-color-filled));
}

.ctx-band-tagline {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.78rem;
  font-style: italic;
  color: var(--lo-text-muted, var(--mantine-color-dimmed));
}

.ctx-band-source {
  flex: none;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lo-text-muted, var(--mantine-color-dimmed));
  opacity: 0.7;
}

@media (max-width: 640px) {
  .ctx-band-source {
    display: none;
  }
}

/*
 * Phones get less of everything. A texture that reads as atmosphere on a
 * 27-inch display reads as a dirty screen at arm's length, and the pixels it
 * costs are pixels a phone would rather spend on the actual page.
 */
@media (max-width: 640px) {
  ${OPACITY_SCOPE} .ctx-bg {
    opacity: calc(${REDUCED_OPACITY} * var(--ctx-weight, 1));
  }
  :root[data-bg-intensity="minimal"] .ctx-bg {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ctx-bg {
    transition: none;
  }
}`);

  return blocks.join("\n\n");
}
