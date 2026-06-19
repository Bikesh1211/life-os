import { db } from "@/core/database";
import { feedbackEntries } from "./schema";
import { eq, desc, isNull, isNotNull, and } from "drizzle-orm";

export type FeedbackEntry = typeof feedbackEntries.$inferSelect;

export type CreateFeedbackInput = {
  userId: string;
  category: string;
  message: string;
  isAnonymous?: boolean;
  pageUrl?: string;
  userAgent?: string;
};

export type FeedbackFilters = {
  read?: boolean;
  limit?: number;
  offset?: number;
};

export const feedbackColumns = {
  id: feedbackEntries.id,
  userId: feedbackEntries.userId,
  category: feedbackEntries.category,
  message: feedbackEntries.message,
  isAnonymous: feedbackEntries.isAnonymous,
  pageUrl: feedbackEntries.pageUrl,
  userAgent: feedbackEntries.userAgent,
  readAt: feedbackEntries.readAt,
  createdAt: feedbackEntries.createdAt,
};

export async function createFeedback(input: CreateFeedbackInput) {
  const [entry] = await db
    .insert(feedbackEntries)
    .values({
      userId: input.userId,
      category: input.category,
      message: input.message,
      isAnonymous: input.isAnonymous ?? false,
      pageUrl: input.pageUrl ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning(feedbackColumns);
  return entry;
}

export async function getFeedbackForUser(userId: string, filters: FeedbackFilters = {}) {
  const conditions = [eq(feedbackEntries.userId, userId)];
  if (filters.read !== undefined) {
    conditions.push(filters.read ? isNotNull(feedbackEntries.readAt) : isNull(feedbackEntries.readAt));
  }

  return db
    .select(feedbackColumns)
    .from(feedbackEntries)
    .where(and(...conditions))
    .orderBy(desc(feedbackEntries.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function markAsRead(id: string) {
  const [entry] = await db
    .update(feedbackEntries)
    .set({ readAt: new Date() })
    .where(eq(feedbackEntries.id, id))
    .returning(feedbackColumns);
  return entry ?? null;
}
