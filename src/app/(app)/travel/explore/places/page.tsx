import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ExploreBrowser } from "../_components/explore-browser";
import { ArchiveCrumb } from "../_components/archive-crumb";

export const metadata: Metadata = {
  title: "Places",
  description: "Every location in the archive — visited and planned.",
};

export default async function PlacesPage() {
  const userId = await requireAuth();
  const { places, stats } = await loadArchive(userId);

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">Places</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          The exploration archive: every position recorded, across {stats.cities}{" "}
          {stats.cities === 1 ? "city" : "cities"} and {stats.countries}{" "}
          {stats.countries === 1 ? "country" : "countries"}.
        </p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {stats.places} visited · {stats.planned} planned
        </p>
      </header>

      <ExploreBrowser mode="places" places={places} emptyMessage="No locations recorded yet." />
    </main>
  );
}
