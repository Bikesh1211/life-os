import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { buildArchiveIndex } from "@/modules/travel/explore";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ExploreChrome } from "./_components/explore-chrome";

export const metadata: Metadata = {
  title: {
    default: "The Adventure Archive",
    template: "%s — The Adventure Archive",
  },
  description: "Places you have been. Roads you have taken. Stories you brought back.",
};

/**
 * The archive's shell.
 *
 * The records are read once here and only the *index* — names, slugs, cities
 * and one-line descriptions — is handed to the chrome, so search works over the
 * same set the pages render from without shipping every expedition's narrative
 * and every gallery URL to the browser.
 *
 * `loadArchive` is wrapped in React's `cache`, so the pages below reading it
 * again inside the same request cost nothing.
 */
export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAuth();
  const archive = await loadArchive(userId);

  const index = buildArchiveIndex(
    archive.expeditions,
    archive.places,
    archive.stories.map((s) => ({ title: s.title, description: s.description, href: s.href })),
  );

  return (
    <div className="xp min-h-screen">
      <ExploreChrome index={index}>{children}</ExploreChrome>
    </div>
  );
}
