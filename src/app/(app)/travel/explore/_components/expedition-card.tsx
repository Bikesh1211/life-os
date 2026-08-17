import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconMountain,
  IconPhoto,
  IconRuler,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { categoryFor, expeditionDate, expeditionPhotos } from "@/modules/travel/explore";
import type { Expedition } from "@/modules/travel/explore";
import styles from "./explore.module.css";

/**
 * An expedition as a field dossier.
 *
 * The card is one link — the title carries it through a stretched overlay, so
 * there is a single tab stop and a single accessible name. Its route draws
 * itself across the header on hover, which is the one flourish this card
 * spends.
 *
 * The head of the card is the expedition's own photograph when it has one, and
 * the drawn route on paper when it does not — an archive of journeys that shows
 * no ground is a filing cabinet. The photo is the *plate* of the dossier, not
 * its subject: it keeps the corner ticks and the stamped labels, so a card with
 * a picture and a card without still read as the same document.
 *
 * Every metadata row is conditional. A trip with no recorded distance shows no
 * distance rather than a dash: the archive prints what it can count and stays
 * quiet about the rest.
 */
export function ExpeditionCard({
  expedition,
  className,
}: {
  expedition: Expedition;
  className?: string;
}) {
  const category = expedition.category ? categoryFor(expedition.category) : undefined;
  const Icon = category?.icon ?? IconMountain;
  const date = expeditionDate(expedition);

  const destination =
    expedition.places.at(-1)?.name ?? expedition.routeStops.at(-1)?.name ?? expedition.destination;

  // The same list the expedition page shows under Memories, so the count on the
  // plate is the count that opens.
  const photos = expeditionPhotos(expedition);
  const plate = photos[0];

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
      {/* Both variants take the same footprint, so a grid mixing dossiers with
          and without a photograph keeps one baseline. */}
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden border-b border-[var(--xp-border)]",
          !plate && styles.paper,
        )}
      >
        {plate && (
          /* eslint-disable-next-line @next/next/no-img-element -- author-supplied
             URL of unknown origin; `next/image` needs each host declared in
             `remotePatterns` before the page will render at all. */
          <img
            src={plate.src}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}

        {/* Weight at the foot only. The stamped labels carry their own ground,
            so nothing needs to be laid across the middle of the photograph. */}
        {plate && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"
          />
        )}

        {/* The route, drawing itself across the head of the card on hover. Pure
            decoration — the real route is on the map inside — and only on the
            paper variant: the trail rests part-drawn, which over a photograph
            reads as a scratch on the print rather than as the end of a route.
            A plate has its own flourish in the slow push under the pointer. */}
        {!plate && (
          <svg
            viewBox="0 0 320 80"
            /* Anchored to the foot of the band rather than stretched over it:
               a route drawn across a 200px sheet is a zigzag, not a route. */
            className="absolute inset-x-0 bottom-0 h-20"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path
              d="M 12 62 L 74 44 L 130 54 L 190 26 L 246 38 L 308 16"
              stroke="var(--xp-trail)"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.cardTrail}
            />
            <circle cx={308} cy={16} r={3.5} fill="var(--xp-expedition)" />
          </svg>
        )}

        <p
          className={cn(
            "xp-label absolute top-3 left-4",
            plate
              ? "rounded-sm bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
              : "text-[var(--xp-primary)]",
          )}
        >
          Expedition {expedition.number}
        </p>

        {category && (
          <p
            className={cn(
              "xp-label absolute flex items-center gap-1.5",
              plate
                ? "top-3 right-4 rounded-sm bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
                : "right-4 bottom-3 text-[var(--xp-muted)]",
            )}
          >
            <Icon size={12} aria-hidden="true" />
            {category.label}
          </p>
        )}

        {plate && photos.length > 1 && (
          <p className="xp-label absolute right-4 bottom-3 flex items-center gap-1.5 text-white/85">
            <IconPhoto size={12} aria-hidden="true" />
            {photos.length}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-balance sm:text-xl">
          <Link
            href={`/travel/explore/trips/${expedition.slug}`}
            className="after:absolute after:inset-0"
          >
            {expedition.title}
          </Link>
        </h3>

        {expedition.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--xp-muted)]">
            {expedition.description}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--xp-muted)]">
          {date && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <IconCalendar size={12} aria-hidden="true" />
              <dd>
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </div>
          )}

          {destination && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Destination</dt>
              <IconMapPin size={12} aria-hidden="true" />
              <dd>{destination}</dd>
            </div>
          )}

          {typeof expedition.distanceKm === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Distance</dt>
              <IconRuler size={12} aria-hidden="true" />
              <dd className="tabular-nums">{expedition.distanceKm} km</dd>
            </div>
          )}

          {typeof expedition.elevationM === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Elevation</dt>
              <IconMountain size={12} aria-hidden="true" />
              <dd className="tabular-nums">{expedition.elevationM} m</dd>
            </div>
          )}

          {typeof expedition.days === "number" && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Duration</dt>
              <IconClock size={12} aria-hidden="true" />
              <dd>
                {expedition.days} {expedition.days === 1 ? "day" : "days"}
              </dd>
            </div>
          )}
        </dl>

        {/* `line-clamp-1`, not `truncate`. Both show one line with an ellipsis,
            but `truncate` sets `white-space: nowrap`, which gives this element a
            min-content width equal to the *whole* joined route — and as the
            content of a grid item (`min-width: auto`) that forces the track wide
            and the page to scroll sideways on a phone. `line-clamp-1` lets the
            text wrap for sizing purposes and still paints one line. */}
        {expedition.places.length > 0 && (
          <p className="mt-4 line-clamp-1 font-mono text-[11px] break-all text-[var(--xp-muted)] opacity-80">
            {expedition.places.map((p) => p.name).join(" → ")}
          </p>
        )}

        <span className="xp-label mt-auto flex items-center gap-1.5 pt-5 text-[var(--xp-primary)]">
          Open expedition
          <IconArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
