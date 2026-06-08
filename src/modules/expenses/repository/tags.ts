import { db } from "@/core/database";
import { tags, transactionTags } from "../schema/tags";
import { eq, and, isNull } from "drizzle-orm";

export type Tag = typeof tags.$inferSelect;
export type CreateTagInput = typeof tags.$inferInsert;
export type UpdateTagInput = Partial<Omit<CreateTagInput, "id" | "userId">>;

export async function createTag(input: CreateTagInput) {
  const [tag] = await db.insert(tags).values(input).returning();
  return tag;
}

export async function getTagsForUser(userId: string) {
  return db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, userId), isNull(tags.deletedAt)))
    .orderBy(tags.name);
}

export async function getTagById(id: string, userId: string) {
  const [tag] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId), isNull(tags.deletedAt)));
  return tag ?? null;
}

export async function updateTag(id: string, userId: string, input: UpdateTagInput) {
  const [tag] = await db
    .update(tags)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(tags.id, id), eq(tags.userId, userId), isNull(tags.deletedAt)))
    .returning();
  return tag ?? null;
}

export async function deleteTag(id: string, userId: string) {
  const [tag] = await db
    .update(tags)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(tags.id, id), eq(tags.userId, userId), isNull(tags.deletedAt)))
    .returning();
  return tag ?? null;
}

export async function addTagToTransaction(transactionId: string, tagId: string) {
  const [relation] = await db
    .insert(transactionTags)
    .values({ transactionId, tagId })
    .returning();
  return relation;
}

export async function removeTagFromTransaction(transactionId: string, tagId: string) {
  await db
    .delete(transactionTags)
    .where(
      and(eq(transactionTags.transactionId, transactionId), eq(transactionTags.tagId, tagId)),
    );
}

export async function getTagsForTransaction(transactionId: string) {
  return db
    .select({ tag: tags })
    .from(transactionTags)
    .innerJoin(tags, eq(transactionTags.tagId, tags.id))
    .where(eq(transactionTags.transactionId, transactionId));
}
