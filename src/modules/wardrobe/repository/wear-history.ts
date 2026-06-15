import { db } from "@/core/database";
import { wearHistory } from "../schema/wear-history";
import { clothingItems } from "../schema/items";
import { eq, and, desc, sql } from "drizzle-orm";

export type WearEntry = typeof wearHistory.$inferSelect;

export async function logWear(input: typeof wearHistory.$inferInsert) {
  const [entry] = await db.insert(wearHistory).values(input).returning();
  await db.update(clothingItems)
    .set({
      wearCount: sql`${clothingItems.wearCount} + 1`,
      lastWorn: new Date(input.wornDate),
      updatedAt: new Date(),
    })
    .where(eq(clothingItems.id, input.itemId));
  return entry;
}

export async function getWearHistory(userId: string, limit = 50) {
  return db
    .select()
    .from(wearHistory)
    .where(eq(wearHistory.userId, userId))
    .orderBy(desc(wearHistory.wornDate))
    .limit(limit);
}

export async function getWearHistoryForItem(itemId: string) {
  return db
    .select()
    .from(wearHistory)
    .where(eq(wearHistory.itemId, itemId))
    .orderBy(desc(wearHistory.wornDate));
}
