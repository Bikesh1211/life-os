import { CONTEXTS, contextById, contextForPath, isExemptPath } from "./contexts";
import type { CinematicContext } from "./contexts";
import { motifBackground } from "./motifs";
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
 *   feature   its own accent and its own texture. The default.
 *   global    the global movie theme keeps the accent; only the texture
 *             changes per area. One palette, many rooms.
 *   auto      like `feature`, but the texture steps down on small screens and
 *             under reduced motion — the setting for people who want it and
 *             also want their phone to stay legible.
 *   off       nothing. No accent change, no texture.
 */
export type ContextMode = "auto" | "global" | "feature" | "off";

/** How strongly the texture is painted. */
export type BackgroundIntensity = "minimal" | "balanced" | "cinematic";

export const CONTEXT_MODE_KEY = "lifeos-context-mode";
export const BACKGROUND_INTENSITY_KEY = "lifeos-bg-intensity";

export const DEFAULT_CONTEXT_MODE: ContextMode = "feature";
export const DEFAULT_INTENSITY: BackgroundIntensity = "balanced";

export function isContextMode(value: unknown): value is ContextMode {
  return value === "auto" || value === "global" || value === "feature" || value === "off";
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
 *   The accent block is scoped to `[data-context-mode="feature"]` and
 *   `[data-context-mode="auto"]`, so switching to "Global theme" drops every
 *   accent override at once and the global palette shows through unchanged.
 *
 *   The texture block is scoped only to the context, because a texture is
 *   wanted in every mode except `off` — under "Global theme" it simply reads
 *   the global accent instead of the context's own.
 *
 *   The opacity block is scoped to the intensity, so all three settings are
 *   one variable and the layer never re-paints its gradients to change
 *   strength.
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
    const onDark = ensureContrast(context.accent, DARK_REFERENCE);
    const onLight = ensureContrast(context.accent, LIGHT_REFERENCE);

    blocks.push(`:root[data-context="${context.id}"] {
  --ctx-accent: ${onDark};
  --ctx-accent-hover: ${ensureContrast(context.accentHover, DARK_REFERENCE)};
  --ctx-accent-contrast: ${readableOn(onDark)};
  --ctx-weight: ${context.weight};
}

/* A lit room needs the same colour taken down rather than up. */
:root[data-mantine-color-scheme="light"][data-context="${context.id}"] {
  --ctx-accent: ${onLight};
  --ctx-accent-hover: ${ensureContrast(context.accentHover, LIGHT_REFERENCE)};
  --ctx-accent-contrast: ${readableOn(onLight)};
}

:root[data-context-mode="feature"][data-context="${context.id}"],
:root[data-context-mode="auto"][data-context="${context.id}"] {
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

/* The 'auto' mode steps the texture down on anything narrower than a desktop,
   which is the only thing separating it from 'feature'. */
@media (max-width: 1024px) {
  ${OPACITY_SCOPE}[data-context-mode="auto"] .ctx-bg {
    opacity: calc(${REDUCED_OPACITY} * var(--ctx-weight, 1));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ctx-bg {
    transition: none;
  }
  ${OPACITY_SCOPE}[data-context-mode="auto"] .ctx-bg {
    opacity: calc(${REDUCED_OPACITY} * var(--ctx-weight, 1));
  }
}}`);

  return blocks.join("\n\n");
}
