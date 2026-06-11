import { db } from "../database";
import { coreTags, coreTaggings } from "./schema";
import { eq, and } from "drizzle-orm";

export type Tag = typeof coreTags.$inferSelect;
export type CreateTagInput = typeof coreTags.$inferInsert;

export async function createTag(input: CreateTagInput) {
  const [tag] = await db.insert(coreTags).values(input).returning();
  return tag;
}

export async function getTagsForUser(userId: string) {
  return db.select().from(coreTags).where(eq(coreTags.userId, userId));
}

export async function deleteTag(id: string, userId: string) {
  await db.delete(coreTaggings).where(eq(coreTaggings.tagId, id));
  const [tag] = await db.delete(coreTags).where(and(eq(coreTags.id, id), eq(coreTags.userId, userId))).returning();
  return tag ?? null;
}

export async function setEntityTags(tagIds: string[], entityId: string, entityType: string) {
  await db.delete(coreTaggings).where(and(eq(coreTaggings.entityId, entityId), eq(coreTaggings.entityType, entityType)));
  if (tagIds.length === 0) return [];
  return db.insert(coreTaggings).values(tagIds.map(tagId => ({ tagId, entityId, entityType }))).returning();
}

export async function getEntityTagIds(entityId: string, entityType: string) {
  const rows = await db
    .select({ tagId: coreTaggings.tagId })
    .from(coreTaggings)
    .where(and(eq(coreTaggings.entityId, entityId), eq(coreTaggings.entityType, entityType)));
  return rows.map(r => r.tagId);
}
