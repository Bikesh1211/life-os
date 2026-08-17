import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ArchiveTimeline } from "../_components/archive-timeline";
import { ArchiveCrumb } from "../_components/archive-crumb";

export const metadata: Metadata = {
  title: "Timeline",
  description:
    "The travel history in order — every expedition and every place reached, grouped by year.",
};

export default async function TimelinePage() {
  const userId = await requireAuth();
  const { expeditions, places } = await loadArchive(userId);

  return (
    <main className="xp-narrow py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-12">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">Timeline</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          The archive in the order it happened — expeditions and the places they reached, plus every
          place visited on its own. A year with nothing in it does not appear: the gap is the
          record.
        </p>
      </header>

      <ArchiveTimeline expeditions={expeditions} places={places} />
    </main>
  );
}
