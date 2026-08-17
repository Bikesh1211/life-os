import Link from "next/link";
import { IconArrowRight, IconPencilPlus } from "@tabler/icons-react";
import { requireAuth } from "@/core/auth";
import { SHELVES, buildIndex, byNewest, shelfHref } from "@/modules/library";
import { loadLibrary } from "@/modules/library/library.server";
import { LibraryHero } from "../_components/library-hero";
import { ShelfRail } from "../_components/shelf-rail";
import { ContinueReading } from "../_components/continue-reading";
import { BookCard } from "../_components/book-card";

/**
 * The landing page: the room itself.
 *
 * Eight shelves in the order the room is arranged in, each showing its four
 * most recent pieces and linking to the whole of itself. Above them, whatever
 * the reader has left unfinished; below, the most recent writing across every
 * shelf, because someone who has just arrived wants the newest thing, not the
 * newest thing on shelf one.
 */
export default async function LibraryPage() {
  const userId = await requireAuth();
  const library = await loadLibrary(userId);
  const index = buildIndex(library);
  const recent = library.slice().sort(byNewest).slice(0, 6);

  return (
    <main>
      <LibraryHero entries={library} />

      <div className="lb-container space-y-20 pb-24">
        <ContinueReading index={index} />

        {/* ── The shelves ─────────────────────────────────────────────── */}
        <section id="shelves" className="scroll-mt-28 space-y-16">
          {SHELVES.map((shelf) => (
            <ShelfRail
              key={shelf.kind}
              shelf={shelf}
              entries={library.filter((entry) => entry.kind === shelf.kind)}
            />
          ))}
        </section>

        {/* ── Most recent, across everything ──────────────────────────── */}
        {recent.length > 0 && (
          <section id="recent" aria-labelledby="recent-heading" className="scroll-mt-28">
            <h2 id="recent-heading" className="lb-section-title mb-6">
              Most recent
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((entry) => (
                <li key={`${entry.kind}:${entry.slug}`}>
                  <BookCard entry={entry} className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── The way out ─────────────────────────────────────────────── */}
        <section className="border-t border-[var(--lb-border)] pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-lg text-lg text-[var(--lb-muted)] italic">
              &ldquo;Every journey leaves a story. Every thought becomes a page.&rdquo;
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/journal/new"
                className="flex items-center gap-2 rounded-md bg-[var(--lb-primary)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <IconPencilPlus size={14} />
                Write something
              </Link>
              <Link
                href={shelfHref(SHELVES[0])}
                className="flex items-center gap-2 rounded-md border border-[var(--lb-border)] px-4 py-2.5 text-sm transition-colors hover:border-[color-mix(in_oklab,var(--lb-primary)_40%,transparent)] hover:text-[var(--lb-primary)]"
              >
                Start with the journal
                <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
