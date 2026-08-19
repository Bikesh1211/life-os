/* The one map configuration Life OS uses wherever a map is drawn.
 *
 * OSM's standard tiles (tile.openstreetmap.org) render place labels in the
 * local script — Devanagari over Nepal — with no language switch on offer.
 * Esri's World Street Map renders English labels and needs no API key, at the
 * price of a slightly different look and mandatory attribution (which both
 * Esri and OpenStreetMap require). See ADR-0012. */

export const BASEMAP_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

export const BASEMAP_MAX_ZOOM = 19;

export const BASEMAP_ATTRIBUTION =
  "&copy; <a href=\"https://www.esri.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Esri</a> " +
  "&mdash; Source: Esri, TomTom, Garmin, FAO, NOAA, USGS, " +
  "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener noreferrer\">OpenStreetMap</a> " +
  "contributors and the GIS User Community";

/* The home view. Every map that has nothing to fit to lands here rather than
   on the whole world. */
export const DEFAULT_MAP_CENTER: [number, number] = [28.39, 84.12];
export const DEFAULT_MAP_ZOOM = 7;
