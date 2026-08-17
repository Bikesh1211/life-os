"use client";

import { useEffect, useRef, useState } from "react";
import { IconBookmarks, IconCheck } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { useReader, COMPLETION_THRESHOLD } from "./reader";
import type { LibraryKind } from "@/modules/library";

/**
 * Reading progress: a measurement of the *article*, not of the page.
 *
 * Deliberately not a second bar across the top of the viewport. The root layout
 * already renders `ScrollProgress` there for every route on the site, and two
 * hairlines stacked at `top: 0` read as a rendering bug rather than as two
 * different measurements. This one lives in the reading rail, where it belongs
 * to the piece being read — and it measures the article element, so the footer,
 * the related-reading block and the page chrome do not count as prose the
 * reader has got through.
 *
 * It is also what persists the reader's position. Writes are rate-limited two
 * ways: the browser is only asked for layout inside one `requestAnimationFrame`
 * per scroll burst, and the store is only told when the whole-number percentage
 * has actually moved.
 */
export function ReadingProgress({
  entry,
  articleId,
  chapter,
  readingMinutes,
  className,
}: {
  entry: { kind: LibraryKind; slug: string };
  /** The element whose extent counts as "the reading". */
  articleId: string;
  /** Chapter slug, on a chaptered entry — stored so the reader returns to it. */
  chapter?: string;
  readingMinutes: number;
  className?: string;
}) {
  const { recordProgress, ready } = useReader();
  const [percent, setPercent] = useState(0);
  const lastRecorded = useRef(-1);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    let frame = 0;

    function measure() {
      frame = 0;
      const box = article!.getBoundingClientRect();
      const viewport = window.innerHeight;

      /* Progress is measured from the article's top reaching the top of the
         viewport to its bottom reaching the bottom — so an article shorter
         than the screen is complete as soon as it has been seen, rather than
         stuck at zero forever. */
      const scrolled = viewport - box.top;
      const raw = box.height > 0 ? (scrolled / box.height) * 100 : 100;

      setPercent(Math.min(100, Math.max(0, raw)));
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [articleId]);

  useEffect(() => {
    if (!ready) return;
    const rounded = Math.round(percent);
    if (rounded === lastRecorded.current) return;
    lastRecorded.current = rounded;
    recordProgress(entry, rounded, chapter);
    // `entry` and `recordProgress` are recreated every render by the provider's
    // memo; keying the effect on the values that actually changed is what keeps
    // this from firing on every keystroke elsewhere in the tree.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, ready, entry.kind, entry.slug, chapter]);

  const remaining = Math.max(0, Math.round(readingMinutes * (1 - percent / 100)));
  const finished = percent >= COMPLETION_THRESHOLD;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="bg-border/70 relative h-1 flex-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full origin-left rounded-full bg-[var(--lb-primary)] transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${percent / 100})`, width: "100%" }}
        />
      </div>

      <span className="lb-caption flex shrink-0 items-center gap-1.5 text-[var(--lb-muted)]">
        {finished ? (
          <>
            <IconCheck size={12} className="text-[var(--lb-primary)]" />
            Finished
          </>
        ) : (
          <>
            <IconBookmarks size={12} className="" />
            <span className="tabular-nums">{remaining}</span> min left
          </>
        )}
      </span>
    </div>
  );
}
