import { db } from "@/core/database";
import { techSetups } from "../schema/setups";
import { techSetupItems } from "../schema/setup-items";
import { eq, and, isNull, desc } from "drizzle-orm";

export type Setup = typeof techSetups.$inferSelect;
export type CreateSetupInput = typeof techSetups.$inferInsert;

export async function createSetup(input: CreateSetupInput) {
  const [setup] = await db.insert(techSetups).values(input).returning();
  return setup;
}

export async function getSetupsForUser(userId: string) {
  return db
    .select()
    .from(techSetups)
    .where(and(eq(techSetups.userId, userId), isNull(techSetups.deletedAt)))
    .orderBy(desc(techSetups.createdAt));
}

export async function getSetupById(id: string, userId: string) {
  const [setup] = await db
    .select()
    .from(techSetups)
    .where(and(eq(techSetups.id, id), eq(techSetups.userId, userId), isNull(techSetups.deletedAt)));
  if (!setup) return null;

  const items = await db
    .select()
    .from(techSetupItems)
    .where(eq(techSetupItems.setupId, id))
    .orderBy(techSetupItems.position);

  return { ...setup, items };
}

export async function updateSetup(id: string, userId: string, input: Partial<CreateSetupInput>) {
  const [setup] = await db
    .update(techSetups)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(techSetups.id, id), eq(techSetups.userId, userId)))
    .returning();
  return setup ?? null;
}

export async function deleteSetup(id: string, userId: string) {
  const [setup] = await db
    .update(techSetups)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(techSetups.id, id), eq(techSetups.userId, userId), isNull(techSetups.deletedAt)))
    .returning();
  return setup ?? null;
}

export async function setSetupItems(setupId: string, itemIds: string[]) {
  await db.delete(techSetupItems).where(eq(techSetupItems.setupId, setupId));
  if (itemIds.length === 0) return [];
  return db.insert(techSetupItems).values(
    itemIds.map((itemId, index) => ({ setupId, itemId, position: index }))
  ).returning();
}
