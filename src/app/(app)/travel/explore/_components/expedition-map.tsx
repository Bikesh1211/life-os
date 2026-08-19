"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type * as Leaflet from "leaflet";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconMinus,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import {
  BASEMAP_ATTRIBUTION,
  BASEMAP_MAX_ZOOM,
  BASEMAP_URL,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/core/maps/basemap";
import { canonicalCountry, routeLine } from "@/modules/travel/explore";
import type { Expedition, ExploredPlace } from "@/modules/travel/explore";
import styles from "./explore.module.css";
import "leaflet/dist/leaflet.css";

/**
 * THE EXPEDITION MAP — the centre of the Adventure Archive.
 *
 * Real geography, from the shared basemap (see `@/core/maps/basemap`), rather
 * than a second hand-drawn projection: this archive is not bounded by one
 * country, so when places are plotted the map fits itself to them. Idle, it
 * rests on the home view.
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
  const [expanded, setExpanded] = useState(false);
  /* A click pins the dossier open so it survives the cursor leaving the
     marker (hover alone is a preview that dismisses on mouseout). */
  const pinnedIdRef = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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
    let onWheel: ((event: WheelEvent) => void) | undefined;
    const container = containerRef.current;

    (async () => {
      if (!container || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (cancelled || !container || mapRef.current) return;

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
        /* Scroll belongs to the page. A map that swallows the wheel traps a
           reader scrolling past it — ⌘/ctrl-scroll still zooms, which is the
           convention every embedded map has settled on. */
        scrollWheelZoom: false,
        /* zoomSnap 0 keeps ⌘/ctrl-scroll's 0.5 steps from snapping back to
           the nearest integer below. */
        zoomSnap: 0,
        worldCopyJump: true,
      }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

      L.tileLayer(BASEMAP_URL, {
        maxZoom: BASEMAP_MAX_ZOOM,
        attribution: BASEMAP_ATTRIBUTION,
      }).addTo(map);

      /* Leaflet's Map does not forward `wheel` to `map.on("wheel")` — wheel
         is the scroll wheel handler's own DOM listener, so listen on the
         container instead. `passive:false` is what lets preventDefault stop
         the browser's native page zoom. */
      onWheel = (event: WheelEvent) => {
        /* When expanded, Leaflet's own scrollWheelZoom is enabled and already
           handles the wheel with proper smoothing — don't double-zoom. */
        if (map.scrollWheelZoom.enabled()) return;
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          map.setZoom(map.getZoom() - Math.sign(event.deltaY) * 0.5);
        }
      };
      container.addEventListener("wheel", onWheel, { passive: false });

      /* Clicking empty map dismisses a pinned dossier. */
      map.on("click", () => {
        pinnedIdRef.current = null;
        setActiveId(null);
      });

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (onWheel && container) container.removeEventListener("wheel", onWheel);
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

      /* Drop a pin that once pointed at a place no longer on screen (e.g. the
         expedition/country filter changed). */
      if (pinnedIdRef.current !== null && !plotted.some((p) => p.place.id === pinnedIdRef.current)) {
        pinnedIdRef.current = null;
        setActiveId(null);
      }

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
           reachable and right-clickable. A plain click is swallowed so the
           dossier opens beside the map instead of navigating away; the record
           is one intentional "View details" deep. */
        const marker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "",
            html: markerHtml(place, visited, dimmed),
            /* A visited pin is a teardrop whose tip overhangs the anchor so it
               points at the actual coordinates; a planned place is a centred
               paddle. */
            iconSize: visited ? [30, 35] : [30, 30],
            iconAnchor: visited ? [15, 35] : [15, 15],
          }),
          keyboard: true,
          title: `${place.name}${place.city ? `, ${place.city}` : ""}`,
          alt: place.name,
          riseOnHover: true,
        }).addTo(layer);

        marker.on("mouseover", () => {
          if (pinnedIdRef.current === null) setActiveId(place.id);
        });
        marker.on("mouseout", () => {
          if (pinnedIdRef.current !== place.id)
            setActiveId((id) => (id === place.id ? null : id));
        });
        marker.on("focus", () => {
          if (pinnedIdRef.current === null) setActiveId(place.id);
        });
        marker.on("click", () => {
          pinnedIdRef.current = place.id;
          setActiveId(place.id);
        });
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

  /* ── Full screen ────────────────────────────────────────────────────
     Two mechanisms, and both on purpose.

     The CSS overlay is what actually makes the map fill the window, and it is
     the one that always works: a fixed root, the sheet taking the space, the
     dossier still beside it. The Fullscreen API is layered on top of that
     because "full screen" reasonably means the browser's own chrome gets out
     of the way too — but it is a request the browser may refuse, and refusing
     it must not leave the control doing nothing. So the state drives the
     layout and the API is best-effort.

     Leaving is symmetric: the button, Escape, or the browser dropping out of
     fullscreen on its own all land in the same place. */

  const toggleExpanded = useCallback(() => {
    setExpanded((current) => {
      const next = !current;
      const element = rootRef.current;

      if (next) {
        void element?.requestFullscreen?.().catch(() => {
          /* Refused — the CSS overlay still fills the viewport. */
        });
      } else if (document.fullscreenElement) {
        void document.exitFullscreen?.().catch(() => {});
      }

      return next;
    });
  }, []);

  /* The browser can leave fullscreen without asking — Escape, or the user
     switching tabs on some platforms. When it does, the overlay has to follow,
     or the map stays pinned over the page with no way out of it. */
  useEffect(() => {
    function onChange() {
      if (!document.fullscreenElement) setExpanded(false);
      /* The browser commits fullscreen asynchronously; a map measured during
         the transition paints no tiles. Re-measure on the frames after the
         state settles so the map fills the finally-sized overlay. */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => mapRef.current?.invalidateSize(true));
      });
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Escape leaves even when the API was refused and the browser therefore has
     no fullscreen of its own to exit. */
  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
        if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  /* The page underneath must not scroll while the map is over it. */
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  /* Growing to the window is a resize Leaflet has to be told about, and the
     fitted bounds are worth recomputing — a view framed for a 460px card is
     needlessly tight in a 1000px one. `requestAnimationFrame` waits for the
     new layout to settle, which `invalidateSize` needs to measure against. */
  useEffect(() => {
    if (!ready) return;
    const frame1 = requestAnimationFrame(() => {
      /* A second frame lets the grid/fullscreen reflow fully settle before
         `invalidateSize` measures the container — a single frame can catch the
         map mid-resize and leave it blank. */
      requestAnimationFrame(() => {
        const map = mapRef.current;
        if (!map) return;
        map.invalidateSize(true);
        if (fitRef.current) map.fitBounds(fitRef.current, { animate: false });
      });
    });
    return () => cancelAnimationFrame(frame1);
  }, [expanded, ready]);

  /* Inline, the wheel belongs to the page and only ⌘-scroll zooms — a map that
     swallows the wheel traps a reader scrolling past it. Full screen there is
     no page left to scroll, so the wheel goes back to meaning zoom, which is
     what it means on every other map. */
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    if (expanded) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [expanded, ready]);

  /* The compact map sits in a 22rem column on desktop and full-width on small
   screens, so a taller default reads as a proper map there — and until the
   fullscreen overlay is reliable this is the map people actually use. */
  const mapHeight = height ?? (compact ? 420 : 460);

  /* Full screen shows the dossier whichever map was expanded — including the
     small one on a detail page, which has no panel inline. The point of
     expanding is to read the archive off the map, and that needs the record
     beside it. */
  const showPanel = expanded || !compact;

  return (
    <div
      ref={rootRef}
      className={cn(
        expanded
          ? /* Column on a phone so the map keeps the height it needs and the
               dossier sits under it; two tracks from `lg` up, the same shape
               the inline map has. The explicit `minmax(0,1fr)` row is what
               lets the sheet actually fill a viewport-height grid — a default
               `auto` row collapses, because the map's own container only
               reports `h-full` (a height of an auto box is zero). */
            "fixed inset-0 z-[1080] flex flex-col gap-3 bg-[var(--xp-bg)] p-3 lg:grid lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-4 lg:p-4"
          : cn("grid gap-4", !compact && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6"),
        className,
      )}
    >
      {/* ── The sheet ────────────────────────────────────────────────── */}
      <figure
        className={cn(
          styles.sheet,
          styles.tiles,
          "relative overflow-hidden rounded-md border border-[var(--xp-border)]",
/* `min-h-0` is what lets the sheet actually shrink inside the flex
               column — without it a flex item refuses to go below its content
               and the dossier is pushed off the bottom of the window. `h-full`
               is belt-and-braces for the lg grid, in case the row sizing ever
               regresses. */
            expanded && "min-h-0 flex-1 lg:h-full",
        )}
      >
        <div
          ref={containerRef}
          style={expanded ? undefined : { height: mapHeight }}
          className={cn("w-full", expanded && "h-full")}
          role="application"
          aria-label={`Expedition map. ${plotted.length} located ${plotted.length === 1 ? "place" : "places"}.`}
        />

        {plotted.length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--xp-muted)] italic">
            No place in the archive carries a position yet. Add coordinates to a visited place and
            it appears here.
          </p>
        )}

        {/* The expand control is the one piece of chrome a compact map still
            gets: a small map that cannot be opened is a picture of a map. */}
        {compact && !expanded && (
          <div className="absolute top-3 right-3 z-[500]">
            <MapButton label="Full screen" onClick={toggleExpanded}>
              <IconArrowsMaximize size={14} />
            </MapButton>
          </div>
        )}

        {/* Chrome: zoom, reset, full screen, and the reading. */}
        {(!compact || expanded) && (
          <>
            <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1">
              <MapButton
                label={expanded ? "Exit full screen" : "Full screen"}
                onClick={toggleExpanded}
              >
                {expanded ? <IconArrowsMinimize size={14} /> : <IconArrowsMaximize size={14} />}
              </MapButton>
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
                  else mapRef.current?.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
                }}
              >
                <IconRefresh size={14} />
              </MapButton>
            </div>

            <figcaption className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-3">
              <span className="xp-label rounded-sm bg-[var(--xp-bg)]/85 px-2 py-1 text-[var(--xp-muted)] backdrop-blur-sm">
                {expanded ? "Expedition map · Esc to close" : "Expedition map"}
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
      {showPanel && (
        <aside
          aria-live="polite"
          className={cn(
            styles.panel,
            "flex flex-col rounded-md p-5",
            /* Expanded on a phone the panel is a short scrolling tray under
               the map; from `lg` it is the full-height column beside it. */
            expanded && "max-h-[34vh] shrink-0 overflow-y-auto lg:max-h-none lg:h-full",
          )}
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
                View details →
              </Link>
            </>
          ) : (
            <div className="flex h-full flex-col justify-center">
              <p className="xp-label mb-3 text-[var(--xp-muted)]">The archive</p>
              <p className="text-sm text-[var(--xp-muted)]">
                {plotted.length === 0
                  ? "No mapped locations yet."
                  : expanded
                    ? "Hover or focus a marker to read its record. Drag to pan, scroll or pinch to zoom."
                    : "Hover or focus a marker to read its record. Drag to pan, ⌘-scroll or pinch to zoom."}
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
 * a new tab, which a click handler on a circle never allows. The plain click
 * is prevented from navigating: the archive's convention is that a pound on a
 * marker opens the dossier beside the map, and the record is reached only
 * through the panel's own "View details".
 */
function markerHtml(place: ExploredPlace, visited: boolean, dimmed: boolean): string {
  const label = escapeHtml(`${place.name}${place.city ? `, ${place.city}` : ""}`);
  const href = `/travel/explore/places/${place.slug}`;
  const opacity = dimmed ? 0.3 : 1;
  const height = visited ? 35 : 30;

  const glyph = visited
    ? /* A filled teardrop in expedition red with a white rim and core, so it
         reads as a real map pin against any basemap. Inset to the top edge so
         the tip at the bottom lands exactly on the anchor. */
      `<svg viewBox="0 0 30 35" width="30" height="35" aria-hidden="true"
          style="display:block;position:absolute;top:0;left:0">
        <path d="M15 1C22 1 27 6 27 12C27 18.5 22.5 24.5 15 35C7.5 24.5 3 18.5 3 12C3 6 8 1 15 1Z"
          fill="var(--xp-expedition)" stroke="rgba(255,255,255,.95)" stroke-width="2"/>
        <circle cx="15" cy="12" r="5.5" fill="#ffffff"/>
      </svg>`
    : `<span style="position:absolute;inset:6px;border-radius:9999px;background:var(--xp-bg);border:1.7px dashed var(--xp-brass)"></span>`;

  return `<a href="${href}" aria-label="${label}"
    onclick="if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) event.preventDefault()"
    style="display:block;position:relative;width:30px;height:${height}px;opacity:${opacity}">
    ${glyph}
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
