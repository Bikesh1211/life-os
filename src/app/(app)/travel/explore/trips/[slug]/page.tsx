import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconGauge,
  IconMountain,
  IconRoute,
  IconRuler,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { requireAuth } from "@/core/auth";
import { categoryFor, expeditionDate, expeditionPhotos } from "@/modules/travel/explore";
import { loadArchive, loadExpedition } from "@/modules/travel/explore/explore.server";
import { ExpeditionMap } from "../../_components/expedition-map";
import { RouteTimeline } from "../../_components/route-timeline";
import { FieldNotes } from "../../_components/field-notes";
import { Gallery } from "../../_components/gallery";
import { ExpeditionCard } from "../../_components/expedition-card";
import { PlaceCard } from "../../_components/place-card";
import { ArchiveCrumb } from "../../_components/archive-crumb";
import styles from "../../_components/explore.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const userId = await requireAuth();
  const expedition = await loadExpedition(userId, slug);
  if (!expedition) return {};

  return {
    title: expedition.title,
    description:
      expedition.description ||
      `Expedition ${expedition.number}: ${expedition.places.map((p) => p.name).join(" → ")}`,
  };
}

export default async function ExpeditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await requireAuth();
  const expedition = await loadExpedition(userId, slug);
  if (!expedition) notFound();

  const archive = await loadArchive(userId);
  const category = expedition.category ? categoryFor(expedition.category) : undefined;
  const date = expeditionDate(expedition);

  const related = archive.expeditions
    .filter((e) => e.id !== expedition.id && e.category === expedition.category)
    .slice(0, 3);

  const photos = expeditionPhotos(expedition);
  const mappable = expedition.places.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  return (
    <main className="pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="xp-narrow pt-10 sm:pt-14">
        <ArchiveCrumb label="Expeditions" href="/travel/explore/trips" />

        <p className="xp-label mb-4 text-[var(--xp-primary)]">Expedition {expedition.number}</p>
        <h1 className="xp-h2 text-balance">{expedition.title}</h1>

        {expedition.description && (
          <p className="xp-body-lg mt-5 max-w-2xl text-balance">{expedition.description}</p>
        )}

        <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--xp-muted)]">
          {date && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <IconCalendar size={14} aria-hidden="true" />
              <dd>
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </div>
          )}
          {typeof expedition.days === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Duration</dt>
              <IconClock size={14} aria-hidden="true" />
              <dd>
                {expedition.days} {expedition.days === 1 ? "day" : "days"}
              </dd>
            </div>
          )}
          {typeof expedition.distanceKm === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Distance</dt>
              <IconRuler size={14} aria-hidden="true" />
              <dd className="tabular-nums">{expedition.distanceKm} km</dd>
            </div>
          )}
          {typeof expedition.elevationM === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Elevation</dt>
              <IconMountain size={14} aria-hidden="true" />
              <dd className="tabular-nums">{expedition.elevationM} m</dd>
            </div>
          )}
          {expedition.transportation && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Transport</dt>
              <IconRoute size={14} aria-hidden="true" />
              <dd>{expedition.transportation}</dd>
            </div>
          )}
          {expedition.difficulty && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Difficulty</dt>
              <IconGauge size={14} aria-hidden="true" />
              <dd className="capitalize">{expedition.difficulty}</dd>
            </div>
          )}
          {expedition.companions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Companions</dt>
              <IconUsers size={14} aria-hidden="true" />
              <dd>{expedition.companions.join(", ")}</dd>
            </div>
          )}
          {category && (
            <dd className="rounded-sm bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] px-2 py-0.5 text-xs font-medium text-[var(--xp-primary)]">
              {category.label}
            </dd>
          )}
        </dl>

        {expedition.storyHref && (
          <Link
            href={expedition.storyHref}
            className="xp-label mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-[var(--xp-primary)] px-5 text-white transition-opacity hover:opacity-90"
          >
            Read the travel story
            <IconArrowRight size={14} />
          </Link>
        )}
      </header>

      {expedition.coverImage && (
        <div className="xp-container mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
              URL of unknown origin; `next/image` needs each host declared in
              `remotePatterns` before the page will render at all. */}
          <img
            src={expedition.coverImage}
            alt=""
            className="aspect-[2/1] w-full rounded-md border border-[var(--xp-border)] object-cover"
          />
        </div>
      )}

      {/* ── The route ──────────────────────────────────────────────────── */}
      {mappable.length > 0 && (
        <section className="xp-container mt-16" aria-labelledby="route">
          <h2 id="route" className="xp-label mb-5 text-[var(--xp-muted)]">
            The route
          </h2>
          <ExpeditionMap
            places={expedition.places}
            expeditions={[expedition]}
            focusExpedition={expedition.slug}
          />
        </section>
      )}

      <div className="xp-narrow">
        <RouteTimeline expedition={expedition} />

        {/* ── The story ────────────────────────────────────────────────── */}
        {expedition.story && (
          <section className="mt-16" aria-labelledby="story">
            <h2 id="story" className="xp-label mb-5 text-[var(--xp-muted)]">
              The story
            </h2>
            <div className="text-[1.0625rem] leading-[1.85] opacity-90">
              {expedition.story.split("\n").map((line, i) =>
                line.trim() ? (
                  <p key={i} className="mb-5">
                    {line}
                  </p>
                ) : null,
              )}
            </div>
            {expedition.storyHref && (
              <Link
                href={expedition.storyHref}
                className="xp-label mt-4 inline-flex items-center gap-1.5 text-[var(--xp-primary)] hover:opacity-80"
              >
                Read the full account
                <IconArrowRight size={12} />
              </Link>
            )}
          </section>
        )}

        <FieldNotes notes={expedition.fieldNotes} id="field-notes" />

        {expedition.highlights.length > 0 && (
          <section className="mt-16" aria-labelledby="highlights">
            <h2 id="highlights" className="xp-label mb-5 text-[var(--xp-muted)]">
              Highlights
            </h2>
            <ul
              className={cn(
                styles.paper,
                "space-y-0 overflow-hidden rounded-md border border-[var(--xp-border)]",
              )}
            >
              {expedition.highlights.map((item, i) => (
                <li
                  key={i}
                  className="border-b border-[var(--xp-border)] px-5 py-4 text-sm last:border-b-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <FieldNotes notes={expedition.lessons} title="What it taught me" id="lessons" />
        <FieldNotes notes={expedition.tips} title="If you go" id="tips" />
      </div>

      {/* ── Memories ───────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <section className="xp-container mt-16" aria-labelledby="memories">
          <h2 id="memories" className="xp-label mb-5 text-[var(--xp-muted)]">
            Memories
          </h2>
          <Gallery photos={photos} />
        </section>
      )}

      {/* ── Places on this expedition ──────────────────────────────────── */}
      {expedition.places.length > 0 && (
        <section className="xp-container mt-16" aria-labelledby="places">
          <h2 id="places" className="xp-label mb-5 text-[var(--xp-muted)]">
            Places reached
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expedition.places.map((place) => (
              <li key={place.id}>
                <PlaceCard place={place} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Related ────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="xp-container mt-20" aria-labelledby="related">
          <h2 id="related" className="xp-label mb-5 text-[var(--xp-muted)]">
            Other {category?.nounPlural ?? "expeditions"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ExpeditionCard expedition={item} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
