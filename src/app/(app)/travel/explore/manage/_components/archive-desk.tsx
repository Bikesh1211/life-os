"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMapPin,
  IconMapPinOff,
  IconPencil,
  IconSearch,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { apiFetch, ApiError } from "@/core/api/http";
import { canonicalCountry, categoryFor, makeSlug } from "@/modules/travel/explore";
import type { TravelCategory } from "@/modules/travel/explore";
import { filterCls } from "./fields";
import {
  ExpeditionForm,
  emptyExpedition,
  expeditionBody,
  tripToForm,
  type ExpeditionFormState,
} from "./expedition-form";
import {
  JournalForm,
  emptyJournal,
  journalBody,
  journalToForm,
  type JournalFormState,
} from "./journal-form";
import {
  LocationForm,
  emptyLocation,
  locationBody,
  visitedToForm,
  wishlistToForm,
  type LocationFormState,
} from "./location-form";
import type {
  JournalRecord,
  LocationRow,
  Tab,
  TripRecord,
  VisitedRecord,
  WishlistRecord,
} from "./types";
import styles from "../../_components/explore.module.css";

/**
 * THE ARCHIVE DESK — where the records that feed Explore Mode are written.
 *
 * Three tabs over four tables, and the grouping is the point. Visited places
 * and bucket-list entries share one tab because they are the same thing at two
 * moments in its life. Expeditions and Journals are separate because a trip is
 * entered when it is planned and its story is written after it is over — one
 * combined form would ask for prose that does not exist yet.
 *
 * Everything is loaded whole and filtered in the browser. These are personal
 * collections in the hundreds, not the millions, and a round trip per keystroke
 * would buy nothing but latency.
 */

const PAGE_SIZES = [10, 25, 50];

type Notice = { kind: "ok" | "error"; text: string } | null;

