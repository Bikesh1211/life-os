"use client";

import { usePathname } from "next/navigation";
import { contextForPath, isExemptPath } from "./contexts";

/**
 * The band that tells you which room you are in.
 *
 * This is the single element that does most of the work, and the Library is why
 * I know that: walking into `/library` feels like a different place before you
 * have read a word, because the rail at the top says THE ADVENTURE ARCHIVE and
 * is drawn in that room's gold. A palette alone never does that — it changes
 * how a page looks, not what it announces itself to be.
 *
 * So every feature gets the same courtesy: its cinematic name, a line in its
 * own voice, and the film it comes from, drawn in its own accent above the
 * page. Four lines of markup, one hairline, no artwork.
 *
 * It renders only under `full`. In `tint` the application is still Life OS with
 * a colour on it, and announcing "THE MISSION" over an ordinary task list would
 * be the interface making a promise the rest of the page does not keep.
 */
export function CinematicHeader() {
  const pathname = usePathname();

  /* The reading room and Explore already have their own rails. A second band
     above them would be two headers introducing the same page. */
  if (isExemptPath(pathname)) return null;

  const context = contextForPath(pathname);
  if (!context) return null;

  return (
    <header
      className="ctx-band"
      /* Not `aria-hidden`: it names the section, which is genuinely useful to
         a screen reader arriving at a new route. But the tagline is flavour,
         so only the title is announced. */
      aria-label={`${context.title} — ${context.inspiration}`}
    >
      <span className="ctx-band-mark" aria-hidden="true" />

      <span className="ctx-band-title">{context.title}</span>

      <span className="ctx-band-tagline" aria-hidden="true">
        {context.tagline}
      </span>

      <span className="ctx-band-source" aria-hidden="true">
        {context.inspiration}
      </span>
    </header>
  );
}
