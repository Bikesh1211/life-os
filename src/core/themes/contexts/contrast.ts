/**
 * Legibility, computed rather than hand-tuned.
 *
 * A context accent is not decoration — it becomes `--mantine-color-anchor`,
 * which is link text, so it has to clear 4.5:1 against whatever it is read on.
 * The trouble is that "whatever it is read on" varies: nine of the ten released
 * themes are dark rooms and Dune is a lit one, and an accent authored for
 * charcoal is invisible on sand. Measured against Dune's surface, all
 * thirty-one authored accents failed.
 *
 * Hand-authoring a second colour per context would be sixty-two values to keep
 * in step and sixty-two chances to get one wrong. So instead each context
 * authors one accent — the colour it *means* — and this module derives a
 * variant for each ground by stepping it toward white or black until it clears
 * the threshold. Hue is preserved; only lightness moves, and only as far as it
 * has to.
 *
 * The reference surfaces are the extremes of the released set, so a value that
 * passes here passes on every theme in between.
 */

/** The lightest surface any theme presents — Dune's cards. */
export const LIGHT_REFERENCE = "#f9f3e8";

/**
 * A *typical* dark surface rather than the darkest one. Matrix is nearly black,
 * and tuning against it would leave every accent brighter than it needs to be
 * on the other eight dark themes.
 */
export const DARK_REFERENCE = "#191b1f";

/** WCAG AA for body text. Accents are used as link text, so this is the bar. */
export const AA = 4.5;

type Rgb = [number, number, number];

function parse(hex: string): Rgb {
  const value = hex.replace("#", "").trim();
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = parse(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return from.map((c, i) => c + (to[i] - c) * amount) as Rgb;
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

/**
 * The nearest version of a colour that is legible on a given ground.
 *
 * Steps in 2% increments toward white (on a dark ground) or black (on a light
 * one) and stops the moment the threshold is met — so a colour that already
 * passes is returned untouched, and one that does not is moved as little as
 * possible. Fifty steps reaches pure white or black, which always passes, so
 * this cannot fail to terminate or return something illegible.
 */
export function ensureContrast(color: string, against: string, target = AA): string {
  if (contrast(color, against) >= target) return color;

  const source = parse(color);
  const toward = luminance(against) > 0.5 ? BLACK : WHITE;

  for (let step = 1; step <= 50; step += 1) {
    const candidate = toHex(mix(source, toward, step * 0.02));
    if (contrast(candidate, against) >= target) return candidate;
  }

  return toHex(toward);
}

/**
 * Whichever of near-black or near-white is readable *on* a colour.
 *
 * Not pure black or pure white: a theme's own ink is warmer than either, and a
 * button label in `#000` on a coloured fill is the one thing that makes a
 * palette look untuned.
 */
export function readableOn(color: string): string {
  const dark = "#0a0a0c";
  const light = "#fbfbfa";
  return contrast(dark, color) >= contrast(light, color) ? dark : light;
}
