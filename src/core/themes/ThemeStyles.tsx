import { DEFAULT_DEPTH, DEPTH_STORAGE_KEY, MOVIE_THEMES, THEME_STORAGE_KEY } from "./index";

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
export function ThemeStyles() {
  return (
    /* The rule below assumes a stylesheet that could be `import`ed and
       bundled. This one is generated from the typed theme registry at build
       time, so there is no file for the bundler to take — the route handler is
       the only way in. */
    // eslint-disable-next-line @next/next/no-css-tags
    <link rel="stylesheet" href="/theme.css" precedence="high" />
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
  if (t && s[t]) {
    r.setAttribute("data-movie-theme", t);
    r.setAttribute("data-mantine-color-scheme", s[t]);
  }
} catch (e) {}`.trim();

  return <script id="lifeos-theme-boot" dangerouslySetInnerHTML={{ __html: script }} />;
}
