import { db } from "@/core/database";
import { techItems } from "../schema/items";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";

export type TechItem = typeof techItems.$inferSelect;
export type CreateItemInput = typeof techItems.$inferInsert;

export type ItemFilters = {
  category?: string;
  condition?: string;
  ownershipStatus?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  sort?: string;
};

export async function createItem(input: CreateItemInput) {
  const [item] = await db.insert(techItems).values(input).returning();
  return item;
}

export async function getItemsForUser(userId: string, filters?: ItemFilters) {
  const conditions = [eq(techItems.userId, userId)];

  if (!filters?.isArchived) {
    conditions.push(eq(techItems.isArchived, false));
  }
  if (filters?.category) conditions.push(eq(techItems.category, filters.category));
  if (filters?.condition) conditions.push(eq(techItems.condition, filters.condition as any));
  if (filters?.ownershipStatus) conditions.push(eq(techItems.ownershipStatus, filters.ownershipStatus as any));
  if (filters?.isFavorite !== undefined) conditions.push(eq(techItems.isFavorite, filters.isFavorite));
  if (filters?.search) {
    conditions.push(
      sql`(${techItems.name} ILIKE ${`%${filters.search}%`} OR ${techItems.brand} ILIKE ${`%${filters.search}%`} OR ${techItems.model} ILIKE ${`%${filters.search}%`} OR ${techItems.notes} ILIKE ${`%${filters.search}%`})`
    );
  }

  conditions.push(isNull(techItems.deletedAt));

  let orderBy = desc(techItems.createdAt);
  if (filters?.sort) {
    switch (filters.sort) {
      case "name": orderBy = asc(techItems.name); break;
      case "newest": orderBy = desc(techItems.createdAt); break;
      case "oldest": orderBy = asc(techItems.createdAt); break;
      case "price-high": orderBy = desc(techItems.purchasePrice); break;
      case "price-low": orderBy = asc(techItems.purchasePrice); break;
    }
  }

  return db.select().from(techItems).where(and(...conditions)).orderBy(orderBy);
}

export async function getItemById(id: string, userId: string) {
  const [item] = await db
    .select()
    .from(techItems)
    .where(and(eq(techItems.id, id), eq(techItems.userId, userId), isNull(techItems.deletedAt)));
  return item ?? null;
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>) {
  const [item] = await db
    .update(techItems)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(techItems.id, id), eq(techItems.userId, userId)))
    .returning();
  return item ?? null;
}

export async function deleteItem(id: string, userId: string) {
  const [item] = await db
    .update(techItems)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(techItems.id, id), eq(techItems.userId, userId), isNull(techItems.deletedAt)))
    .returning();
  return item ?? null;
}

export async function getDashboardStats(userId: string) {
  const items = await db
    .select()
    .from(techItems)
    .where(and(eq(techItems.userId, userId), isNull(techItems.deletedAt)));

  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.purchasePrice || "0")), 0);
  const favoriteItems = items.filter(i => i.isFavorite).length;
  const loanedItems = items.filter(i => i.ownershipStatus === "loaned-out").length;
  const brokenItems = items.filter(i => i.condition === "broken" || i.condition === "repairing").length;
  const warrantyExpiring = items.filter(i => {
    if (!i.warrantyExpiry) return false;
    const daysLeft = (new Date(i.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft < 90;
  }).length;
  const categoryBreakdown: Record<string, number> = {};
  const brandCount: Record<string, number> = {};

  for (const item of items) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    if (item.brand) brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
  }

  const topBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentlyAdded = items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

  return {
    totalItems,
    totalValue,
    favoriteItems,
    loanedItems,
    brokenItems,
    warrantyExpiring,
    categoryBreakdown,
    topBrands,
    recentlyAdded,
  };
}
