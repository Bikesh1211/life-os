import { db } from "@/core/database";
import { clothingItems } from "../schema/items";
import { eq, and, isNull, desc, asc, sql, inArray } from "drizzle-orm";

export type ClothingItem = typeof clothingItems.$inferSelect;
export type CreateItemInput = typeof clothingItems.$inferInsert;

export type ItemFilters = {
  category?: string;
  condition?: string;
  season?: string;
  laundryStatus?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  sort?: string;
};

export async function createItem(input: CreateItemInput) {
  const [item] = await db.insert(clothingItems).values(input).returning();
  return item;
}

export async function getItemsForUser(userId: string, filters?: ItemFilters) {
  const conditions = [eq(clothingItems.userId, userId)];

  if (!filters?.isArchived) {
    conditions.push(eq(clothingItems.isArchived, false));
  }
  if (filters?.category) conditions.push(eq(clothingItems.category, filters.category as any));
  if (filters?.condition) conditions.push(eq(clothingItems.condition, filters.condition as any));
  if (filters?.season) conditions.push(eq(clothingItems.season, filters.season as any));
  if (filters?.laundryStatus) conditions.push(eq(clothingItems.laundryStatus, filters.laundryStatus));
  if (filters?.isFavorite !== undefined) conditions.push(eq(clothingItems.isFavorite, filters.isFavorite));
  if (filters?.search) {
    conditions.push(
      sql`(${clothingItems.name} ILIKE ${`%${filters.search}%`} OR ${clothingItems.brand} ILIKE ${`%${filters.search}%`} OR ${clothingItems.description} ILIKE ${`%${filters.search}%`})`
    );
  }

  conditions.push(isNull(clothingItems.deletedAt));

  let orderBy = desc(clothingItems.createdAt);
  if (filters?.sort) {
    switch (filters.sort) {
      case "name": orderBy = asc(clothingItems.name); break;
      case "newest": orderBy = desc(clothingItems.createdAt); break;
      case "oldest": orderBy = asc(clothingItems.createdAt); break;
      case "price-high": orderBy = desc(clothingItems.purchasePrice); break;
      case "price-low": orderBy = asc(clothingItems.purchasePrice); break;
      case "most-worn": orderBy = desc(clothingItems.wearCount); break;
      case "least-worn": orderBy = asc(clothingItems.wearCount); break;
      case "last-worn": orderBy = desc(clothingItems.lastWorn); break;
    }
  }

  return db.select().from(clothingItems).where(and(...conditions)).orderBy(orderBy);
}

export async function getItemById(id: string, userId: string) {
  const [item] = await db
    .select()
    .from(clothingItems)
    .where(and(eq(clothingItems.id, id), eq(clothingItems.userId, userId), isNull(clothingItems.deletedAt)));
  return item ?? null;
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>) {
  const [item] = await db
    .update(clothingItems)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(clothingItems.id, id), eq(clothingItems.userId, userId)))
    .returning();
  return item ?? null;
}

export async function deleteItem(id: string, userId: string) {
  const [item] = await db
    .update(clothingItems)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(clothingItems.id, id), eq(clothingItems.userId, userId), isNull(clothingItems.deletedAt)))
    .returning();
  return item ?? null;
}

export async function getDashboardStats(userId: string) {
  const items = await db
    .select()
    .from(clothingItems)
    .where(and(eq(clothingItems.userId, userId), isNull(clothingItems.deletedAt)));

  const totalItems = items.length;
  const favoriteItems = items.filter(i => i.isFavorite).length;
  const needsLaundry = items.filter(i => i.laundryStatus !== "ready").length;
  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.currentValue || "0")), 0);
  const totalSpent = items.reduce((sum, i) => sum + (parseFloat(i.purchasePrice || "0")), 0);
  const categoryBreakdown: Record<string, number> = {};
  const brandCount: Record<string, number> = {};
  let totalWearCount = 0;

  for (const item of items) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    if (item.brand) brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
    totalWearCount += item.wearCount;
  }

  const topBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentlyAdded = items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);
  const mostWorn = items.sort((a, b) => b.wearCount - a.wearCount).slice(0, 8);

  return {
    totalItems,
    favoriteItems,
    needsLaundry,
    totalValue,
    totalSpent,
    totalWearCount,
    categoryBreakdown,
    topBrands,
    recentlyAdded,
    mostWorn,
  };
}
