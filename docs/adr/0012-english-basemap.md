# ADR-0012: English Basemap via Esri World Street Map

**Status:** Accepted
**Date:** 2026-08-19
**Tags:** travel, maps, basemap, i18n

## Context

Every map in Life OS — the Expedition Map (`/travel/explore`), the Travel Helper planner, and the route detail — drew tiles from OpenStreetMap's standard server (`tile.openstreetmap.org`). OSM's standard tiles render place labels using the OSM `name` tag, which is the **local script**: over Nepal the map prints Devanagari (काठमाडौं, नेपाल). The standard tile service offers no language switch.

The app's own map chrome was already fully English; the only non-English text on the map was the basemap's own labels. With the archive holding Nepali places, the labels were unreadable to the reader the map serves.

Options considered:

1. **Esri World Street Map** — free, no API key, English labels by default, raster tiles (a drop-in swap for Leaflet). Trade-offs: a busier style than OSM's, and mandatory attribution for both Esri and OSM.
2. **CartoDB Voyager** — free, no key, cleanest look, but it renders the same local-script `name` labels; it does not solve the problem.
3. **MapTiles API** — purpose-built "OSM in English", keeps the OSM-standard look, but requires a RapidAPI key and caps the free tier at 10,000 tiles/day.
4. **Vector tiles (OpenFreeMap / MapTiler) + MapLibre GL** — full label-language control, but replaces Leaflet and rewrites the three map components. Overkill for a label-language change.

## Decision

Use **Esri World Street Map** as Life OS's single shared basemap.

- A new core module `src/core/maps/basemap.ts` defines the tile URL, max zoom, attribution, and the default home view; it is the one place map configuration lives.
- All three maps (`expedition-map.tsx`, `PlannerTab.tsx`, `RouteDetail.tsx`) draw from it, so map language and look cannot drift between pages.
- The default home view — a map with nothing to fit to — rests on Nepal (28.39°N, 84.12°E, zoom 7) instead of the whole world. Maps that have plotted places still fit themselves to those bounds.
- Attribution is enabled on every map (the planner and route detail previously ran with `attributionControl: false`), because both Esri's and OSM's terms require it.

## Consequences

### Positive
- English place labels everywhere, readable regardless of the region in view.
- No API key, no quota, no sign-up — a personal app's maps keep working unattended.
- A single `src/core/maps/basemap.ts` means a future provider change (e.g. a keyed English-OSM service) is a one-file diff.

### Negative
- The map look changes from OSM-standard to Esri's denser, more colourful street style.
- The two travel-helper maps now show an attribution control that was previously hidden.
- Esri's public tile service is intended for light, non-commercial use; a heavy deployment would need an ArcGIS account or a keyed provider.
- "The archive is not bounded by one country, so the map has to be the world" (the Expedition Map's original premise) is softened: the idle view is now the home country, though fit-to-places keeps the archive world-capable.

### Neutral
- Tile requests now go to `server.arcgisonline.com` instead of `tile.openstreetmap.org`; the tile grid and zoom range (0–19) are unchanged.
- The default view is a hardcoded Nepal centre. If Life OS ever grows a real "home location" concept, this becomes the seed for it.
