import { themeStylesheet } from "@/core/themes";
import { contextStylesheet } from "@/core/themes/contexts";

/**
 * The theme stylesheet, served rather than inlined.
 *
 * Ten themes is 122 KB of custom properties. Inlined in the document that is
 * 122 KB re-sent on every full page load and cacheable by nothing; served from
 * here it is one request, compressed to about 7 KB, and then in the browser
 * cache for good.
 *
 * `force-static` builds it once, at build time, so this is a file on disk in
 * production rather than a function invocation — the route handler exists only
 * because the CSS is generated from the typed registry and there is no other
 * way to get a computed stylesheet into Next's asset pipeline.
 *
 * It is linked with `precedence` in the root layout, which React hoists into
 * `<head>`. That matters: a stylesheet in the head is render-blocking, so the
 * palette is resolved before the first paint and there is no flash of an
 * unthemed application.
 */
export const dynamic = "force-static";

export function GET() {
  /* Global themes first, contexts second: a context overrides the accent it
     inherits, and at equal specificity the later rule is the one that wins. */
  const css = [themeStylesheet(), contextStylesheet()].join("\n\n");

  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      /*
       * `immutable`, because the URL carries a hash of this exact content (see
       * `themeStylesheetHref`). A theme edit changes the hash, which changes
       * the URL, which is a different resource — so a browser can cache this
       * one for a year and still pick up the next one instantly.
       *
       * The version without the hash was cached for an hour, which meant every
       * theme change was invisible for an hour with no way to tell why.
       */
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
