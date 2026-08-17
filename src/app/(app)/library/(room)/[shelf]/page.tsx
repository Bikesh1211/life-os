import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconPencilPlus } from "@tabler/icons-react";
import { requireAuth } from "@/core/auth";
import { shelfForSegment } from "@/modules/library";
import { loadLibrary } from "@/modules/library/library.server";
import { ShelfBrowser } from "../../_components/shelf-browser";

/**
 * One shelf — `/library/books`, `/library/journal`, and the six others.
 *
 * A dynamic segment rather than eight near-identical route files. Every one is
 * a real, directly-addressable route; what is shared is the *implementation*,
 * which is the whole point of a common content model. An unrecognised segment
 * is a 404 rather than an empty shelf.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shelf: string }>;
}): Promise<Metadata> {
  const { shelf: segment } = await params;
  const shelf = shelfForSegment(segment);
  if (!shelf) return {};
  return { title: shelf.title, description: shelf.blurb };
}

export default async function ShelfPage({ params }: { params: Promise<{ shelf: string }> }) {
  const { shelf: segment } = await params;
  const shelf = shelfForSegment(segment);
  if (!shelf) notFound();

  const userId = await requireAuth();
  const library = await loadLibrary(userId);
  const entries = library.filter((entry) => entry.kind === shelf.kind);
  const Icon = shelf.icon;

  return (
    <main className="lb-container py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/library"
          className="lb-caption inline-flex items-center gap-1.5 text-[var(--lb-muted)] transition-colors hover:text-[var(--lb-primary)]"
        >
          <IconArrowLeft size={12} />
          The Library
        </Link>
      </nav>

      <header className="mb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm text-[var(--lb-primary)]/70">{shelf.numeral}</span>
            <h1 className="lb-h2 flex items-center gap-3 tracking-[0.08em] uppercase">
              <Icon size={26} className="text-[var(--lb-primary)]" aria-hidden="true" />
              {shelf.title}
            </h1>
          </div>

          {/* Every shelf is a view of a record another module owns, so the
              shelf says where its entries are written rather than pretending
              the library could make one. */}
          <Link
            href={shelf.writeHref}
            className="lb-caption inline-flex items-center gap-1.5 rounded-md border border-[var(--lb-border)] px-3 py-1.5 text-[var(--lb-muted)] transition-colors hover:border-[color-mix(in_oklab,var(--lb-primary)_40%,transparent)] hover:text-[var(--lb-primary)]"
          >
            <IconPencilPlus size={13} />
            Write a {shelf.noun}
          </Link>
        </div>

        <p className="lb-body mt-4 max-w-2xl text-balance">{shelf.blurb}</p>
        <p className="lb-caption mt-4 text-[var(--lb-muted)]">
          {entries.length} {entries.length === 1 ? shelf.noun : shelf.nounPlural}
        </p>
      </header>

      <ShelfBrowser entries={entries} emptyMessage={shelf.empty} />
    </main>
  );
}
