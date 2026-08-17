"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconMountain, IconStarFilled } from "@tabler/icons-react";
import {
  categoryFor,
  expeditionDate,
  expeditionPhotos,
  isImageSrc,
  placeDate,
  yearOf,
} from "@/modules/travel/explore";
import type { Expedition, ExploredPlace } from "@/modules/travel/explore";
import { FilterChip, FilterRow } from "./filter-chip";

/**
 * The travel history, newest year first.
 *
 * Two kinds of record on one thread. An expedition is an *outing* and a place
 * is a *position*, and the archive holds both — a timeline that showed only
 * trips would be missing every afternoon that never became one, which in most
 * archives is most of them. They are told apart by their marker (a ring for an
 * outing, expedition red for a position, the same vocabulary the map uses) and
 * by the filter, not by being kept on separate pages.
 *
 * A place reached on an expedition appears on its own row *and* in that
 * expedition's route line. That is duplication on purpose: the counts then mean
 * the same thing under every filter, where hiding linked places under "All"
 * would make the archive appear to shrink when you widened the view.
 *
 * Grouped on the year a record is dated to, and a year with nothing in it
 * simply does not appear. A gap in the chronology is the truth about a gap in
 * the chronology.
 */

type Kind = "all" | "expeditions" | "places";

/** Past this many years the chronology is long enough to want a way in. */
const MIN_YEARS_FOR_JUMP = 3;

/** And past this many, the way in stops being a row of chips. */
const MAX_YEAR_CHIPS = 12;

interface TimelineEntry {
  id: string;
  kind: "expedition" | "place";
  date: string;
  year: string;
  expedition?: Expedition;
  place?: ExploredPlace;
}

const UNDATED = "Undated";

