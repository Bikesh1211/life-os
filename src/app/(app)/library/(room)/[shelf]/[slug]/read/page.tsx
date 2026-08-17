import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/core/auth";
import { entryHref, shelfForSegment } from "@/modules/library";
import { loadEntry } from "@/modules/library/library.server";
import { ReaderMode } from "../../../../_components/reader-mode";

/**
 * Distraction-free reading — `/library/books/the-moon/read`.
 *
 * Only chaptered work has a reading mode, and an entry that turns out to have
 * no chapters redirects to its own page rather than showing an empty reader:
 * the reading route is a *way of reading* something, so it has nothing to say
 * about a piece that is already one page long.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shelf: string; slug: string }>;
}): Promise<Metadata> {
  const { shelf: segment, slug } = await params;
  const shelf = shelfForSegment(segment);
  if (!shelf) return {};

  const userId = await requireAuth();
  const entry = await loadEntry(userId, shelf.kind, slug);
  if (!entry) return {};

  return { title: `Reading — ${entry.title}`, description: entry.description };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ shelf: string; slug: string }>;
}) {
  const { shelf: segment, slug } = await params;
  const shelf = shelfForSegment(segment);
  if (!shelf) notFound();

  const userId = await requireAuth();
  const entry = await loadEntry(userId, shelf.kind, slug);
  if (!entry) notFound();
  if (entry.chapters.length === 0) redirect(entryHref(entry));

  return (
    /* `useSearchParams` reads the chapter, so the client boundary needs a
       Suspense fence — without one the whole route opts out of static
       rendering and the book is re-fetched on every page turn. */
    <Suspense fallback={<div className="min-h-screen" />}>
      <ReaderMode entry={entry} />
    </Suspense>
  );
}
