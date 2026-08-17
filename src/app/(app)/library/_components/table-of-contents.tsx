"use client";

import { useEffect, useState } from "react";
import { cn } from "@/core/utils";
import { scrollToSection } from "./use-hydrated";
import type { TocItem } from "@/modules/library";

/**
 * Contents, with the current section marked.
 *
 * The active heading is found with an `IntersectionObserver` rather than by
 * comparing scroll offsets on every frame: the browser already knows which
 * elements are on screen, and asking it costs nothing during a scroll.
 *
 * The `rootMargin` pulls the detection band up to just under the fixed header
 * and down to a third of the way up the viewport, so a heading counts as
 * "current" while its section is being read, not only in the instant it
 * crosses the top edge.
 */
export function TableOfContents({
  items,
  className,
  title = "Contents",
}: {
  items: TocItem[];
  className?: string;
  title?: string;
}) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -66% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label={title}>
      <p className="lb-caption mb-3 text-[var(--lb-muted)]">{title}</p>
      <ul className="space-y-1 border-l border-[var(--lb-border)]">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  // `scrollToSection` rather than the default jump, so the
                  // fixed header does not sit on top of the heading landed on.
                  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                  event.preventDefault();
                  scrollToSection(item.id);
                }}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 pl-3 transition-colors",
                  item.level === 3 && "pl-6 text-[0.8125rem]",
                  active
                    ? "border-[var(--lb-primary)] font-medium text-[var(--lb-primary)]"
                    : "border-transparent text-[var(--lb-muted)] hover:border-[var(--lb-border)] hover:text-[var(--lb-fg)]",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