export function ArchiveTimeline({
  expeditions,
  places = [],
}: {
  expeditions: Expedition[];
  places?: ExploredPlace[];
}) {
  const [kind, setKind] = useState<Kind>("all");

  /* A wishlist place is a plan, not history — the Bucket List owns those. */
  const visited = useMemo(() => places.filter((p) => p.status === "VISITED"), [places]);

  const entries = useMemo<TimelineEntry[]>(() => {
    const out: TimelineEntry[] = [];

    if (kind !== "places") {
      for (const expedition of expeditions) {
        const date = expeditionDate(expedition);
        out.push({
          id: `e-${expedition.id}`,
          kind: "expedition",
          date,
          year: yearOf(date) || UNDATED,
          expedition,
        });
      }
    }

    if (kind !== "expeditions") {
      for (const place of visited) {
        const date = placeDate(place);
        out.push({
          id: `p-${place.id}`,
          kind: "place",
          date,
          year: yearOf(date) || UNDATED,
          place,
        });
      }
    }

    return out;
  }, [kind, expeditions, visited]);

  const years = useMemo(() => {
    const grouped = new Map<string, TimelineEntry[]>();
    for (const entry of entries) {
      const list = grouped.get(entry.year);
      if (list) list.push(entry);
      else grouped.set(entry.year, [entry]);
    }

    for (const list of grouped.values()) {
      // Newest first inside the year, and anything without a day at the foot of
      // it — an undated record is not the year's first event, it is unplaced.
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }

    // `Undated` last. Sorting the keys as plain strings descending would put it
    // above every year, which reads as the most recent thing that happened.
    return [...grouped.entries()].sort(([a], [b]) => {
      if (a === UNDATED) return 1;
      if (b === UNDATED) return -1;
      return b.localeCompare(a);
    });
  }, [entries]);

  const showJump = years.length > MIN_YEARS_FOR_JUMP;
  const filterable = expeditions.length > 0 && visited.length > 0;

  return (
    <div>
      {filterable && (
        <div className="mb-10 space-y-4">
          <FilterRow label="Show">
            <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
              Everything {expeditions.length + visited.length}
            </FilterChip>
            <FilterChip active={kind === "expeditions"} onClick={() => setKind("expeditions")}>
              Expeditions {expeditions.length}
            </FilterChip>
            <FilterChip active={kind === "places"} onClick={() => setKind("places")}>
              Places {visited.length}
            </FilterChip>
          </FilterRow>

          {showJump && (
            <FilterRow label="Jump">
              {/* Chips while they fit on a line or two. An archive spanning
                  thirty years turns them into a wall, and a wall of years is
                  not a way in — past that it folds into one control. */}
              {years.length <= MAX_YEAR_CHIPS ? (
                years.map(([year]) => (
                  <a
                    key={year}
                    href={`#year-${year}`}
                    className="rounded-full border border-[var(--xp-border)] px-3 py-1 font-mono text-xs text-[var(--xp-muted)] transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_40%,transparent)] hover:text-[var(--xp-fg)]"
                  >
                    {year}
                  </a>
                ))
              ) : (
                <select
                  aria-label="Jump to a year"
                  defaultValue=""
                  onChange={(event) => {
                    const year = event.target.value;
                    if (year) document.getElementById(`year-${year}`)?.scrollIntoView();
                  }}
                  className="rounded-full border border-[var(--xp-border)] bg-transparent px-3 py-1 font-mono text-xs text-[var(--xp-muted)] focus:outline-none"
                >
                  <option value="">{years.length} years</option>
                  {years.map(([year, list]) => (
                    <option key={year} value={year}>
                      {year} · {list.length}
                    </option>
                  ))}
                </select>
              )}
            </FilterRow>
          )}
        </div>
      )}

      {years.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
          {kind === "places" ? "No visited places logged yet." : "No expeditions logged yet."}
        </p>
      ) : (
        <div className="space-y-14">
          {years.map(([year, list]) => (
            <section
              key={year}
              id={`year-${year}`}
              aria-labelledby={`year-${year}-heading`}
              className="scroll-mt-28"
            >
              <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 id={`year-${year}-heading`} className="text-3xl font-bold tabular-nums sm:text-4xl">
                  {year}
                </h2>
                <span className="xp-label text-[var(--xp-muted)]">{countLabel(list)}</span>
                <span className="hidden h-px flex-1 bg-gradient-to-r from-[var(--xp-border)] to-transparent sm:block" />
              </div>

              <ol className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-[color-mix(in_oklab,var(--xp-primary)_40%,transparent)] via-[var(--xp-border)] to-transparent"
                />

                {list.map((entry) =>
                  entry.kind === "expedition" && entry.expedition ? (
                    <ExpeditionRow key={entry.id} expedition={entry.expedition} date={entry.date} />
                  ) : entry.place ? (
                    <PlaceRow key={entry.id} place={entry.place} date={entry.date} />
                  ) : null,
                )}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** "3 expeditions · 12 places" — each half omitted when it would read as zero. */
function countLabel(list: TimelineEntry[]): string {
  const outings = list.filter((e) => e.kind === "expedition").length;
  const positions = list.length - outings;
  const parts: string[] = [];
  if (outings > 0) parts.push(`${outings} ${outings === 1 ? "expedition" : "expeditions"}`);
  if (positions > 0) parts.push(`${positions} ${positions === 1 ? "place" : "places"}`);
  return parts.join(" · ");
}

function Row({
  marker,
  thumbnail,
  children,
}: {
  marker: React.ReactNode;
  thumbnail?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-5 pb-7 last:pb-0">
      <span className="relative z-10 mt-1.5 flex size-[15px] shrink-0 items-center justify-center">
        {marker}
      </span>

      <div className="min-w-0 flex-1">{children}</div>

      {thumbnail && <Thumb src={thumbnail} />}
    </li>
  );
}

/**
 * A contact print beside the record — and nothing at all when the URL is dead.
 *
 * Image URLs in this archive are typed by hand, so some of them rot. A
 * broken-image glyph in a bordered box is worse than no photograph: it reads as
 * the archive being broken rather than as one link having expired.
 *
 * `onError` alone is not enough. The element is server-rendered, so a load that
 * fails while the HTML is still being parsed fires its error before React has
 * hydrated and nothing is listening. The ref callback asks the browser how the
 * load went the moment the element is committed, which covers that window.
 */
function Thumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  const check = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- author-supplied
       URL of unknown origin; `next/image` needs each host declared in
       `remotePatterns` before the page will render at all. */
    <img
      ref={check}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="mt-1 hidden size-16 shrink-0 rounded-sm border border-[var(--xp-border)] object-cover sm:block"
    />
  );
}

function ExpeditionRow({ expedition, date }: { expedition: Expedition; date: string }) {
  const category = expedition.category ? categoryFor(expedition.category) : undefined;
  const Icon = category?.icon;

  return (
    <Row
      marker={
        <span className="size-[9px] rounded-full border-2 border-[var(--xp-primary)] bg-[var(--xp-bg)]" />
      }
      thumbnail={expeditionPhotos(expedition)[0]?.src}
    >
      <p className="xp-label flex flex-wrap items-center gap-x-3 text-[var(--xp-muted)]">
        <span className="text-[var(--xp-primary)]">{expedition.number}</span>
        {date && <time dateTime={date}>{dayMonth(date)}</time>}
        {category && (
          <span className="flex items-center gap-1.5">
            {Icon && <Icon size={12} aria-hidden="true" />}
            {category.label}
          </span>
        )}
      </p>

      <h3 className="mt-1 text-lg font-medium">
        <Link
          href={`/travel/explore/trips/${expedition.slug}`}
          className="group inline-flex items-center gap-2 transition-colors hover:text-[var(--xp-primary)]"
        >
          {expedition.title}
          <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </h3>

      {expedition.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-[var(--xp-muted)]">{expedition.description}</p>
      )}

      {expedition.places.length > 0 && (
        <p className="mt-2 line-clamp-1 font-mono text-[11px] break-all text-[var(--xp-muted)] opacity-75">
          {expedition.places.map((p) => p.name).join(" → ")}
        </p>
      )}
    </Row>
  );
}

function PlaceRow({ place, date }: { place: ExploredPlace; date: string }) {
  const where = [place.city, place.country].filter(Boolean).join(", ");

  return (
    <Row
      /* Expedition red marks a position — the same thing it means on the map. */
      marker={
        <span className="size-[7px] rounded-full" style={{ background: "var(--xp-expedition)" }} />
      }
      thumbnail={[place.coverImage, ...place.gallery].find(isImageSrc)}
    >
      <p className="xp-label flex flex-wrap items-center gap-x-3 text-[var(--xp-muted)]">
        {date && <time dateTime={date}>{dayMonth(date)}</time>}
        {where && <span className="normal-case">{where}</span>}
        {typeof place.elevation === "number" && (
          <span className="flex items-center gap-1.5 tabular-nums">
            <IconMountain size={12} aria-hidden="true" />
            {place.elevation} m
          </span>
        )}
        {place.isFavorite && (
          <IconStarFilled size={12} className="text-[var(--xp-primary)]" aria-label="Favourite" />
        )}
      </p>

      <h3 className="mt-1 text-lg font-medium">
        <Link
          href={`/travel/explore/places/${place.slug}`}
          className="group inline-flex items-center gap-2 transition-colors hover:text-[var(--xp-primary)]"
        >
          {place.name}
          <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </h3>

      {(place.notes || place.description) && (
        <p className="mt-1.5 line-clamp-2 text-sm text-[var(--xp-muted)] italic">
          {place.notes || place.description}
        </p>
      )}

      {place.tripTitle && place.tripSlug && (
        <p className="mt-2 text-xs text-[var(--xp-muted)] opacity-75">
          Reached on{" "}
          <Link
            href={`/travel/explore/trips/${place.tripSlug}`}
            className="text-[var(--xp-fg)] transition-colors hover:text-[var(--xp-primary)]"
          >
            {place.tripTitle}
          </Link>
        </p>
      )}
    </Row>
  );
}

function dayMonth(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
