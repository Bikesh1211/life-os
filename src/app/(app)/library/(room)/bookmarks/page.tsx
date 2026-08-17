import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { requireAuth } from "@/core/auth";
import { buildIndex } from "@/modules/library";
import { loadLibrary } from "@/modules/library/library.server";
import { BookmarksView } from "../../_components/bookmarks-view";

/**
 * Favourites.
 *
 * Nothing on this page can be rendered on the server — what a reader saved
 * lives in their browser — so what the server sends is the *index* the view
 * needs to turn saved keys back into titles, and the view fills in from storage
 * after hydration.
 */
export const metadata: Metadata = {
  title: "Favourites",
  description: "Writing you have saved from the library, stored on this device.",
};

export default async function BookmarksPage() {
  const userId = await requireAuth();
  const library = await loadLibrary(userId);

  return (
    <main className="lb-narrow py-12 sm:py-16">
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
        <h1 className="lb-h2 tracking-[0.08em] uppercase">Favourites</h1>
        <p className="lb-body mt-4 max-w-xl text-balance">
          Everything you have set aside to come back to.
        </p>
      </header>

      <BookmarksView index={buildIndex(library)} />
    </main>
  );
}
