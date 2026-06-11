import { db } from "@/core/database";
import { wardrobeTags, wardrobeItemTags } from "../schema/tags";
import { eq, and, inArray } from "drizzle-orm";

export type Tag = typeof wardrobeTags.$inferSelect;
export type CreateTagInput = typeof wardrobeTags.$inferInsert;

export async function createTag(input: CreateTagInput) {
  const [tag] = await db.insert(wardrobeTags).values(input).returning();
  return tag;
}

export async function getTagsForUser(userId: string) {
  return db.select().from(wardrobeTags).where(eq(wardrobeTags.userId, userId));
}

export async function deleteTag(id: string, userId: string) {
  await db.delete(wardrobeItemTags).where(eq(wardrobeItemTags.tagId, id));
  const [tag] = await db.delete(wardrobeTags).where(and(eq(wardrobeTags.id, id), eq(wardrobeTags.userId, userId))).returning();
  return tag ?? null;
}

export async function setItemTags(itemId: string, tagIds: string[]) {
  await db.delete(wardrobeItemTags).where(eq(wardrobeItemTags.itemId, itemId));
  if (tagIds.length === 0) return [];
  return db.insert(wardrobeItemTags).values(
    tagIds.map(tagId => ({ itemId, tagId }))
  ).returning();
}

export async function getItemTagIds(itemId: string) {
  const rows = await db
    .select({ tagId: wardrobeItemTags.tagId })
    .from(wardrobeItemTags)
    .where(eq(wardrobeItemTags.itemId, itemId));
  return rows.map(r => r.tagId);
}
