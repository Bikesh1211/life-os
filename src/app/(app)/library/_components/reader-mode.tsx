"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconChevronLeft, IconChevronRight, IconList, IconX } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { type LibraryEntry } from "@/modules/library";
import { entryHref } from "@/modules/library";
import { useReader } from "./reader";
import { Prose } from "./prose";
import { ReadingProgress } from "./reading-progress";
import styles from "./library.module.css";

const ARTICLE_ID = "reading-mode-article";

/**
 * Reading mode: one chapter, and almost nothing else.
 *
 * The brief asks for a distraction-free route, so this hides the site's own
 * chrome while it is open — `data-reading="on"` on the document element, which
 * `globals.css` uses to fold away the header, the footer and the library rail.
 * An attribute rather than a portal or a second layout, because the page
 * underneath is a normal server-rendered route and should stay one: reading
 * mode is a *state*, not a different application.
 *
 * The chapter lives in the URL (`?chapter=`), which is what makes a chapter
 * linkable, restorable and correct under the back button. The reader's stored
 * position follows it.
 */
export function ReaderMode({ entry }: { entry: LibraryEntry }) {
  const router = useRouter();
  const params = useSearchParams();
  const { positionOf, ready } = useReader();
  const [contentsOpen, setContentsOpen] = useState(false);

  const chapters = entry.chapters;
  const requested = params.get("chapter");

  const index = useMemo(() => {
    const found = chapters.findIndex((chapter) => chapter.slug === requested);
    return found === -1 ? 0 : found;
  }, [chapters, requested]);

  const chapter = chapters[index];

  /* Hides the surrounding chrome for as long as this component is mounted, and
     puts it back on the way out — including when the reader navigates away
     mid-chapter rather than pressing Close. */
  useEffect(() => {
    document.documentElement.setAttribute("data-reading", "on");
    return () => document.documentElement.removeAttribute("data-reading");
  }, []);

  /* Arrow keys turn pages, Escape closes. Ignored while a field has focus, so
     the search box inside a browser extension does not start flipping chapters. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "Escape") {
        if (contentsOpen) setContentsOpen(false);
        else router.push(entryHref(entry));
      }
      if (event.key === "ArrowRight" && index < chapters.length - 1) {
        goTo(chapters[index + 1].slug);
      }
      if (event.key === "ArrowLeft" && index > 0) {
        goTo(chapters[index - 1].slug);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, chapters, contentsOpen, entry.kind, entry.slug]);

  function goTo(slug: string) {
    setContentsOpen(false);
    router.replace(`?chapter=${slug}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Resuming: with no chapter in the URL, pick up where the reader stopped.
  useEffect(() => {
    if (!ready || requested) return;
    const stored = positionOf(entry)?.chapter;
    if (stored && chapters.some((c) => c.slug === stored)) {
      router.replace(`?chapter=${stored}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, requested]);

  if (!chapter) {
    return (
      <div className="lb-narrow py-24 text-center">
        <p className="text-[var(--lb-muted)]">This book has no chapters yet.</p>
        <Link
          href={entryHref(entry)}
          className="mt-4 inline-block text-[var(--lb-primary)] underline"
        >
          Back to the book
        </Link>
      </div>
    );
  }

  const previous = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  return (
    <div className="min-h-screen bg-[var(--lb-bg)]">
      {/* ── The only chrome ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--lb-border)]/60 bg-[var(--lb-bg)]/90 backdrop-blur-md">
        <div className="lb-narrow flex h-14 items-center gap-3">
          <button
            type="button"
            onClick={() => setContentsOpen((open) => !open)}
            aria-expanded={contentsOpen}
            aria-controls="reading-contents"
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-fg)]"
          >
            <IconList size={16} className="" />
            <span className="hidden sm:inline">Contents</span>
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-medium">{entry.title}</p>
            <p className="lb-caption truncate text-[var(--lb-muted)]">
              {index + 1} / {chapters.length} · {chapter.title}
            </p>
          </div>

          <Link
            href={entryHref(entry)}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-fg)]"
          >
            <span className="hidden sm:inline">Close</span>
            <IconX size={16} className="" />
            <span className="sr-only">Leave reading mode</span>
          </Link>
        </div>

        <div className="lb-narrow pb-2">
          <ReadingProgress
            entry={entry}
            articleId={ARTICLE_ID}
            chapter={chapter.slug}
            readingMinutes={entry.readingMinutes}
          />
        </div>
      </header>

      {/* ── Contents ───────────────────────────────────────────────────── */}
      {contentsOpen && (
        <nav
          id="reading-contents"
          aria-label="Chapters"
          className="border-b border-[var(--lb-border)] bg-[var(--lb-card)]/50"
        >
          <ol className="lb-narrow max-h-[50vh] overflow-y-auto py-3">
            {chapters.map((item, itemIndex) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => goTo(item.slug)}
                  aria-current={itemIndex === index ? "location" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                    itemIndex === index
                      ? "bg-[var(--lb-primary)]/10 font-medium text-[var(--lb-primary)]"
                      : "text-[var(--lb-muted)] hover:bg-[var(--lb-bg)] hover:text-[var(--lb-fg)]",
                  )}
                >
                  <span className="font-mono text-xs tabular-nums">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* ── The page ───────────────────────────────────────────────────── */}
      <main className="lb-narrow py-12 sm:py-16">
        <article id={ARTICLE_ID} key={chapter.slug} className={styles.pageIn}>
          <p className="lb-caption mb-3 text-[var(--lb-primary)]">Chapter {index + 1}</p>
          <h1 className="lb-h3 mb-10 text-balance">{chapter.title}</h1>
          <Prose markdown={chapter.content} dropCap />
        </article>

        {/* ── Turning the page ─────────────────────────────────────────── */}
        <nav
          aria-label="Chapter navigation"
          className="mt-16 flex items-stretch gap-3 border-t border-[var(--lb-border)] pt-6"
        >
          {previous ? (
            <button
              type="button"
              onClick={() => goTo(previous.slug)}
              className={cn(
                styles.lift,
                "flex flex-1 items-center gap-3 rounded-md border border-[var(--lb-border)] p-4 text-left",
              )}
            >
              <IconChevronLeft size={16} className="shrink-0 text-[var(--lb-primary)]" />
              <span className="min-w-0">
                <span className="lb-caption block text-[var(--lb-muted)]">Previous</span>
                <span className="block truncate text-sm">{previous.title}</span>
              </span>
            </button>
          ) : (
            <span className="flex-1" />
          )}

          {next ? (
            <button
              type="button"
              onClick={() => goTo(next.slug)}
              className={cn(
                styles.lift,
                "flex flex-1 items-center justify-end gap-3 rounded-md border border-[var(--lb-border)] p-4 text-right",
              )}
            >
              <span className="min-w-0">
                <span className="lb-caption block text-[var(--lb-muted)]">Next</span>
                <span className="block truncate text-sm">{next.title}</span>
              </span>
              <IconChevronRight size={16} className="shrink-0 text-[var(--lb-primary)]" />
            </button>
          ) : (
            <Link
              href={entryHref(entry)}
              className={cn(
                styles.lift,
                "flex flex-1 flex-col justify-center rounded-md border border-[var(--lb-border)] p-4 text-right",
              )}
            >
              <span className="lb-caption text-[var(--lb-muted)]">The end</span>
              <span className="text-sm">Back to the book</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
