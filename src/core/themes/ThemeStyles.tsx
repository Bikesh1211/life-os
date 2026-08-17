import { createHash } from "node:crypto";
import { DEFAULT_DEPTH, DEPTH_STORAGE_KEY, MOVIE_THEMES, THEME_STORAGE_KEY, themeStylesheet } from "./index";
import {
  AMBIENT_EFFECTS_KEY,
  BACKGROUND_INTENSITY_KEY,
  CONTEXT_MODE_KEY,
  DEFAULT_AMBIENT,
  DEFAULT_CONTEXT_MODE,
  DEFAULT_INTENSITY,
  DEFAULT_MOTION,
  MOTION_KEY,
  contextStylesheet,
} from "./contexts";

/**
 * The theme layer's stylesheet link.
 *
 * A `<link>` rather than a `<style>`: ten themes is 122 KB of custom
 * properties, which inlined would be re-sent with every full page load and
 * cacheable by nothing. `app/theme.css/route.ts` builds it once and serves it
 * compressed to about 7 KB.
 *
 * `precedence` is what makes this correct rather than merely tidy — React
 * hoists a stylesheet carrying it into `<head>` and blocks the first paint on
 * it, so the palette is resolved before anything is drawn. Without it the
 * document would paint unthemed and then repaint.
 */
/**
 * The stylesheet URL, with a hash of its own content.
 *
 * Computed on the server at render time from the same two generators the route
 * handler uses, so the hash always describes what will actually be served. That
 * is what lets the response be cached for a year: a theme edit produces a
 * different hash, a different URL, and therefore a different resource — the old
 * one is never asked for again.
 */
function themeStylesheetHref(): string {
  const css = [themeStylesheet(), contextStylesheet()].join("\n\n");
  const hash = createHash("sha1").update(css).digest("hex").slice(0, 10);
  return `/theme.css?v=${hash}`;
}

export function ThemeStyles() {
  return (
    /* The rule below assumes a stylesheet that could be `import`ed and
       bundled. This one is generated from the typed theme registry at build
       time, so there is no file for the bundler to take — the route handler is
       the only way in. */
    <link rel="stylesheet" href={themeStylesheetHref()} precedence="high" />
  );
}

/**
 * The boot script: sets the theme before the first paint.
 *
 * Without this there is a visible flash — the server has no way to know which
 * theme a browser prefers, so the first frame is the default palette and the
 * second is the chosen one. Running synchronously in `<head>`, ahead of any
 * rendering, is the only way to avoid it.
 *
 * It also sets the Mantine colour scheme, because a theme carries one: landing
 * on Dune with a dark scheme still applied would paint sand-coloured cards with
 * Mantine's dark component internals for a frame. And it sets the depth, so a
 * textured page does not arrive flat and then acquire its grain.
 *
 * Deliberately tiny and defensive. It runs before React, before any error
 * boundary exists, and a throw here would leave the page blank — so every
 * access is inside the try, and failing means "no theme", not "no application".
 */
export function ThemeBootScript() {
  const schemes = Object.fromEntries(MOVIE_THEMES.map((theme) => [theme.id, theme.scheme]));

  const script = `
try {
  var r = document.documentElement;
  var s = ${JSON.stringify(schemes)};
  var t = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  var d = window.localStorage.getItem(${JSON.stringify(DEPTH_STORAGE_KEY)});
  r.setAttribute("data-theme-depth", d === "palette" || d === "full" ? d : ${JSON.stringify(DEFAULT_DEPTH)});

  var m = window.localStorage.getItem(${JSON.stringify(CONTEXT_MODE_KEY)});
  r.setAttribute("data-context-mode", ["full","tint","off"].indexOf(m) > -1 ? m : ${JSON.stringify(DEFAULT_CONTEXT_MODE)});

  var b = window.localStorage.getItem(${JSON.stringify(BACKGROUND_INTENSITY_KEY)});
  r.setAttribute("data-bg-intensity", ["minimal","balanced","cinematic"].indexOf(b) > -1 ? b : ${JSON.stringify(DEFAULT_INTENSITY)});

  var a = window.localStorage.getItem(${JSON.stringify(AMBIENT_EFFECTS_KEY)});
  r.setAttribute("data-ambient", ["subtle","off"].indexOf(a) > -1 ? a : ${JSON.stringify(DEFAULT_AMBIENT)});

  var mo = window.localStorage.getItem(${JSON.stringify(MOTION_KEY)});
  r.setAttribute("data-motion", ["system","full","reduced"].indexOf(mo) > -1 ? mo : ${JSON.stringify(DEFAULT_MOTION)});
  if (t && s[t]) {
    r.setAttribute("data-movie-theme", t);
    r.setAttribute("data-mantine-color-scheme", s[t]);
  }
} catch (e) {}`.trim();

  return <script id="lifeos-theme-boot" dangerouslySetInnerHTML={{ __html: script }} />;
}
