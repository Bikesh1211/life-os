import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { Gallery } from "../_components/gallery";
import { ArchiveCrumb } from "../_components/archive-crumb";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from the expedition archive.",
};

export default async function GalleryPage() {
  const userId = await requireAuth();
  const { photos } = await loadArchive(userId);

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">Gallery</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          Frames from the road, drawn from the photo album and from every expedition and place that
          carries its own.
        </p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
        </p>
      </header>

      <Gallery photos={photos} />
    </main>
  );
}
