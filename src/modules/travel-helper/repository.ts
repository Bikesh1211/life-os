import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/core/database";
import { travelHelperRoutes } from "./schema";
import type { RouteFilterParams } from "./types";

export type TravelHelperRoute = typeof travelHelperRoutes.$inferSelect;
export type CreateRouteInput = typeof travelHelperRoutes.$inferInsert;

export async function getRoutes(userId: string, filters?: RouteFilterParams) {
  const conditions: SQL[] = [eq(travelHelperRoutes.userId, userId), isNull(travelHelperRoutes.deletedAt)];

  if (filters) {
    if (filters.search) {
      const searchCondition = or(
        ilike(travelHelperRoutes.name, `%${filters.search}%`),
        ilike(travelHelperRoutes.description, `%${filters.search}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    if (filters.transportMode) {
      conditions.push(eq(travelHelperRoutes.transportMode, filters.transportMode));
    }
    if (filters.isFavorite !== undefined) {
      conditions.push(eq(travelHelperRoutes.isFavorite, filters.isFavorite));
    }
    if (filters.isArchived !== undefined) {
      conditions.push(eq(travelHelperRoutes.isArchived, filters.isArchived));
    }
    if (filters.tag) {
      conditions.push(sql`${filters.tag} = ANY(${travelHelperRoutes.tags})`);
    }
    if (filters.dateFrom) {
      conditions.push(gte(travelHelperRoutes.routeDate, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(travelHelperRoutes.routeDate, filters.dateTo));
    }
  }

  return db
    .select()
    .from(travelHelperRoutes)
    .where(and(...conditions))
    .orderBy(desc(travelHelperRoutes.isFavorite), desc(travelHelperRoutes.createdAt));
}

export async function getRouteById(id: string, userId: string) {
  return db
    .select()
    .from(travelHelperRoutes)
    .where(and(eq(travelHelperRoutes.id, id), eq(travelHelperRoutes.userId, userId), isNull(travelHelperRoutes.deletedAt)))
    .then((r) => r[0] ?? null);
}

export async function createRoute(input: CreateRouteInput) {
  const [route] = await db.insert(travelHelperRoutes).values(input).returning();
  return route;
}

export async function updateRoute(id: string, userId: string, input: Partial<CreateRouteInput>) {
  const [route] = await db
    .update(travelHelperRoutes)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(travelHelperRoutes.id, id), eq(travelHelperRoutes.userId, userId)))
    .returning();
  return route ?? null;
}

export async function softDeleteRoute(id: string, userId: string) {
  const [route] = await db
    .update(travelHelperRoutes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(travelHelperRoutes.id, id), eq(travelHelperRoutes.userId, userId)))
    .returning();
  return route ?? null;
}

export async function getRoutesByDate(userId: string, date: string) {
  return db
    .select()
    .from(travelHelperRoutes)
    .where(
      and(
        eq(travelHelperRoutes.userId, userId),
        eq(travelHelperRoutes.routeDate, date),
        isNull(travelHelperRoutes.deletedAt),
        eq(travelHelperRoutes.isArchived, false),
      ),
    )
    .orderBy(asc(travelHelperRoutes.name));
}

export async function getUpcomingRoutes(userId: string, limit = 5) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .select()
    .from(travelHelperRoutes)
    .where(
      and(
        eq(travelHelperRoutes.userId, userId),
        gte(travelHelperRoutes.routeDate, today),
        isNull(travelHelperRoutes.deletedAt),
        eq(travelHelperRoutes.isArchived, false),
      ),
    )
    .orderBy(asc(travelHelperRoutes.routeDate))
    .limit(limit);
}

export async function getRouteCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(travelHelperRoutes)
    .where(
      and(eq(travelHelperRoutes.userId, userId), isNull(travelHelperRoutes.deletedAt), eq(travelHelperRoutes.isArchived, false)),
    );
  return Number(result?.count ?? 0);
}