export function ArchiveDesk() {
  const [tab, setTab] = useState<Tab>("locations");

  const [visited, setVisited] = useState<VisitedRecord[]>([]);
  const [wishlist, setWishlist] = useState<WishlistRecord[]>([]);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [journals, setJournals] = useState<JournalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; kind: string } | null>(null);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocation);
  const [expeditionForm, setExpeditionForm] = useState<ExpeditionFormState>(emptyExpedition);
  const [journalForm, setJournalForm] = useState<JournalFormState>(emptyJournal);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [tripFilter, setTripFilter] = useState("ALL");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  /* ── Loading ──────────────────────────────────────────────────────── */

  /**
   * Put a freshly-read archive into state.
   *
   * Split from the reading so the mount effect can call `fetchArchive` and hand
   * the result to this from a promise callback. Setting state straight from an
   * effect body — even indirectly, through a function that does it — is a
   * cascading render, and the rule that forbids it is right: the first paint
   * would be thrown away on every visit.
   */
  const apply = useCallback((data: ArchiveSnapshot) => {
    setVisited(data.visited);
    setWishlist(data.wishlist);
    setTrips(data.trips);
    setJournals(data.journals);
  }, []);

  /** Re-read everything after a write. Called from event handlers only. */
  const reload = useCallback(async () => {
    apply(await fetchArchive());
  }, [apply]);

  useEffect(() => {
    let cancelled = false;

    fetchArchive()
      .then((data) => {
        if (!cancelled) apply(data);
      })
      .catch(() => {
        if (!cancelled) setNotice({ kind: "error", text: "Could not load the archive." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apply]);

  const tripTitles = useMemo(
    () => Object.fromEntries(trips.map((t) => [t.id, t.title])),
    [trips],
  );

  /* ── The list ─────────────────────────────────────────────────────── */

  const locationRows = useMemo<LocationRow[]>(
    () => [
      ...visited.map((r) => ({
        id: r.id,
        kind: "VISITED" as const,
        name: r.place?.trim() || r.city,
        where: [r.city, r.country].filter(Boolean).join(", "),
        date: r.visitStart,
        country: r.country,
        tripId: r.tripId,
        isFavorited: r.isFavorited,
        located: r.latitude != null && r.longitude != null,
        category: r.category,
        reached: true,
      })),
      ...wishlist.map((r) => ({
        id: r.id,
        kind: "PLANNED" as const,
        name: r.title,
        where: [r.city, r.country].filter(Boolean).join(", "),
        date: r.visitedAt,
        country: r.country ?? "",
        tripId: null,
        isFavorited: r.isFavorited,
        located: r.latitude != null && r.longitude != null,
        category: r.category,
        reached: r.isVisited,
      })),
    ],
    [visited, wishlist],
  );

  const countries = useMemo(() => {
    const set = new Set(
      locationRows.map((r) => canonicalCountry(r.country)).filter((c): c is string => c !== null),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [locationRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (tab === "locations") {
      return locationRows.filter((r) => {
        if (q && ![r.name, r.where].some((v) => v?.toLowerCase().includes(q))) return false;
        if (kindFilter === "VISITED" && !(r.kind === "VISITED" || r.reached)) return false;
        if (kindFilter === "PLANNED" && !(r.kind === "PLANNED" && !r.reached)) return false;
        if (kindFilter === "UNPLACED" && r.located) return false;
        if (countryFilter !== "ALL" && canonicalCountry(r.country) !== countryFilter) return false;
        if (tripFilter === "NONE" && r.tripId) return false;
        if (tripFilter !== "ALL" && tripFilter !== "NONE" && r.tripId !== tripFilter) return false;
        if (favouritesOnly && !r.isFavorited) return false;
        return true;
      });
    }

    if (tab === "expeditions") {
      return trips.filter((t) => {
        if (q && ![t.title, t.destination].some((v) => v?.toLowerCase().includes(q))) return false;
        if (countryFilter !== "ALL" && canonicalCountry(t.country) !== countryFilter) return false;
        if (favouritesOnly && !t.featured) return false;
        return true;
      });
    }

    return journals.filter((j) => {
      if (q && ![j.title, j.location].some((v) => v?.toLowerCase().includes(q))) return false;
      if (tripFilter === "NONE" && j.tripId) return false;
      if (tripFilter !== "ALL" && tripFilter !== "NONE" && j.tripId !== tripFilter) return false;
      return true;
    });
  }, [
    tab,
    locationRows,
    trips,
    journals,
    query,
    kindFilter,
    countryFilter,
    tripFilter,
    favouritesOnly,
  ]);

  /* Clamped rather than reset in an effect, so deleting the last row of the
     last page (or tightening a filter) slides back a page instead of showing
     an empty list under a "page 4 of 3". */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const filtersActive =
    query !== "" ||
    kindFilter !== "ALL" ||
    countryFilter !== "ALL" ||
    tripFilter !== "ALL" ||
    favouritesOnly;

  function resetFilters() {
    setQuery("");
    setKindFilter("ALL");
    setCountryFilter("ALL");
    setTripFilter("ALL");
    setFavouritesOnly(false);
    setPage(1);
  }

  /* ── Editing ──────────────────────────────────────────────────────── */

  function startCreate() {
    setEditing(null);
    setLocationForm(emptyLocation);
    setExpeditionForm(emptyExpedition);
    setJournalForm(emptyJournal);
    setShowForm(true);
    setNotice(null);
  }

  function startEdit(id: string, kind: string) {
    setNotice(null);
    if (tab === "locations") {
      if (kind === "VISITED") {
        const record = visited.find((r) => r.id === id);
        if (!record) return;
        setLocationForm(visitedToForm(record));
      } else {
        const record = wishlist.find((r) => r.id === id);
        if (!record) return;
        setLocationForm(wishlistToForm(record));
      }
    } else if (tab === "expeditions") {
      const record = trips.find((r) => r.id === id);
      if (!record) return;
      setExpeditionForm(tripToForm(record));
    } else {
      const record = journals.find((r) => r.id === id);
      if (!record) return;
      setJournalForm(journalToForm(record));
    }
    setEditing({ id, kind });
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditing(null);
    setNotice(null);
  }

  /** Which endpoint a record belongs to, given the tab and its kind. */
  function endpointFor(kind: string): string {
    if (tab === "expeditions") return "/api/travel/trips";
    if (tab === "journals") return "/api/travel/journals";
    return kind === "VISITED" ? "/api/travel/visited" : "/api/travel/wishlist";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    const kind =
      tab === "locations" ? (editing ? editing.kind : locationForm.kind) : tab;
    const base = endpointFor(kind);
    const body =
      tab === "locations"
        ? locationBody(locationForm)
        : tab === "expeditions"
          ? expeditionBody(expeditionForm)
          : journalBody(journalForm);

    try {
      await apiFetch(editing ? `${base}/${editing.id}` : base, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setNotice({ kind: "ok", text: editing ? "Saved." : "Created." });
      setShowForm(false);
      setEditing(null);
      await reload();
    } catch (error) {
      setNotice({
        kind: "error",
        text: errorText(error, "Failed to save"),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, kind: string, label: string) {
    if (!confirm(`Delete “${label}”? This cannot be undone.`)) return;
    try {
      await apiFetch(`${endpointFor(kind)}/${id}`, { method: "DELETE" });
      setNotice({ kind: "ok", text: "Deleted." });
      await reload();
    } catch (error) {
      setNotice({
        kind: "error",
        text: errorText(error, "Failed to delete"),
      });
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */

  const nounSingular =
    tab === "locations" ? "Place" : tab === "expeditions" ? "Expedition" : "Journal";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="xp-h2 tracking-[0.06em] uppercase">The Archive Desk</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--xp-muted)]">
            Where the records are written. Everything saved here appears in the archive at once —
            on the map, in the timeline, in the category views and in search.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startCreate}
            className="rounded-xl bg-[var(--xp-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            New {nounSingular}
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-1">
        {(
          [
            ["locations", `Places · ${locationRows.length}`],
            ["expeditions", `Expeditions · ${trips.length}`],
            ["journals", `Journals · ${journals.length}`],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              setTab(value);
              setShowForm(false);
              setEditing(null);
              resetFilters();
            }}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm transition-colors",
              tab === value
                ? "bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] font-medium text-[var(--xp-primary)]"
                : "text-[var(--xp-muted)] hover:text-[var(--xp-fg)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            "mb-4 rounded-xl px-4 py-2 text-sm",
            notice.kind === "ok"
              ? "bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] text-[var(--xp-primary)]"
              : "bg-[color-mix(in_oklab,var(--xp-expedition)_14%,transparent)] text-[var(--xp-expedition)]",
          )}
        >
          {notice.text}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className={cn(styles.card, "max-w-3xl space-y-5 rounded-2xl p-4 sm:p-6")}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {editing ? "Edit" : "New"} {nounSingular.toLowerCase()}
            </h2>
            <button
              type="button"
              onClick={cancel}
              className="text-xs text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]"
            >
              Cancel
            </button>
          </div>

          {tab === "locations" && (
            <LocationForm
              form={locationForm}
              setForm={setLocationForm}
              trips={trips}
              editing={Boolean(editing)}
            />
          )}
          {tab === "expeditions" && (
            <ExpeditionForm form={expeditionForm} setForm={setExpeditionForm} />
          )}
          {tab === "journals" && (
            <JournalForm form={journalForm} setForm={setJournalForm} trips={trips} />
          )}

          <div className="flex gap-3 border-t border-[var(--xp-border)] pt-5">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--xp-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl border border-[var(--xp-border)] px-4 py-2 text-sm text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* ── Filters ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <IconSearch
                size={14}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--xp-muted)]"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  tab === "locations"
                    ? "Search name, city or country"
                    : tab === "expeditions"
                      ? "Search expeditions"
                      : "Search journals"
                }
                className="w-full rounded-lg border border-[var(--xp-border)] bg-[var(--xp-surface)] py-1.5 pr-3 pl-9 text-sm outline-none focus:ring-1 focus:ring-[var(--xp-primary)]"
              />
            </div>

            {tab === "locations" && (
              <select
                value={kindFilter}
                onChange={(e) => {
                  setKindFilter(e.target.value);
                  setPage(1);
                }}
                className={filterCls}
                aria-label="Filter by kind"
              >
                <option value="ALL">Everything</option>
                <option value="VISITED">Visited</option>
                <option value="PLANNED">Bucket list</option>
                <option value="UNPLACED">Not on the map</option>
              </select>
            )}

            {tab !== "journals" && countries.length > 0 && (
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPage(1);
                }}
                className={filterCls}
                aria-label="Filter by country"
              >
                <option value="ALL">All countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {tab !== "expeditions" && trips.length > 0 && (
              <select
                value={tripFilter}
                onChange={(e) => {
                  setTripFilter(e.target.value);
                  setPage(1);
                }}
                className={filterCls}
                aria-label="Filter by expedition"
              >
                <option value="ALL">All expeditions</option>
                <option value="NONE">Not linked</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}

            {tab !== "journals" && (
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--xp-border)] px-3 py-1.5 text-xs text-[var(--xp-muted)]">
                <input
                  type="checkbox"
                  checked={favouritesOnly}
                  onChange={(e) => {
                    setFavouritesOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-[var(--xp-border)] accent-[var(--xp-primary)]"
                />
                {tab === "locations" ? "Favourites" : "Featured"}
              </label>
            )}

            {filtersActive && (
              <button
                onClick={resetFilters}
                className="px-2 py-1.5 text-xs text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* ── Rows ───────────────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[68px] animate-pulse rounded-2xl border border-[var(--xp-border)] bg-[var(--xp-border)]/30"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--xp-border)] px-6 py-14 text-center text-sm text-[var(--xp-muted)] italic">
              {filtersActive
                ? "Nothing matches these filters."
                : `Nothing here yet. Use “New ${nounSingular}” to start the archive.`}
            </p>
          ) : (
            visible.map((item) =>
              tab === "locations" ? (
                <LocationListRow
                  key={(item as LocationRow).id}
                  row={item as LocationRow}
                  tripTitle={
                    (item as LocationRow).tripId
                      ? tripTitles[(item as LocationRow).tripId!]
                      : undefined
                  }
                  onEdit={() => startEdit((item as LocationRow).id, (item as LocationRow).kind)}
                  onDelete={() =>
                    handleDelete(
                      (item as LocationRow).id,
                      (item as LocationRow).kind,
                      (item as LocationRow).name,
                    )
                  }
                />
              ) : tab === "expeditions" ? (
                <ExpeditionListRow
                  key={(item as TripRecord).id}
                  trip={item as TripRecord}
                  onEdit={() => startEdit((item as TripRecord).id, "trip")}
                  onDelete={() =>
                    handleDelete((item as TripRecord).id, "trip", (item as TripRecord).title)
                  }
                />
              ) : (
                <JournalListRow
                  key={(item as JournalRecord).id}
                  journal={item as JournalRecord}
                  tripTitle={
                    (item as JournalRecord).tripId
                      ? tripTitles[(item as JournalRecord).tripId!]
                      : undefined
                  }
                  onEdit={() => startEdit((item as JournalRecord).id, "journal")}
                  onDelete={() =>
                    handleDelete(
                      (item as JournalRecord).id,
                      "journal",
                      (item as JournalRecord).title,
                    )
                  }
                />
              ),
            )
          )}

          {/* ── Paging ─────────────────────────────────────────────── */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[var(--xp-muted)]">
                Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of{" "}
                {filtered.length}
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className={filterCls}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="rounded-lg border border-[var(--xp-border)] p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)] disabled:opacity-40"
                >
                  <IconChevronLeft size={14} />
                </button>
                <span className="text-xs text-[var(--xp-muted)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="rounded-lg border border-[var(--xp-border)] p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)] disabled:opacity-40"
                >
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Rows ─────────────────────────────────────────────────────────────── */

function Row({
  title,
  badges,
  subtitle,
  href,
  onEdit,
  onDelete,
}: {
  title: React.ReactNode;
  badges?: React.ReactNode;
  subtitle: string;
  href?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        styles.card,
        "flex items-center justify-between gap-3 rounded-2xl p-4",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {badges}
        </div>
        <p className="mt-0.5 truncate text-xs text-[var(--xp-muted)]">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {href && (
          <Link
            href={href}
            title="Open in the archive"
            className="rounded-lg p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-primary)]"
          >
            <IconExternalLink size={14} />
            <span className="sr-only">Open in the archive</span>
          </Link>
        )}
        <button
          onClick={onEdit}
          title="Edit"
          className="rounded-lg p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]"
        >
          <IconPencil size={14} />
          <span className="sr-only">Edit</span>
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="rounded-lg p-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-expedition)]"
        >
          <IconTrash size={14} />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "muted" | "accent" | "warn"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase",
        tone === "accent" &&
          "bg-[color-mix(in_oklab,var(--xp-primary)_14%,transparent)] text-[var(--xp-primary)]",
        tone === "warn" &&
          "bg-[color-mix(in_oklab,var(--xp-expedition)_14%,transparent)] text-[var(--xp-expedition)]",
        tone === "muted" && "bg-[var(--xp-border)] text-[var(--xp-muted)]",
      )}
    >
      {children}
    </span>
  );
}

function LocationListRow({
  row,
  tripTitle,
  onEdit,
  onDelete,
}: {
  row: LocationRow;
  tripTitle?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const planned = row.kind === "PLANNED" && !row.reached;
  const category = row.category ? categoryFor(row.category as TravelCategory) : undefined;

  return (
    <Row
      title={row.name}
      badges={
        <>
          {planned && <Badge tone="muted">Bucket list</Badge>}
          {row.kind === "PLANNED" && row.reached && <Badge tone="accent">Reached</Badge>}
          {category && <Badge tone="muted">{category.label}</Badge>}
          {row.isFavorited && (
            <IconStarFilled size={12} className="text-[var(--xp-primary)]" aria-label="Favourite" />
          )}
          {row.located ? (
            <IconMapPin size={12} className="text-[var(--xp-muted)]" aria-label="On the map" />
          ) : (
            <IconMapPinOff
              size={12}
              className="text-[var(--xp-expedition)] opacity-70"
              aria-label="No position — will not appear on the map"
            />
          )}
        </>
      }
      subtitle={[row.where, tripTitle, formatDate(row.date)].filter(Boolean).join(" · ") || "—"}
      href={`/travel/explore/places/${makeSlug(row.name, row.id)}`}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function ExpeditionListRow({
  trip,
  onEdit,
  onDelete,
}: {
  trip: TripRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const category = trip.category ? categoryFor(trip.category as TravelCategory) : undefined;

  return (
    <Row
      title={trip.title}
      badges={
        <>
          {trip.featured && <Badge tone="accent">Featured</Badge>}
          {category && <Badge tone="muted">{category.label}</Badge>}
          <Badge tone="muted">{trip.status.replace(/_/g, " ")}</Badge>
        </>
      }
      subtitle={
        [
          trip.destination,
          [formatDate(trip.startDate), formatDate(trip.endDate)].filter(Boolean).join(" → "),
          trip.distanceKm != null ? `${trip.distanceKm} km` : "",
        ]
          .filter(Boolean)
          .join(" · ") || "—"
      }
      href={`/travel/explore/trips/${makeSlug(trip.title, trip.id)}`}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function JournalListRow({
  journal,
  tripTitle,
  onEdit,
  onDelete,
}: {
  journal: JournalRecord;
  tripTitle?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Row
      title={journal.title}
      badges={
        <>
          {tripTitle ? <Badge tone="accent">{tripTitle}</Badge> : <Badge tone="muted">Standalone</Badge>}
          {journal.mood && <Badge tone="muted">{journal.mood.replace(/_/g, " ")}</Badge>}
        </>
      }
      subtitle={
        [journal.location, formatDate(journal.date)].filter(Boolean).join(" · ") || "—"
      }
      href={`/travel/explore/stories/${makeSlug(journal.title, journal.id)}`}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

interface ArchiveSnapshot {
  visited: VisitedRecord[];
  wishlist: WishlistRecord[];
  trips: TripRecord[];
  journals: JournalRecord[];
}

/**
 * All four collections, read together.
 *
 * A failed request yields an empty collection rather than rejecting the whole
 * read: one endpoint being down should cost the reader that one tab, not the
 * whole desk.
 */
async function fetchArchive(): Promise<ArchiveSnapshot> {
  const [visited, wishlist, trips, journals] = await Promise.all([
    fetchJson<VisitedRecord[]>("/api/travel/visited"),
    fetchJson<WishlistRecord[]>("/api/travel/wishlist"),
    fetchJson<TripRecord[]>("/api/travel/trips"),
    fetchJson<JournalRecord[]>("/api/travel/journals"),
  ]);
  return {
    visited: visited ?? [],
    wishlist: wishlist ?? [],
    trips: trips ?? [],
    journals: journals ?? [],
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    return await apiFetch<T>(url);
  } catch {
    return null;
  }
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const body = error.body as { error?: unknown } | null | undefined;
    if (body && typeof body.error === "string") return body.error;
    return fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
