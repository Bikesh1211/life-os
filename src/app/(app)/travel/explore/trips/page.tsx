import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ExploreBrowser } from "../_components/explore-browser";
import { ArchiveCrumb } from "../_components/archive-crumb";

export const metadata: Metadata = {
  title: "Expeditions",
  description: "Every trip in the archive — routes, distances, companions and the ground covered.",
};

export default async function TripsPage() {
  const userId = await requireAuth();
  const { expeditions } = await loadArchive(userId);

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">Expeditions</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          Every outing on the record, newest first — where it went, how far, and what came back with
          it.
        </p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {expeditions.length} {expeditions.length === 1 ? "expedition" : "expeditions"}
        </p>
      </header>

      <ExploreBrowser
        mode="expeditions"
        expeditions={expeditions}
        emptyMessage="No expeditions logged yet. Add a trip in Travel and it appears here."
      />
    </main>
  );
}
