import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconExternalLink,
  IconGauge,
  IconMapPin,
  IconMountain,
  IconStarFilled,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { requireAuth } from "@/core/auth";
import { categoryFor, nearbyPlaces } from "@/modules/travel/explore";
import { loadArchive, loadPlace } from "@/modules/travel/explore/explore.server";
import { ExpeditionMap } from "../../_components/expedition-map";
import { Gallery } from "../../_components/gallery";
import { PlaceCard } from "../../_components/place-card";
import { ExpeditionCard } from "../../_components/expedition-card";
import { ArchiveCrumb } from "../../_components/archive-crumb";
import styles from "../../_components/explore.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const userId = await requireAuth();
  const place = await loadPlace(userId, slug);
  if (!place) return {};

  const where = [place.city, place.country].filter(Boolean).join(", ");
  return {
    title: place.name,
    description: place.description || place.notes || `${place.name}${where ? ` — ${where}` : ""}.`,
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await requireAuth();
  const place = await loadPlace(userId, slug);
  if (!place) notFound();

  const archive = await loadArchive(userId);
  const category = place.category ? categoryFor(place.category) : undefined;
  const nearby = nearbyPlaces(place, archive.places);
  const expedition = archive.expeditions.find((e) => e.id === place.tripId);
  const planned = place.status === "WISHLIST";
  const where = [place.city, place.country].filter(Boolean).join(", ");

  const photos = [
    ...(place.coverImage
      ? [{ src: place.coverImage, title: place.name, location: place.city, date: place.visitedAt }]
      : []),
    ...place.gallery.map((src) => ({
      src,
      title: place.name,
      location: place.city,
      date: place.visitedAt,
    })),
  ];

  const located = typeof place.latitude === "number" && typeof place.longitude === "number";

  return (
    <main className="pb-24">
      <header className="xp-narrow pt-10 sm:pt-14">
        <ArchiveCrumb label="Places" href="/travel/explore/places" />

        <p className="xp-label mb-4 flex items-center gap-2 text-[var(--xp-primary)]">
          {category?.label ?? (planned ? "Planned" : "Visited")}
          {place.isFavorite && <IconStarFilled size={12} aria-label="Favourite" />}
        </p>

        <h1 className="xp-h2 text-balance">{place.name}</h1>

        {where && (
          <p className="xp-body-lg mt-3 flex items-center gap-2">
            <IconMapPin size={16} aria-hidden="true" />
            {where}
          </p>
        )}

        {(place.description || place.notes) && (
          <p className="xp-body mt-6 max-w-2xl text-balance italic">
            {place.notes || place.description}
          </p>
        )}

        <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--xp-muted)]">
          {place.visitedAt && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Visited</dt>
              <IconCalendar size={14} aria-hidden="true" />
              <dd>
                <time dateTime={place.visitedAt}>
                  {new Date(place.visitedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </div>
          )}

          {typeof place.elevation === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Elevation</dt>
              <IconMountain size={14} aria-hidden="true" />
              <dd className="tabular-nums">{place.elevation} m</dd>
            </div>
          )}

          {located && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Coordinates</dt>
              <dd className="font-mono text-xs tabular-nums">
                {place.latitude!.toFixed(4)}, {place.longitude!.toFixed(4)}
              </dd>
            </div>
          )}

          {place.difficulty && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Difficulty</dt>
              <IconGauge size={14} aria-hidden="true" />
              <dd className="capitalize">{place.difficulty}</dd>
            </div>
          )}

          {typeof place.rating === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Rating</dt>
              <dd className="tabular-nums">{place.rating}/10</dd>
            </div>
          )}

          {place.companions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Companions</dt>
              <IconUsers size={14} aria-hidden="true" />
              <dd>{place.companions.join(", ")}</dd>
            </div>
          )}
        </dl>

        {place.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-sm border border-[var(--xp-border)] px-2 py-0.5 text-xs"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {expedition && (
            <Link
              href={`/travel/explore/trips/${expedition.slug}`}
              className="xp-label inline-flex h-11 items-center gap-2 rounded-md bg-[var(--xp-primary)] px-5 text-white transition-opacity hover:opacity-90"
            >
              Expedition {expedition.number}
              <IconArrowRight size={14} />
            </Link>
          )}
          {/* Google Maps: the stored link when there is one, and a link built
              from the fix when there is not. A place with coordinates always
              has somewhere to open. */}
          {(place.mapsUrl || located) && (
            <a
              href={
                place.mapsUrl ??
                `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="xp-label inline-flex h-11 items-center gap-2 rounded-md border border-[var(--xp-border)] px-5 transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] hover:text-[var(--xp-primary)]"
            >
              View on Google Maps
              <IconExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Planning notes, for a place not yet reached. */}
        {planned && (place.why || place.bestSeason) && (
          <div
            className={cn(
              styles.corners,
              styles.card,
              "mt-10 rounded-md p-5",
            )}
          >
            <p className="xp-label mb-3 text-[var(--xp-muted)]">Why this one</p>
            {place.why && <p className="text-sm leading-relaxed">{place.why}</p>}
            <p className="xp-label mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[var(--xp-muted)]">
              {place.bestSeason && <span>Best: {place.bestSeason}</span>}
              {place.priority && <span className="capitalize">{place.priority} priority</span>}
              {place.planningStatus && <span>{place.planningStatus}</span>}
              {typeof place.plannedYear === "number" && <span>{place.plannedYear}</span>}
            </p>
          </div>
        )}
      </header>

      {/* ── Position ───────────────────────────────────────────────────── */}
      {located && (
        <section className="xp-container mt-14" aria-labelledby="position">
          <h2 id="position" className="xp-label mb-5 text-[var(--xp-muted)]">
            Position
          </h2>
          <ExpeditionMap places={[place]} expeditions={[]} />
        </section>
      )}

      {photos.length > 0 && (
        <section className="xp-container mt-16" aria-labelledby="photos">
          <h2 id="photos" className="xp-label mb-5 text-[var(--xp-muted)]">
            Photographs
          </h2>
          <Gallery photos={photos} />
        </section>
      )}

      {expedition && (
        <section className="xp-container mt-16" aria-labelledby="reached-on">
          <h2 id="reached-on" className="xp-label mb-5 text-[var(--xp-muted)]">
            Reached on
          </h2>
          <div className="max-w-md">
            <ExpeditionCard expedition={expedition} />
          </div>
        </section>
      )}

      {/* ── Nearby ─────────────────────────────────────────────────────── */}
      {nearby.length > 0 && (
        <section className="xp-container mt-16" aria-labelledby="nearby">
          <h2 id="nearby" className="xp-label mb-2 text-[var(--xp-muted)]">
            Nearby destinations
          </h2>
          <p className="mb-5 text-xs text-[var(--xp-muted)] opacity-80">
            Straight-line distance. The road is routinely a good deal longer.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map(({ place: neighbour, km }) => (
              <li key={neighbour.id} className="relative">
                <PlaceCard place={neighbour} className="h-full" />
                <span className="xp-label pointer-events-none absolute top-4 right-4 z-10 text-[var(--xp-muted)] tabular-nums">
                  {km} km
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
