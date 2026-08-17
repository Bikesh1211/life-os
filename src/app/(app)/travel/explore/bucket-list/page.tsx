import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { BucketList } from "../_components/bucket-list";
import { ExpeditionMap } from "../_components/expedition-map";
import { ArchiveCrumb } from "../_components/archive-crumb";

export const metadata: Metadata = {
  title: "The Next Expeditions",
  description: "Destinations still to reach — why, when, and how hard.",
};

export default async function BucketListPage() {
  const userId = await requireAuth();
  const { places, expeditions } = await loadArchive(userId);
  const planned = places.filter((p) => p.status === "WISHLIST");
  const mappable = planned.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">The Next Expeditions</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          Ground not yet covered. Marking one visited on the Travel wishlist moves it out of this
          list and into the archive — there is no second record to keep in step.
        </p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {planned.length} {planned.length === 1 ? "destination" : "destinations"}
        </p>
      </header>

      {/* The map only when something on the list actually carries a position:
          an empty world map under a full list reads as the list being wrong. */}
      {mappable.length > 0 && (
        <div className="mb-12">
          <ExpeditionMap places={planned} expeditions={expeditions} status="WISHLIST" />
        </div>
      )}

      <BucketList places={places} />
    </main>
  );
}
