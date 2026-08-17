import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/core/auth";
import { shelfForSegment } from "@/modules/library";
import { loadEntry, loadLibrary } from "@/modules/library/library.server";
import { EntryPage } from "../../../_components/entry-page";

async function resolve(userId: string, params: Promise<{ shelf: string; slug: string }>) {
  const { shelf: segment, slug } = await params;
  const shelf = shelfForSegment(segment);
  if (!shelf) return undefined;
  return loadEntry(userId, shelf.kind, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shelf: string; slug: string }>;
}): Promise<Metadata> {
  const userId = await requireAuth();
  const entry = await resolve(userId, params);
  if (!entry) return {};
  return {
    title: entry.seo?.title || entry.title,
    description: entry.seo?.description || entry.description || entry.title,
  };
}

export default async function LibraryEntryPage({
  params,
}: {
  params: Promise<{ shelf: string; slug: string }>;
}) {
  const userId = await requireAuth();
  const entry = await resolve(userId, params);
  if (!entry) notFound();

  const library = await loadLibrary(userId);

  return (
    <main>
      <EntryPage entry={entry} library={library} />
    </main>
  );
}
