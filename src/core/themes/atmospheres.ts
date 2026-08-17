import type { ThemeAtmosphere } from "./types";

/**
 * Three ways a theme can be *made*.
 *
 * Thirty hand-written atmosphere blocks would be thirty chances to drift, and
 * most of them would be the same three ideas anyway — so the ideas are written
 * once and parameterised. A theme picks a family and passes its own light.
 *
 *   paper  organic and textured: grain at two odd angles, a warm source
 *          overhead. Wizarding, Middle-earth, desert, jungle.
 *   deep   cold and empty: one wash from far above, falling off to black at
 *          the foot of the page. The vertical falloff does the work a
 *          starfield would, without a star.
 *   metal  hard surfaces and hard light: no grain at all, a highlight along
 *          the top edge of everything, a vignette pulling the corners down.
 *
 * Every value is a CSS string reading `var(--lo-*)`, so an atmosphere re-tints
 * itself per theme and there is nothing to keep in step. All of it is
 * gradients — no images, no requests, nothing to decode.
 */

interface AtmosphereOptions {
  /** Where the light comes from. Defaults to the theme's accent. */
  light?: string;
  /** A second, dimmer source. `paper` only. */
  fill?: string;
  /** The hairline along a card's top edge. Defaults to the accent. */
  edge?: string;
  /** Grain strength, as a percentage of the text colour. `paper` only. */
  grain?: number;
}

/** The grain that makes a surface read as paper rather than as a fill. */
function grain(strength: number): string {
  return [
    `repeating-linear-gradient(37deg, color-mix(in oklab, var(--lo-text-primary) ${strength}%, transparent) 0 1px, transparent 1px 4px)`,
    `repeating-linear-gradient(-53deg, color-mix(in oklab, var(--lo-text-primary) ${(strength * 0.8).toFixed(2)}%, transparent) 0 1px, transparent 1px 7px)`,
  ].join(", ");
}

/**
 * Parchment, canvas, sand, leaf litter.
 *
 * This is the Library's own treatment — `.paper` in `library.module.css` is
 * exactly `grain(2.5)` — generalised so every organic theme inherits it rather
 * than approximating it.
 */
export function paperAtmosphere(options: AtmosphereOptions = {}): ThemeAtmosphere {
  const light = options.light ?? "var(--lo-accent)";
  const fill = options.fill ?? light;
  const edge = options.edge ?? "var(--lo-accent)";
  const strength = options.grain ?? 2;

  return {
    page: [
      grain(strength),
      `radial-gradient(115% 75% at 12% -8%, color-mix(in oklab, ${light} 13%, transparent) 0%, transparent 62%)`,
      `radial-gradient(90% 60% at 92% 4%, color-mix(in oklab, ${fill} 7%, transparent) 0%, transparent 58%)`,
    ].join(", "),
    surface: grain(strength + 0.5),
    chrome: `linear-gradient(180deg, color-mix(in oklab, ${edge} 5%, transparent) 0%, transparent 42%)`,
    gilt: `inset 0 1px 0 0 color-mix(in oklab, ${edge} 40%, transparent)`,
    glow: `0 0 0 1px color-mix(in oklab, ${edge} 16%, transparent), 0 10px 28px color-mix(in oklab, ${light} 14%, transparent)`,
    rule: `linear-gradient(90deg, transparent, color-mix(in oklab, ${edge} 40%, transparent) 30%, color-mix(in oklab, ${edge} 40%, transparent) 70%, transparent)`,
  };
}

/** Vacuum, ocean trench, night sky. One cold source, a long way up. */
export function deepAtmosphere(options: AtmosphereOptions = {}): ThemeAtmosphere {
  const light = options.light ?? "var(--lo-accent)";
  const edge = options.edge ?? "var(--lo-accent)";

  return {
    page: [
      `repeating-linear-gradient(41deg, color-mix(in oklab, var(--lo-text-primary) 1.4%, transparent) 0 1px, transparent 1px 6px)`,
      `radial-gradient(130% 70% at 50% -14%, color-mix(in oklab, ${light} 12%, transparent) 0%, transparent 60%)`,
      `radial-gradient(100% 100% at 50% 118%, color-mix(in oklab, #000 26%, transparent) 0%, transparent 55%)`,
    ].join(", "),
    surface: `linear-gradient(180deg, color-mix(in oklab, ${light} 4%, transparent) 0%, transparent 46%)`,
    chrome: `linear-gradient(180deg, color-mix(in oklab, ${light} 6%, transparent) 0%, transparent 38%)`,
    gilt: `inset 0 1px 0 0 color-mix(in oklab, ${edge} 26%, transparent)`,
    glow: `0 0 0 1px color-mix(in oklab, ${edge} 14%, transparent), 0 12px 32px color-mix(in oklab, ${light} 10%, transparent)`,
    rule: `linear-gradient(90deg, transparent, color-mix(in oklab, ${edge} 34%, transparent) 30%, color-mix(in oklab, ${edge} 34%, transparent) 70%, transparent)`,
  };
}

/**
 * Gunmetal, wet concrete, a black car at night.
 *
 * No grain at all, which is the point — texture would soften surfaces whose
 * whole character is that they are hard. The edge highlight reads as light
 * catching a machined lip rather than as gilt.
 */
export function metalAtmosphere(options: AtmosphereOptions = {}): ThemeAtmosphere {
  const light = options.light ?? "var(--lo-accent)";
  const edge = options.edge ?? "#fff";

  return {
    page: [
      `radial-gradient(120% 60% at 50% -10%, color-mix(in oklab, ${light} 9%, transparent) 0%, transparent 55%)`,
      `radial-gradient(140% 120% at 50% 50%, transparent 42%, color-mix(in oklab, #000 42%, transparent) 100%)`,
    ].join(", "),
    surface: `linear-gradient(180deg, color-mix(in oklab, ${edge} 3.5%, transparent) 0%, transparent 34%)`,
    chrome: `linear-gradient(180deg, color-mix(in oklab, ${edge} 4.5%, transparent) 0%, transparent 30%)`,
    gilt: `inset 0 1px 0 0 color-mix(in oklab, ${edge} 10%, transparent)`,
    glow: `0 0 0 1px color-mix(in oklab, ${edge} 11%, transparent), 0 14px 34px color-mix(in oklab, #000 55%, transparent)`,
    rule: `linear-gradient(90deg, transparent, color-mix(in oklab, ${edge} 18%, transparent) 30%, color-mix(in oklab, ${edge} 18%, transparent) 70%, transparent)`,
  };
}
