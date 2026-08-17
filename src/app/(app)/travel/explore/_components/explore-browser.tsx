"use client";

import { useMemo, useState } from "react";
import { IconFilter, IconX } from "@tabler/icons-react";
import {
  CATEGORIES,
  countriesOf,
  expeditionDate,
  filterExpeditions,
  filterPlaces,
  placeDate,
  yearsOf,
} from "@/modules/travel/explore";
import type {
  Expedition,
  ExploreFilters,
  ExploredPlace,
  TravelCategory,
} from "@/modules/travel/explore";
import { FilterChip, FilterRow } from "./filter-chip";
import { ExpeditionCard } from "./expedition-card";
import { PlaceCard } from "./place-card";

/**
 * The browsing surface for expeditions and for places.
 *
 * Filters are client state rather than query parameters: a section is a *place*
 * and has a route; narrowing it by country is a *view* of that place. The
 * addressable things — the archive, each section, each expedition, each place —
 * all have their own URL.
 *
 * A filter row only renders when it would offer more than one choice. An
 * archive with everything in one country has no use for a country filter, and
 * showing one with a single option is furniture pretending to be a control.
 */
const PAGE = 12;

type Mode = "expeditions" | "places";

export function ExploreBrowser({
  expeditions = [],
  places = [],
  mode,
  emptyMessage,
  lockCategory,
}: {
  expeditions?: Expedition[];
  places?: ExploredPlace[];
  mode: Mode;
  emptyMessage: string;
  /** Category pages fix the category and hide its filter row. */
  lockCategory?: TravelCategory;
}) {
  const [filters, setFilters] = useState<ExploreFilters>({});
  const [shown, setShown] = useState(PAGE);

  const source = mode === "expeditions" ? expeditions : places;

  const years = useMemo(
    () =>
      yearsOf(
        mode === "expeditions"
          ? expeditions.map(expeditionDate).filter(Boolean)
          : places.map(placeDate).filter(Boolean),
      ),
    [mode, expeditions, places],
  );

  const countries = useMemo(
    () =>
      mode === "places"
        ? countriesOf(places)
        : countriesOf(expeditions.flatMap((e) => e.places)),
    [mode, expeditions, places],
  );

  const categories = useMemo(() => {
    const present = new Set(
      (mode === "expeditions"
        ? expeditions.map((e) => e.category)
        : places.map((p) => p.category)
      ).filter((c): c is TravelCategory => Boolean(c)),
    );
    return CATEGORIES.filter((c) => present.has(c.key));
  }, [mode, expeditions, places]);

  const filtered = useMemo(() => {
    const applied: ExploreFilters = lockCategory ? { ...filters, category: lockCategory } : filters;
    return mode === "expeditions"
      ? filterExpeditions(expeditions, applied)
      : filterPlaces(places, applied);
  }, [mode, expeditions, places, filters, lockCategory]);

  const visible = filtered.slice(0, shown);
  const active = Boolean(filters.year || filters.country || filters.category || filters.status);

  function update(patch: Partial<ExploreFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShown(PAGE);
  }

  return (
    <div>
      {source.length > 0 && (
        <div className="mb-8 space-y-4">
          {!lockCategory && categories.length > 1 && (
            <FilterRow label="Type">
              <FilterChip active={!filters.category} onClick={() => update({ category: undefined })}>
                All
              </FilterChip>
              {categories.map((category) => (
                <FilterChip
                  key={category.key}
                  active={filters.category === category.key}
                  onClick={() =>
                    update({
                      category: filters.category === category.key ? undefined : category.key,
                    })
                  }
                >
                  {category.label}
                </FilterChip>
              ))}
            </FilterRow>
          )}

          {countries.length > 1 && (
            <FilterRow label="Country">
              <FilterChip active={!filters.country} onClick={() => update({ country: undefined })}>
                Any
              </FilterChip>
              {countries.map((country) => (
                <FilterChip
                  key={country}
                  active={filters.country === country}
                  onClick={() =>
                    update({ country: filters.country === country ? undefined : country })
                  }
                >
                  {country}
                </FilterChip>
              ))}
            </FilterRow>
          )}

          {years.length > 1 && (
            <FilterRow label="Year">
              <FilterChip active={!filters.year} onClick={() => update({ year: undefined })}>
                Any
              </FilterChip>
              {years.map((year) => (
                <FilterChip
                  key={year}
                  active={filters.year === year}
                  onClick={() => update({ year: filters.year === year ? undefined : year })}
                >
                  {year}
                </FilterChip>
              ))}
            </FilterRow>
          )}

          {mode === "places" && (
            <FilterRow label="Status">
              {(["all", "VISITED", "WISHLIST"] as const).map((value) => (
                <FilterChip
                  key={value}
                  active={(filters.status ?? "all") === value}
                  onClick={() => update({ status: value })}
                >
                  {value === "all" ? "All" : value === "VISITED" ? "Visited" : "Planned"}
                </FilterChip>
              ))}
            </FilterRow>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--xp-border)] pt-4">
            <p className="xp-label flex items-center gap-2 text-[var(--xp-muted)]" aria-live="polite">
              <IconFilter size={12} aria-hidden="true" />
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </p>

            {active && (
              <button
                type="button"
                onClick={() => {
                  setFilters({});
                  setShown(PAGE);
                }}
                className="flex items-center gap-1.5 text-xs text-[var(--xp-primary)] transition-opacity hover:opacity-80"
              >
                <IconX size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {visible.length > 0 ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mode === "expeditions"
              ? (visible as Expedition[]).map((expedition) => (
                  <li key={expedition.id}>
                    <ExpeditionCard expedition={expedition} className="h-full" />
                  </li>
                ))
              : (visible as ExploredPlace[]).map((place) => (
                  <li key={place.id}>
                    <PlaceCard place={place} className="h-full" />
                  </li>
                ))}
          </ul>

          {filtered.length > visible.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="rounded-md border border-[var(--xp-border)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] hover:text-[var(--xp-primary)]"
              >
                Show more
                <span className="ml-2 text-[var(--xp-muted)] tabular-nums">
                  {filtered.length - visible.length}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
          {active ? "Nothing in the archive matches those filters." : emptyMessage}
        </p>
      )}
    </div>
  );
}
