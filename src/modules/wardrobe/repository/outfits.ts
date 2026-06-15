import { db } from "@/core/database";
import { outfits } from "../schema/outfits";
import { outfitItems } from "../schema/outfit-items";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";

export type Outfit = typeof outfits.$inferSelect;
export type CreateOutfitInput = typeof outfits.$inferInsert;

export async function createOutfit(input: CreateOutfitInput) {
  const [outfit] = await db.insert(outfits).values(input).returning();
  return outfit;
}

export async function getOutfitsForUser(userId: string) {
  return db
    .select()
    .from(outfits)
    .where(and(eq(outfits.userId, userId), isNull(outfits.deletedAt)))
    .orderBy(desc(outfits.createdAt));
}

export async function getOutfitById(id: string, userId: string) {
  const [outfit] = await db
    .select()
    .from(outfits)
    .where(and(eq(outfits.id, id), eq(outfits.userId, userId), isNull(outfits.deletedAt)));
  if (!outfit) return null;

  const items = await db
    .select()
    .from(outfitItems)
    .where(eq(outfitItems.outfitId, id))
    .orderBy(outfitItems.position);

  return { ...outfit, items };
}

export async function updateOutfit(id: string, userId: string, input: Partial<CreateOutfitInput>) {
  const [outfit] = await db
    .update(outfits)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(outfits.id, id), eq(outfits.userId, userId)))
    .returning();
  return outfit ?? null;
}

export async function deleteOutfit(id: string, userId: string) {
  const [outfit] = await db
    .update(outfits)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(outfits.id, id), eq(outfits.userId, userId), isNull(outfits.deletedAt)))
    .returning();
  return outfit ?? null;
}

export async function setOutfitItems(outfitId: string, itemIds: string[]) {
  await db.delete(outfitItems).where(eq(outfitItems.outfitId, outfitId));
  if (itemIds.length === 0) return [];
  return db.insert(outfitItems).values(
    itemIds.map((itemId, index) => ({ outfitId, itemId, position: index }))
  ).returning();
}
