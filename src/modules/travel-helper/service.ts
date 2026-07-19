import { createTimelineEvent } from "@/modules/timeline";
import * as repo from "./repository";
import {
  createRouteSchema,
  updateRouteSchema,
  routeFilterSchema,
  type CreateRouteParams,
  type UpdateRouteParams,
  type RouteFilterParams,
  type RouteCard,
  type Waypoint,
} from "./types";

/* ── CRUD ── */

export async function getRoutes(userId: string, filters?: RouteFilterParams) {
  const validated = filters ? routeFilterSchema.parse(filters) : undefined;
  const routes = await repo.getRoutes(userId, validated);
  return routes.map(toRouteCard);
}

export async function getRouteById(id: string, userId: string) {
  const route = await repo.getRouteById(id, userId);
  return route ? toRouteCard(route) : null;
}

export async function createRoute(userId: string, input: CreateRouteParams) {
  const data = createRouteSchema.parse(input);
  const route = await repo.createRoute({
    userId,
    name: data.name,
    description: data.description ?? null,
    origin: data.origin as unknown as Record<string, unknown>,
    destination: data.destination as unknown as Record<string, unknown>,
    waypoints: (data.waypoints ?? []) as unknown as Record<string, unknown>[],
    polyline: data.polyline ?? null,
    totalDistanceKm: data.totalDistanceKm ? String(data.totalDistanceKm) : null,
    totalDurationMinutes: data.totalDurationMinutes ?? null,
    transportMode: data.transportMode,
    routeDate: data.routeDate ?? null,
    isFavorite: data.isFavorite ?? false,
    tags: data.tags ?? [],
    notes: data.notes ?? null,
    elevationMin: data.elevationMin ? String(data.elevationMin) : null,
    elevationMax: data.elevationMax ? String(data.elevationMax) : null,
    elevationGain: data.elevationGain ? String(data.elevationGain) : null,
    elevationLoss: data.elevationLoss ? String(data.elevationLoss) : null,
    geometries: data.geometries as Record<string, unknown> | null ?? null,
  });

  try {
    await createTimelineEvent(userId, {
      title: data.name,
      description: `${data.origin.label} → ${data.destination.label}${data.totalDistanceKm ? ` (${data.totalDistanceKm} km)` : ""}`,
      eventDate: data.routeDate
        ? new Date(data.routeDate + "T12:00:00").toISOString()
        : new Date().toISOString(),
      category: "travel",
      importance: "medium",
      linkedEntityId: route.id,
      linkedEntityType: "travel_route",
      tags: data.tags,
    });
  } catch {}

  return toRouteCard(route);
}

export async function updateRoute(id: string, userId: string, input: UpdateRouteParams) {
  const data = updateRouteSchema.parse(input);
  const updates: Record<string, unknown> = {};

  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.origin !== undefined) updates.origin = data.origin as unknown as Record<string, unknown>;
  if (data.destination !== undefined) updates.destination = data.destination as unknown as Record<string, unknown>;
  if (data.waypoints !== undefined) updates.waypoints = data.waypoints as unknown as Record<string, unknown>[];
  if (data.polyline !== undefined) updates.polyline = data.polyline;
  if (data.totalDistanceKm !== undefined) updates.totalDistanceKm = String(data.totalDistanceKm);
  if (data.totalDurationMinutes !== undefined) updates.totalDurationMinutes = data.totalDurationMinutes;
  if (data.transportMode !== undefined) updates.transportMode = data.transportMode;
  if (data.routeDate !== undefined) updates.routeDate = data.routeDate;
  if (data.isFavorite !== undefined) updates.isFavorite = data.isFavorite;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.elevationMin !== undefined) updates.elevationMin = data.elevationMin ? String(data.elevationMin) : null;
  if (data.elevationMax !== undefined) updates.elevationMax = data.elevationMax ? String(data.elevationMax) : null;
  if (data.elevationGain !== undefined) updates.elevationGain = data.elevationGain ? String(data.elevationGain) : null;
  if (data.elevationLoss !== undefined) updates.elevationLoss = data.elevationLoss ? String(data.elevationLoss) : null;
  if (data.geometries !== undefined) updates.geometries = data.geometries as Record<string, unknown> | null;

  const route = await repo.updateRoute(id, userId, updates);
  return route ? toRouteCard(route) : null;
}

export async function deleteRoute(id: string, userId: string) {
  return repo.softDeleteRoute(id, userId);
}

export async function getUpcomingRoutes(userId: string, limit = 5) {
  const routes = await repo.getUpcomingRoutes(userId, limit);
  return routes.map(toRouteCard);
}

