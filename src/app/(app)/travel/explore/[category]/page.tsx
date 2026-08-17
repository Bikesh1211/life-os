import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/core/auth";
import { CATEGORIES, categoryForSegment } from "@/modules/travel/explore";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ExploreBrowser } from "../_components/explore-browser";
import { ArchiveCrumb } from "../_components/archive-crumb";

/**
 * One kind of outing — `/travel/explore/mountains`, `/travel/explore/beaches`,
 * and the six others.
 *
 * A dynamic segment rather than eight near-identical route files. Every one is
 * a real, directly addressable route; what is shared is the implementation. The
 * static siblings (`places`, `trips`, `gallery`, …) take precedence over this
 * segment in Next's matcher, so they are never captured by it, and an
 * unrecognised segment is a 404 rather than an empty page.
 */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.segment }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: segment } = await params;
  const category = categoryForSegment(segment);
  if (!category) return {};
  return { title: category.label, description: category.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: segment } = await params;
  const category = categoryForSegment(segment);
  if (!category) notFound();

  const userId = await requireAuth();
  const { expeditions, places } = await loadArchive(userId);
  const matching = expeditions.filter((e) => e.category === category.key);
  const matchingPlaces = places.filter((p) => p.category === category.key);
  const Icon = category.icon;

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 flex items-center gap-3 tracking-[0.06em] uppercase">
          <Icon size={26} className="text-[var(--xp-primary)]" aria-hidden="true" />
          {category.label}
        </h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">{category.blurb}</p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {matching.length} {matching.length === 1 ? category.noun : category.nounPlural}
          {matchingPlaces.length > 0 && ` · ${matchingPlaces.length} places`}
        </p>
      </header>

      <ExploreBrowser
        mode="expeditions"
        expeditions={matching}
        lockCategory={category.key}
        emptyMessage={category.empty}
      />

      {matchingPlaces.length > 0 && (
        <section className="mt-16">
          <h2 className="xp-label mb-5 text-[var(--xp-muted)]">Places of this kind</h2>
          <ExploreBrowser
            mode="places"
            places={matchingPlaces}
            lockCategory={category.key}
            emptyMessage={category.empty}
          />
        </section>
      )}
    </main>
  );
}
