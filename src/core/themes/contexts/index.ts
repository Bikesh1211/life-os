import { CONTEXTS, contextById, contextForPath, isExemptPath } from "./contexts";
import type { CinematicContext } from "./contexts";
import { derivePalette } from "./palette";
import { bridgeVariables } from "../index";
import { paperAtmosphere, deepAtmosphere, metalAtmosphere } from "../atmospheres";
import { DARK_REFERENCE, LIGHT_REFERENCE, ensureContrast, readableOn } from "./contrast";

export { CONTEXTS, contextById, contextForPath, isExemptPath };
export type { CinematicContext };
export { MOTIFS } from "./motifs";
export type { MotifId } from "./motifs";

/**
 * Which environment each room is drawn as.
 *
 * Contexts outnumber scenes on purpose: a scene is a *place*, and several rooms
 * legitimately share one. Goals and the Dashboard are both command centres;
 * Notes, Writing and the Archive are all desks with paper on them. What tells
 * them apart is the palette, which is per-context — the same room at a
 * different hour.
 */
export const SCENE_FOR: Record<string, string> = {
  dashboard: "dossier",
  tasks: "dossier",
  projects: "workshop",
  goals: "dossier",
  strategy: "workshop",
  journal: "nightfall",
  "quick-note": "continental",
  notes: "desk",
  writing: "desk",
  knowledge: "construct",
  learning: "observatory",
  archive: "reading",
  reading: "reading",
  movies: "cinema",
  music: "cosmos",
  discovery: "construct",
  travel: "expedition",
  places: "expedition",
  photos: "offworld",
  network: "construct",
  timeline: "spacetime",
  memories: "keepsake",
  calendar: "spacetime",
  time: "spacetime",
  health: "observatory",
  training: "gym",
  mindset: "spacetime",
  finance: "exchange",
  inventory: "atelier",
  wardrobe: "atelier",
  settings: "glass",
};
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

/**
 * Ambient effects: the drifting dust, and nothing else.
 *
 * Separate from intensity on purpose. Intensity is about how *present* the
 * environment is; this is about whether any of it moves. Someone can want a
 * fully cinematic room that holds perfectly still — motion sensitivity is not
 * the same preference as taste in decor.
 */
export type AmbientEffects = "subtle" | "off";

/**
 * Motion preference.
 *
 * `system` defers to `prefers-reduced-motion`, which is the right default and
 * covers most people. The explicit settings exist because the OS toggle is a
 * blunt, global instrument — someone may want animation everywhere else and
 * stillness here, or the reverse, and neither is expressible at the OS level.
 */
export type MotionPreference = "system" | "full" | "reduced";

export const CONTEXT_MODE_KEY = "lifeos-context-mode";
export const BACKGROUND_INTENSITY_KEY = "lifeos-bg-intensity";
export const AMBIENT_EFFECTS_KEY = "lifeos-ambient-effects";
export const MOTION_KEY = "lifeos-motion";

export const DEFAULT_CONTEXT_MODE: ContextMode = "full";
export const DEFAULT_INTENSITY: BackgroundIntensity = "balanced";
export const DEFAULT_AMBIENT: AmbientEffects = "subtle";
export const DEFAULT_MOTION: MotionPreference = "system";

export function isContextMode(value: unknown): value is ContextMode {
  return value === "full" || value === "tint" || value === "off";
}

export function isIntensity(value: unknown): value is BackgroundIntensity {
  return value === "minimal" || value === "balanced" || value === "cinematic";
}

export function isAmbient(value: unknown): value is AmbientEffects {
  return value === "subtle" || value === "off";
}

export function isMotion(value: unknown): value is MotionPreference {
  return value === "system" || value === "full" || value === "reduced";
}

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
const ATMOSPHERE_FOR: Partial<
  Record<
    string,
    (o?: {
      light?: string;
      fill?: string;
      edge?: string;
      grain?: number;
    }) => ReturnType<typeof paperAtmosphere>
  >
> = {
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

/**
 * The chrome band. Hidden unless the room is fully applied — announcing a room
 * the palette has not entered would be the interface overselling itself.
 */
const BAND_CSS = `.ctx-band {
  display: none;
}

:root[data-context-mode="full"]:not([data-context="none"]) .ctx-band {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding: 0 0 0.6rem;
  border-bottom: 1px solid var(--lo-border, var(--border-subtle));
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
}`;

export function contextStylesheet(): string {
  const blocks: string[] = [];

  for (const context of CONTEXTS) {
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
${Object.entries(
  bridgeVariables({
    id: context.id as never,
    name: context.title,
    subtitle: context.inspiration,
    description: context.tagline,
    mood: context.tagline,
    scheme: context.scheme,
    tokens,
    atmosphere,
  }),
)
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
`);
  }

  blocks.push(BAND_CSS);

  return blocks.join("\n\n");
}
