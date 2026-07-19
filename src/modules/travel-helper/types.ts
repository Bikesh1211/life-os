import { z } from "zod";

export const waypointSchema = z.object({
  label: z.string().min(1).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export type Waypoint = z.infer<typeof waypointSchema>;

export const transportModeSchema = z.enum(["driving", "motorcycle", "walking", "cycling"]);

export const createRouteSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  origin: waypointSchema,
  destination: waypointSchema,
  waypoints: z.array(waypointSchema).max(50).default([]),
  polyline: z.string().optional(),
  totalDistanceKm: z.number().positive().optional(),
  totalDurationMinutes: z.number().int().positive().optional(),
  transportMode: transportModeSchema.default("driving"),
  routeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  notes: z.string().max(5000).optional(),
  elevationMin: z.number().optional(),
  elevationMax: z.number().optional(),
  elevationGain: z.number().optional(),
  elevationLoss: z.number().optional(),
  geometries: z.any().optional(),
});

export const updateRouteSchema = createRouteSchema.partial();

export const routeFilterSchema = z.object({
  search: z.string().optional(),
  transportMode: transportModeSchema.optional(),
  isFavorite: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  tag: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const osrmRouteRequestSchema = z.object({
  origin: waypointSchema,
  destination: waypointSchema,
  waypoints: z.array(waypointSchema).max(48).default([]),
  transportMode: transportModeSchema.default("driving"),
});

export type CreateRouteParams = z.infer<typeof createRouteSchema>;
export type UpdateRouteParams = z.infer<typeof updateRouteSchema>;
export type RouteFilterParams = z.infer<typeof routeFilterSchema>;
export type OsrmRouteRequest = z.infer<typeof osrmRouteRequestSchema>;

export interface RouteCard {
  id: string;
  name: string;
  description: string | null;
  origin: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[];
  polyline: string | null;
  totalDistanceKm: number | null;
  totalDurationMinutes: number | null;
  transportMode: string;
  routeDate: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  tags: string[];
  notes: string | null;
  elevationMin: number | null;
  elevationMax: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  geometries: unknown;
  createdAt: string;
  updatedAt: string;
}
