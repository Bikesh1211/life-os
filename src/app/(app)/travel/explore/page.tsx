import Link from "next/link";
import { IconArrowRight, IconCompass } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { requireAuth } from "@/core/auth";
import { CATEGORIES } from "@/modules/travel/explore";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { CompassRose } from "./_components/compass-rose";
import { ExpeditionMap } from "./_components/expedition-map";
import { ExpeditionCard } from "./_components/expedition-card";
import { StatBand } from "./_components/stat-band";
import styles from "./_components/explore.module.css";

/**
 * THE ADVENTURE ARCHIVE — the way in.
 *
 * The map is the page's centre of gravity and everything else grows around it,
 * which is the right structure for this record: the archive's one irreplaceable
 * view is "where have I actually been".
 */
export default async function ExplorePage() {
  const userId = await requireAuth();
  const archive = await loadArchive(userId);
  const { expeditions, places, stats } = archive;

  const featured = expeditions.find((e) => e.featured) ?? expeditions[0];
  const recent = expeditions.slice(0, 3);
  const next =
    places.find((p) => p.status === "WISHLIST" && p.planningStatus === "ready") ??
    places.find((p) => p.status === "WISHLIST");

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 right-0 hidden opacity-[0.13] lg:block"
          aria-hidden="true"
        >
          <CompassRose className="size-[32rem]" />
        </div>

        <div className="xp-container relative pt-14 pb-10 sm:pt-20">
          <p className="xp-label mb-6 flex items-center gap-2 text-[var(--xp-primary)]">
            <IconCompass size={14} aria-hidden="true" />
            Expedition archive
          </p>

          <h1 className="xp-h1 max-w-3xl text-balance">THE ADVENTURE ARCHIVE</h1>

          <p className="xp-body-lg mt-6 max-w-2xl text-balance">
            Places you&rsquo;ve been. Roads you&rsquo;ve taken. Stories you brought back.
          </p>

          {archive.empty ? (
            <p className="mt-10 max-w-xl rounded-md border border-dashed border-[var(--xp-border)] px-5 py-4 text-sm text-[var(--xp-muted)]">
              The archive is empty. Add a trip, a visited place or a wishlist destination in{" "}
              <Link href="/travel" className="text-[var(--xp-primary)] underline-offset-4 hover:underline">
                Travel
              </Link>{" "}
              and it appears here, on the map, in the timeline and in the category views at once.
            </p>
          ) : (
            <StatBand stats={stats} className="mt-12" />
          )}
        </div>
      </section>

      <div className="xp-container space-y-20 pb-24">
        {/* ── The map ──────────────────────────────────────────────────── */}
        {!archive.empty && (
          <section id="map" aria-labelledby="map-heading" className="scroll-mt-28">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="map-heading" className="xp-section-title">
                  Expedition map
                </h2>
                <p className="mt-1 max-w-xl text-sm text-[var(--xp-muted)]">
Every recorded position, on real geography. Drag to pan, scroll or pinch to
                    zoom, and open any marker for its record.
                </p>
              </div>
              <Link
                href="/travel/explore/places"
                className="xp-label flex shrink-0 items-center gap-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-primary)]"
              >
                All {stats.places} places
                <IconArrowRight size={12} />
              </Link>
            </header>

            <ExpeditionMap places={places} expeditions={expeditions} />
          </section>
        )}

        {/* ── Featured expedition ──────────────────────────────────────── */}
        {featured && (
          <section aria-labelledby="featured-heading" className="scroll-mt-28">
            <h2 id="featured-heading" className="xp-label mb-5 text-[var(--xp-muted)]">
              {featured.featured ? "Featured expedition" : "Latest expedition"}
            </h2>

            <div
              className={cn(
                styles.corners,
                styles.paper,
                "grid gap-8 rounded-md border border-[var(--xp-border)] p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8",
              )}
            >
              <div>
                <p className="xp-label text-[var(--xp-primary)]">Expedition {featured.number}</p>
                <h3 className="xp-h3 mt-2 text-balance">{featured.title}</h3>
                {featured.description && (
                  <p className="xp-body mt-4 max-w-xl">{featured.description}</p>
                )}

                {featured.places.length > 0 && (
                  <p className="mt-5 font-mono text-xs text-[var(--xp-muted)]">
                    {featured.places.map((p) => p.name).join("  →  ")}
                  </p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/travel/explore/trips/${featured.slug}`}
                    className="xp-label inline-flex h-11 items-center gap-2 rounded-md bg-[var(--xp-primary)] px-5 text-white transition-opacity hover:opacity-90"
                  >
                    Open expedition
                    <IconArrowRight size={14} />
                  </Link>
                  {featured.storyHref && (
                    <Link
                      href={featured.storyHref}
                      className="xp-label inline-flex h-11 items-center rounded-md border border-[var(--xp-border)] px-5 transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] hover:text-[var(--xp-primary)]"
                    >
                      Read the travel story
                    </Link>
                  )}
                </div>
              </div>

              <ExpeditionMap
                places={featured.places}
                expeditions={[featured]}
                focusExpedition={featured.slug}
                compact
              />
            </div>
          </section>
        )}

        {/* ── Recent expeditions ───────────────────────────────────────── */}
        {recent.length > 0 && (
          <section id="expeditions" aria-labelledby="recent-heading" className="scroll-mt-28">
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 id="recent-heading" className="xp-section-title">
                Recent expeditions
              </h2>
              <Link
                href="/travel/explore/trips"
                className="xp-label flex shrink-0 items-center gap-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-primary)]"
              >
                All {stats.expeditions}
                <IconArrowRight size={12} />
              </Link>
            </header>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((expedition) => (
                <li key={expedition.id}>
                  <ExpeditionCard expedition={expedition} className="h-full" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Categories ───────────────────────────────────────────────── */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="xp-label mb-5 text-[var(--xp-muted)]">
            By kind
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => {
              const count = expeditions.filter((e) => e.category === category.key).length;
              const Icon = category.icon;
              return (
                <li key={category.key}>
                  <Link
                    href={`/travel/explore/${category.segment}`}
                    className={cn(
                      styles.lift,
                      styles.card,
                      "flex h-full flex-col rounded-md p-4",
                    )}
                  >
                    <Icon size={16} className="mb-3 text-[var(--xp-primary)]" aria-hidden="true" />
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="xp-label mt-1 text-[var(--xp-muted)] tabular-nums">
                      {count} {count === 1 ? category.noun : category.nounPlural}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Next destination ─────────────────────────────────────────── */}
        {next && (
          <section id="next" aria-labelledby="next-heading" className="scroll-mt-28">
            <h2 id="next-heading" className="xp-label mb-5 text-[var(--xp-muted)]">
              Next destination
            </h2>

            <div
              className={cn(
                styles.corners,
                styles.card,
                "flex flex-wrap items-end justify-between gap-6 rounded-md p-6 sm:p-8",
              )}
            >
              <div>
                <h3 className="xp-h3 text-balance">{next.name}</h3>
                {(next.city || next.country) && (
                  <p className="mt-2 text-sm text-[var(--xp-muted)]">
                    {[next.city, next.country].filter(Boolean).join(", ")}
                  </p>
                )}
                {next.why && <p className="xp-body mt-4 max-w-xl text-balance italic">{next.why}</p>}
                <p className="xp-label mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[var(--xp-muted)]">
                  {next.bestSeason && <span>Best: {next.bestSeason}</span>}
                  {next.difficulty && <span className="capitalize">{next.difficulty}</span>}
                  {next.planningStatus && <span>{next.planningStatus}</span>}
                </p>
              </div>

              <Link
                href="/travel/explore/bucket-list"
                className="xp-label inline-flex h-11 items-center gap-2 rounded-md border border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] px-5 text-[var(--xp-primary)] transition-colors hover:bg-[color-mix(in_oklab,var(--xp-primary)_10%,transparent)]"
              >
                The next expeditions
                <IconArrowRight size={14} />
              </Link>
            </div>
          </section>
        )}

        {/* ── The way out ──────────────────────────────────────────────── */}
        <section className="border-t border-[var(--xp-border)] pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-lg text-lg text-[var(--xp-muted)] italic">
              &ldquo;Every journey leaves a story.&rdquo;
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/travel/explore/timeline"
                className="flex items-center gap-2 rounded-md bg-[var(--xp-primary)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Walk the timeline
                <IconArrowRight size={14} />
              </Link>
              <Link
                href="/travel"
                className="flex items-center gap-2 rounded-md border border-[var(--xp-border)] px-4 py-2.5 text-sm transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_40%,transparent)] hover:text-[var(--xp-primary)]"
              >
                Return to Travel
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
