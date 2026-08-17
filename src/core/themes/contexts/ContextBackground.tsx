"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { contextForPath, isExemptPath } from "./contexts";

/**
 * The context layer: one element, one effect, no per-page work.
 *
 * The element is a fixed, empty, pointer-transparent div behind everything —
 * `.ctx-bg` in the generated stylesheet paints it and nothing else touches it.
 * Fixed rather than absolute so it never repaints on scroll; empty so there is
 * nothing in it to lay out; `aria-hidden` because it is texture and a screen
 * reader has no use for it.
 *
 * The effect writes `data-context` on the document element from the current
 * path. That is the whole routing story: every page in the application gets its
 * environment without importing anything, and adding a context is a data change
 * in `contexts.ts`.
 *
 * Writing an attribute rather than rendering different markup is what keeps a
 * navigation free — no component re-mounts, no background re-decodes, and the
 * transition is CSS opacity on a layer that already exists.
 */
export function ContextBackground() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    /* The Library and Explore own their atmosphere. Marking them explicitly
       rather than removing the attribute means the CSS can still target
       "deliberately no context" and the layer collapses instead of falling
       back to whatever was set on the previous page. */
    if (isExemptPath(pathname)) {
      root.setAttribute("data-context", "none");
      return;
    }

    const context = contextForPath(pathname);
    if (context) root.setAttribute("data-context", context.id);
    else root.removeAttribute("data-context");
  }, [pathname]);

  return <div className="ctx-bg" aria-hidden="true" />;
}
