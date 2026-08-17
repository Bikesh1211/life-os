"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type * as Leaflet from "leaflet";
import { IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { canonicalCountry, routeLine } from "@/modules/travel/explore";
import type { Expedition, ExploredPlace } from "@/modules/travel/explore";
import styles from "./explore.module.css";
import "leaflet/dist/leaflet.css";

/**
 * THE EXPEDITION MAP — the centre of the Adventure Archive.
 *
 * Real geography, from the tile server Life OS already talks to in the travel
 * planner, rather than a second hand-drawn projection: this archive is not
 * bounded by one country, so the map has to be the world.
 *
 * What this map adds over the planner's is the *expedition* reading: routes
 * drawn between the places a trip actually reached, visited and planned markers
 * told apart at a glance, and a dossier that answers the four questions worth
 * asking of a marker — location, expedition, date, memory.
 *
 * The dossier is a panel beside the map, never a popup pinned to a marker. A
 * panel outside the frame cannot overflow it at any breakpoint, where a popup
 * on a marker near the edge of the viewport pushes itself off the screen every
 * time.
 *
 * Leaflet is imported inside the effect rather than at module scope. It touches
 * `window` while it initialises, and a client component still executes on the
 * server during the streaming render — a top-level import is a build that works
 * until the first server render of this page.
 */

interface ExpeditionMapProps {
  places: ExploredPlace[];
  expeditions: Expedition[];
  /** Draw this expedition's route only, and dim everything else. */
  focusExpedition?: string;
  /** Country filter; empty string means all. */
  country?: string;
  /** `VISITED`, `WISHLIST`, or both. */
  status?: "VISITED" | "WISHLIST" | "all";
  className?: string;
  /** Hides the chrome and the dossier — for the small map on a detail page. */
  compact?: boolean;
  height?: number;
}

interface Plotted {
  place: ExploredPlace;
  latitude: number;
  longitude: number;
}

function isPlaceable(p: ExploredPlace): p is ExploredPlace & { latitude: number; longitude: number } {
  return typeof p.latitude === "number" && typeof p.longitude === "number";
}

export function ExpeditionMap({
  places,
  expeditions,
  focusExpedition,
  country = "",
  status = "all",
  className,
  compact = false,
  height,
}: ExpeditionMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const fitRef = useRef<Leaflet.LatLngBoundsExpression | null>(null);
  const [ready, setReady] = useState(false);

  const plotted = useMemo<Plotted[]>(
    () =>
      places
        .filter(isPlaceable)
        .filter((p) => (status === "all" ? true : p.status === status))
        .filter((p) => (country ? canonicalCountry(p.country) === country : true))
        .map((p) => ({ place: p, latitude: p.latitude, longitude: p.longitude })),
    [places, status, country],
  );

  /* One polyline per expedition that has two or more located stops. Drawn under
     the markers so a route never covers the thing it connects. */
  const routes = useMemo(
    () =>
      expeditions
        .map((e) => ({ expedition: e, line: routeLine(e) }))
        .filter(({ line }) => line.length >= 2)
        .map(({ expedition, line }) => ({
          id: expedition.id,
          slug: expedition.slug,
          title: expedition.title,
          points: line.map((s) => [s.latitude, s.longitude] as [number, number]),
        })),
    [expeditions],
  );

  const active = activeId ? plotted.find((p) => p.place.id === activeId)?.place : undefined;

  /* ── The map itself ─────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        /* Scroll belongs to the page. A map that swallows the wheel traps a
           reader scrolling past it — ⌘/ctrl-scroll still zooms, which is the
           convention every embedded map has settled on. */
        scrollWheelZoom: false,
        worldCopyJump: true,
      }).setView([20, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      map.on("wheel", (event) => {
        const original = (event as unknown as { originalEvent: WheelEvent }).originalEvent;
        if (original.metaKey || original.ctrlKey) {
          original.preventDefault();
          map.setZoom(map.getZoom() - Math.sign(original.deltaY) * 0.5);
        }
      });

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  /* ── Markers and routes ─────────────────────────────────────────────── */

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      layer.clearLayers();

      for (const route of routes) {
        const focused = !focusExpedition || focusExpedition === route.slug;
        L.polyline(route.points, {
          color: "var(--xp-trail)",
          weight: focused ? 2.6 : 1.4,
          opacity: focused ? 0.85 : 0.25,
          dashArray: "7 7",
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(layer);
      }

      for (const { place, latitude, longitude } of plotted) {
        const visited = place.status === "VISITED";
        const dimmed = focusExpedition !== undefined && place.tripSlug !== focusExpedition;

        /* A DivIcon rather than Leaflet's default pin: the marker has to carry
           the archive's own vocabulary (filled for reached, hollow and dashed
           for planned) and it has to be a real link so it is keyboard
           reachable and right-clickable. */
        const marker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "",
            html: markerHtml(place, visited, dimmed),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
          keyboard: true,
          title: `${place.name}${place.city ? `, ${place.city}` : ""}`,
          alt: place.name,
          riseOnHover: true,
        }).addTo(layer);

        marker.on("mouseover", () => setActiveId(place.id));
        marker.on("mouseout", () => setActiveId((id) => (id === place.id ? null : id)));
        marker.on("focus", () => setActiveId(place.id));
        marker.on("click", () => setActiveId(place.id));
      }

      /* Fit to what is actually plotted, once per data change. A world view
         with three markers in one valley says nothing; a fit view says where
         the archive is. */
      if (plotted.length > 0) {
        const bounds = L.latLngBounds(plotted.map((p) => [p.latitude, p.longitude]));
        fitRef.current = bounds.pad(0.25);
        map.fitBounds(fitRef.current, { animate: false, maxZoom: plotted.length === 1 ? 9 : 13 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, plotted, routes, focusExpedition]);

  /* Leaflet measures its container on creation. Inside a grid that settles a
     frame later — or a tab that was hidden — that measurement is wrong, and the
     map paints into a corner. Re-measuring on resize is the documented fix. */
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [ready]);

  const mapHeight = height ?? (compact ? 280 : 460);

  return (
    <div
      className={cn(
        "grid gap-4",
        !compact && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6",
        className,
      )}
    >
      {/* ── The sheet ────────────────────────────────────────────────── */}
      <figure
        className={cn(
          styles.sheet,
          styles.tiles,
          "relative overflow-hidden rounded-md border border-[var(--xp-border)]",
        )}
      >
        <div
          ref={containerRef}
          style={{ height: mapHeight }}
          className="w-full"
          role="application"
          aria-label={`Expedition map. ${plotted.length} located ${plotted.length === 1 ? "place" : "places"}.`}
        />

        {plotted.length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--xp-muted)] italic">
            No place in the archive carries a position yet. Add coordinates to a visited place and
            it appears here.
          </p>
        )}

        {/* Chrome: zoom, reset, and the reading. */}
        {!compact && (
          <>
            <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1">
              <MapButton label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
                <IconPlus size={14} />
              </MapButton>
              <MapButton label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
                <IconMinus size={14} />
              </MapButton>
              <MapButton
                label="Reset view"
                onClick={() => {
                  if (fitRef.current) mapRef.current?.fitBounds(fitRef.current);
                  else mapRef.current?.setView([20, 0], 2);
                }}
              >
                <IconRefresh size={14} />
              </MapButton>
            </div>

            <figcaption className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-3">
              <span className="xp-label rounded-sm bg-[var(--xp-bg)]/85 px-2 py-1 text-[var(--xp-muted)] backdrop-blur-sm">
                Expedition map
              </span>
              {active?.latitude !== undefined && active?.longitude !== undefined && (
                <span className="xp-label rounded-sm bg-[var(--xp-bg)]/85 px-2 py-1 text-[var(--xp-primary)] tabular-nums backdrop-blur-sm">
                  {active.latitude.toFixed(3)}, {active.longitude.toFixed(3)}
                </span>
              )}
            </figcaption>
          </>
        )}
      </figure>

      {/* ── The dossier ──────────────────────────────────────────────── */}
      {!compact && (
        <aside
          aria-live="polite"
          className={cn(styles.panel, "flex flex-col rounded-md p-5")}
        >
          {active ? (
            <>
              <p className="xp-label text-[var(--xp-muted)]">Location</p>
              <h3 className="mt-1 text-xl font-semibold">{active.name}</h3>
              <p className="mt-1 text-sm text-[var(--xp-muted)]">
                {[active.city, active.country].filter(Boolean).join(", ")}
              </p>

              {active.tripTitle && (
                <>
                  <p className="xp-label mt-5 text-[var(--xp-muted)]">Expedition</p>
                  <p className="mt-1 text-sm">{active.tripTitle}</p>
                </>
              )}

              <p className="xp-label mt-5 text-[var(--xp-muted)]">Date</p>
              <p className="mt-1 text-sm">
                {active.visitedAt
                  ? new Date(active.visitedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : active.status === "WISHLIST"
                    ? "Not yet reached"
                    : "Date not recorded"}
              </p>

              {(active.notes || active.description) && (
                <>
                  <p className="xp-label mt-5 text-[var(--xp-muted)]">Memory</p>
                  <p className="mt-1 line-clamp-4 text-sm text-[var(--xp-muted)] italic">
                    {active.notes || active.description}
                  </p>
                </>
              )}

              <Link
                href={`/travel/explore/places/${active.slug}`}
                className="xp-label mt-auto inline-flex items-center gap-1.5 pt-6 text-[var(--xp-primary)] transition-opacity hover:opacity-80"
              >
                Open the record →
              </Link>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <p className="xp-label mb-3 text-[var(--xp-muted)]">The archive</p>
              <p className="text-sm text-[var(--xp-muted)]">
                {plotted.length > 0
                  ? "Hover or focus a marker to read its record. Drag to pan, ⌘-scroll or pinch to zoom."
                  : "No mapped locations yet."}
              </p>

              <dl className="mt-6 space-y-2 text-sm">
                <Legend tone="var(--xp-expedition)" label="Visited" filled />
                <Legend tone="var(--xp-brass)" label="Planned" />
                <Legend tone="var(--xp-trail)" label="Expedition route" dashed />
              </dl>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

/**
 * A marker, as markup.
 *
 * Written as a string because that is Leaflet's `divIcon` contract — it takes
 * HTML, not a React node. The anchor makes each marker a real link, so a
 * keyboard reader can tab the archive's positions and a reader can open one in
 * a new tab, which a click handler on a circle never allows.
 */
function markerHtml(place: ExploredPlace, visited: boolean, dimmed: boolean): string {
  const label = escapeHtml(`${place.name}${place.city ? `, ${place.city}` : ""}`);
  const href = `/travel/explore/places/${place.slug}`;
  const opacity = dimmed ? 0.3 : 1;

  const dot = visited
    ? `<span style="position:absolute;inset:9px;border-radius:9999px;background:var(--xp-expedition)"></span>
       <span style="position:absolute;inset:4px;border-radius:9999px;background:var(--xp-expedition);opacity:.22"></span>`
    : `<span style="position:absolute;inset:7px;border-radius:9999px;background:var(--xp-bg);border:1.6px dashed var(--xp-brass)"></span>`;

  return `<a href="${href}" aria-label="${label}"
    style="display:block;position:relative;width:30px;height:30px;opacity:${opacity}">
    ${dot}
  </a>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function MapButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex size-8 items-center justify-center rounded-sm border border-[var(--xp-border)] bg-[var(--xp-bg)]/85 text-[var(--xp-muted)] backdrop-blur-sm transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] hover:text-[var(--xp-primary)]"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Legend({
  tone,
  label,
  filled = false,
  dashed = false,
}: {
  tone: string;
  label: string;
  filled?: boolean;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <dt className="sr-only">Legend</dt>
      <dd className="flex items-center gap-2.5 text-[var(--xp-muted)]">
        {dashed ? (
          <span
            className="h-px w-4"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${tone} 0 4px, transparent 4px 7px)`,
            }}
          />
        ) : (
          <span
            className="size-2.5 rounded-full"
            style={{
              background: filled ? tone : "transparent",
              border: filled ? undefined : `1.5px dashed ${tone}`,
            }}
          />
        )}
        {label}
      </dd>
    </div>
  );
}
