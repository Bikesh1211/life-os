import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconMapPin,
  IconMountain,
  IconStarFilled,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { categoryFor, isImageSrc } from "@/modules/travel/explore";
import type { ExploredPlace } from "@/modules/travel/explore";
import styles from "./explore.module.css";

/**
 * A place as an archive record.
 *
 * A planned place and a visited one are the same card with a different stamp —
 * the record is identical in shape, and only the status and the date change.
 * That is the honest presentation of a model where the difference is one
 * boolean.
 *
 * The head of the card is the place's own photograph when one is filed, and the
 * same stamped paper as the expedition dossier when none is — the plate is the
 * only part that changes, so a record with a picture and a record without are
 * visibly the same document and a grid of them keeps its rhythm.
 */
export function PlaceCard({ place, className }: { place: ExploredPlace; className?: string }) {
  const category = place.category ? categoryFor(place.category) : undefined;
  const Icon = category?.icon ?? IconMapPin;
  const planned = place.status === "WISHLIST";
  const plate = [place.coverImage, ...place.gallery].find(isImageSrc);
  const where = [place.city, place.country].filter(Boolean).join(", ");

  return (
    <article
      className={cn(
        styles.lift,
        styles.corners,
        styles.card,
        "group relative flex flex-col overflow-hidden rounded-md",
        className,
      )}
    >
      {/* Both variants take the same footprint. A short band under a plated
          neighbour leaves the unplated card with a hole in the middle of it;
          stamped paper at the same size reads as "no photograph filed". */}
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden border-b border-[var(--xp-border)]",
          !plate && styles.paper,
        )}
      >
        {plate ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
                URL of unknown origin; `next/image` needs each host declared in
                `remotePatterns` before the page will render at all. */}
            <img
              src={plate}
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
          /* No photograph filed. The kind of place is stamped on the paper
             instead, so the head of the card still says something. */
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <Icon size={40} className="text-[var(--xp-primary)] opacity-15" />
          </span>
        )}

        <p
          className={cn(
            "xp-label absolute top-3 left-4 flex items-center gap-1.5",
            plate
              ? "rounded-sm bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
              : "text-[var(--xp-muted)]",
          )}
        >
          <Icon size={12} className={cn(!plate && "text-[var(--xp-primary)]")} aria-hidden="true" />
          {category?.label ?? (planned ? "Planned" : "Visited")}
        </p>

        {place.isFavorite && (
          <span
            className={cn(
              "absolute top-3 right-4 flex items-center",
              plate && "rounded-sm bg-black/45 px-1.5 py-1 backdrop-blur-sm",
            )}
          >
            <IconStarFilled
              size={13}
              className={cn(plate ? "text-white" : "text-[var(--xp-primary)]")}
              aria-label="Favourite"
            />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">
          <Link
            href={`/travel/explore/places/${place.slug}`}
            className="after:absolute after:inset-0"
          >
            {place.name}
          </Link>
        </h3>

        {where && <p className="mt-1 text-sm text-[var(--xp-muted)]">{where}</p>}

        {(place.notes || place.description) && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--xp-muted)] italic">
            {place.notes || place.description}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--xp-muted)]">
          {place.visitedAt && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Visited</dt>
              <IconCalendar size={12} aria-hidden="true" />
              <dd>
                <time dateTime={place.visitedAt}>
                  {new Date(place.visitedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </div>
          )}

          {typeof place.elevation === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Elevation</dt>
              <IconMountain size={12} aria-hidden="true" />
              <dd className="tabular-nums">{place.elevation} m</dd>
            </div>
          )}

          {typeof place.rating === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Rating</dt>
              <dd className="tabular-nums">{place.rating}/10</dd>
            </div>
          )}

          {planned && place.planningStatus && (
            <dd
              className={cn(
                styles.stamp,
                "rounded-sm px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase",
              )}
            >
              {place.planningStatus}
            </dd>
          )}
        </dl>

        {/* `line-clamp-1` rather than `truncate` — see ExpeditionCard for why
            `white-space: nowrap` inside a grid item blows the track out. */}
        {place.tripTitle && (
          <p className="mt-3 line-clamp-1 text-xs text-[var(--xp-muted)] opacity-80">
            Reached on <span className="text-[var(--xp-fg)]">{place.tripTitle}</span>
          </p>
        )}

        <span className="xp-label mt-auto flex items-center gap-1.5 pt-5 text-[var(--xp-primary)]">
          Open record
          <IconArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
