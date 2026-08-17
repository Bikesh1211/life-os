/**
 * Coordinates out of a Google Maps URL.
 *
 * Pasting a link is the way people actually record a position — nobody copies
 * two decimals out of a map by hand — and every Google Maps place URL carries
 * the viewport centre as `@lat,lng,zoom`:
 *
 *   https://www.google.com/maps/place/Pokhara/@28.2096,83.9856,13z/...
 *
 * A URL with no `@` pair parses to nothing rather than to a guess. That matters
 * on edit: the caller sends the empty result as an explicit null, so clearing
 * the box clears the pin instead of leaving the place at its old position.
 *
 * The `@` centre is the *viewport*, not the pin, so it is accurate to roughly
 * the map's centring rather than to the metre. For an archive of "I was here",
 * that is the right precision — and the two coordinate boxes underneath are
 * there for when it is not.
 */

export interface ParsedCoords {
  lat?: number;
  lng?: number;
}

const AT_COORDS = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

/** Short links (`maps.app.goo.gl/…`) carry no coordinates until they resolve. */
const SHORT_LINK = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i;

export function parseMapsUrl(url: string): ParsedCoords {
  if (!url) return {};
  const match = url.match(AT_COORDS);
  if (!match) return {};
  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return {};
  return { lat, lng };
}

export function isShortMapsLink(url: string): boolean {
  return SHORT_LINK.test(url.trim());
}
