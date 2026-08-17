import Link from "next/link";
import {
  IconCalendarEvent,
  IconCoin,
  IconCompass,
  IconGauge,
  IconMapPin,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { isImageSrc } from "@/modules/travel/explore";
import type { ExploredPlace } from "@/modules/travel/explore";
import styles from "./explore.module.css";

/**
 * THE NEXT EXPEDITIONS.
 *
 * There is no bucket-list table, and that is the design rather than a shortcut:
 * a wishlist row already *is* a planned destination, and "completed
 * destinations should automatically move into the visited archive" is what
 * flipping `isVisited` already does. One field, one truth, and no
 * reconciliation job between two tables that disagree.
 *
 * Ordered by priority then by name, because a bucket list sorted by insertion
 * date is a list nobody re-reads.
 */

const PRIORITY_RANK: Record<string, number> = { dream: 0, high: 1, medium: 2, low: 3 };

const STATUS_TONE: Record<string, string> = {
  ready: "text-[var(--xp-expedition)] border-[var(--xp-expedition)]",
  researching: "text-[var(--xp-primary)] border-[var(--xp-primary)]",
  planned: "text-[var(--xp-muted)] border-[var(--xp-border)]",
};

export function BucketList({ places }: { places: ExploredPlace[] }) {
  const planned = places
    .filter((p) => p.status === "WISHLIST")
    .sort((a, b) => {
      const pa = PRIORITY_RANK[a.priority ?? "low"] ?? 4;
      const pb = PRIORITY_RANK[b.priority ?? "low"] ?? 4;
      return pa - pb || a.name.localeCompare(b.name);
    });

  if (planned.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
        Nothing on the list yet — every recorded destination has been reached.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {planned.map((place) => (
        <li key={place.id}>
          <article
            className={cn(
              styles.lift,
              styles.corners,
              styles.card,
              "group relative flex h-full flex-col overflow-hidden rounded-md",
            )}
          >
            <Plate place={place} />

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold">
                <Link
                  href={`/travel/explore/places/${place.slug}`}
                  className="after:absolute after:inset-0"
                >
                  {place.name}
                </Link>
              </h3>

              {(place.city || place.country) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--xp-muted)]">
                  <IconMapPin size={12} aria-hidden="true" />
                  {[place.city, place.country].filter(Boolean).join(", ")}
                </p>
              )}

              {place.why && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--xp-muted)] italic">
                  {place.why}
                </p>
              )}

              <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-[var(--xp-muted)]">
                {place.bestSeason && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Best season</dt>
                    <IconCalendarEvent size={12} aria-hidden="true" />
                    <dd>{place.bestSeason}</dd>
                  </div>
                )}
                {place.difficulty && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Difficulty</dt>
                    <IconGauge size={12} aria-hidden="true" />
                    <dd className="capitalize">{place.difficulty}</dd>
                  </div>
                )}
                {typeof place.estimatedBudget === "number" && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Estimated budget</dt>
                    <IconCoin size={12} aria-hidden="true" />
                    <dd className="tabular-nums">{place.estimatedBudget.toLocaleString("en-GB")}</dd>
                  </div>
                )}
                {place.priority && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Priority</dt>
                    <dd className="capitalize">{place.priority} priority</dd>
                  </div>
                )}
                {typeof place.plannedYear === "number" && (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Planned for</dt>
                    <dd className="tabular-nums">{place.plannedYear}</dd>
                  </div>
                )}
              </dl>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/**
 * The head of the card: the place's own photograph when one is filed, and
 * stamped paper when none is — the same plate the expedition dossier and the
 * place record carry, because these are the same archive.
 *
 * A planned place having a photograph is not a contradiction: it is the picture
 * that put the place on the list.
 */
function Plate({ place }: { place: ExploredPlace }) {
  const image = [place.coverImage, ...place.gallery].find(isImageSrc);

  // Both variants take the same footprint — see PlaceCard for why.
  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden border-b border-[var(--xp-border)]",
        !image && styles.paper,
      )}
    >
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
              URL of unknown origin; `next/image` needs each host declared in
              `remotePatterns` before the page will render at all. */}
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"
          />
        </>
      ) : (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <IconCompass size={40} className="text-[var(--xp-primary)] opacity-15" />
        </span>
      )}

      <p
        className={cn(
          "xp-label absolute top-3 left-4 flex items-center gap-1.5",
          image
            ? "rounded-sm bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
            : "text-[var(--xp-muted)]",
        )}
      >
        <IconCompass size={12} className={cn(!image && "text-[var(--xp-primary)]")} aria-hidden="true" />
        Next expedition
      </p>

      {place.planningStatus && (
        <span
          className={cn(
            "absolute top-3 right-4 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase",
            image
              ? "border-white/40 bg-black/45 text-white backdrop-blur-sm"
              : (STATUS_TONE[place.planningStatus] ?? STATUS_TONE.planned),
          )}
        >
          {place.planningStatus}
        </span>
      )}
    </div>
  );
}