export async function getRoutesByDate(userId: string, date: string) {
  const routes = await repo.getRoutesByDate(userId, date);
  return routes.map(toRouteCard);
}

/* ── Mappers ── */

function toRouteCard(route: repo.TravelHelperRoute): RouteCard {
  return {
    id: route.id,
    name: route.name,
    description: route.description,
    origin: route.origin as unknown as Waypoint,
    destination: route.destination as unknown as Waypoint,
    waypoints: route.waypoints as unknown as Waypoint[],
    polyline: route.polyline,
    totalDistanceKm: route.totalDistanceKm ? Number(route.totalDistanceKm) : null,
    totalDurationMinutes: route.totalDurationMinutes,
    transportMode: route.transportMode,
    routeDate: route.routeDate,
    isArchived: route.isArchived,
    isFavorite: route.isFavorite,
    tags: route.tags,
    notes: route.notes,
    elevationMin: route.elevationMin ? Number(route.elevationMin) : null,
    elevationMax: route.elevationMax ? Number(route.elevationMax) : null,
    elevationGain: route.elevationGain ? Number(route.elevationGain) : null,
    elevationLoss: route.elevationLoss ? Number(route.elevationLoss) : null,
    geometries: route.geometries,
    createdAt: route.createdAt?.toISOString() ?? "",
    updatedAt: route.updatedAt?.toISOString() ?? "",
  };
}

/* ── OSRM ── */

const OSRM_BASE = "https://router.project-osrm.org";

const OSRM_PROFILE_MAP: Record<string, string> = {
  driving: "driving",
  motorcycle: "driving", // OSRM has no motorcycle profile; use driving + exclude=motorway
  walking: "walking",
  cycling: "cycling",
};

export async function computeRoute(params: {
  origin: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[];
  transportMode: string;
}) {
  const profile = OSRM_PROFILE_MAP[params.transportMode] ?? "driving";
  const coordinates = [
    `${params.origin.lng},${params.origin.lat}`,
    ...params.waypoints.map((w) => `${w.lng},${w.lat}`),
    `${params.destination.lng},${params.destination.lat}`,
  ].join(";");

  let url = `${OSRM_BASE}/route/v1/${profile}/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=true&annotations=true`;

  if (params.transportMode === "motorcycle") {
    url += "&exclude=motorway";
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM request failed: ${response.statusText}`);
  }

  const osrmData = await response.json();
  if (osrmData.code !== "Ok" || !osrmData.routes?.length) {
    throw new Error(osrmData.message ?? "OSRM could not find a route");
  }

  const route = osrmData.routes[0];
  const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
  const durationMinutes = Math.round(route.duration / 60);
  const legSteps = route.legs.flatMap(
    (leg: { steps: Array<{ maneuver: { instruction: string; location: [number, number] }; distance: number; duration: number; name: string; mode: string }> }) =>
      leg.steps.map((step) => ({
        instruction: step.maneuver.instruction,
        distance: Math.round(step.distance),
        duration: Math.round(step.duration),
        name: step.name || undefined,
        mode: step.mode,
        location: step.maneuver.location,
      })),
  );

  const { elevation } = route.legs[0]?.annotation ?? {};
  const elevationValues = (elevation as number[]) ?? [];
  const elevationMin = elevationValues.length > 0 ? Math.round(Math.min(...elevationValues)) : null;
  const elevationMax = elevationValues.length > 0 ? Math.round(Math.max(...elevationValues)) : null;
  const elevationGain = elevationValues.length > 0
    ? Math.round(elevationValues.filter((_: number, i: number) => i === 0 || elevationValues[i] > elevationValues[i - 1]).reduce((acc: number, val: number, i: number, arr: number[]) => acc + (i === 0 ? 0 : Math.max(0, val - arr[i - 1])), 0))
    : null;
  const elevationLoss = elevationValues.length > 0
    ? Math.round(elevationValues.filter((_: number, i: number) => i === 0 || elevationValues[i] < elevationValues[i - 1]).reduce((acc: number, val: number, i: number, arr: number[]) => acc + (i === 0 ? 0 : Math.max(0, arr[i - 1] - val)), 0))
    : null;

  return {
    distanceKm,
    durationMinutes,
    polyline: JSON.stringify(route.geometry), // GeoJSON LineString
    geometry: route.geometry,
    elevation: elevationValues.length > 0 ? { min: elevationMin, max: elevationMax, gain: elevationGain, loss: elevationLoss } : null,
    steps: legSteps,
    legs: route.legs.map((leg: { distance: number; duration: number }) => ({
      distanceKm: Math.round((leg.distance / 1000) * 100) / 100,
      durationMinutes: Math.round(leg.duration / 60),
    })),
  };
}
