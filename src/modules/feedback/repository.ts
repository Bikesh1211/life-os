import { connectToDatabase } from "@/lib/mongodb";
import { FeedbackEntryModel } from "@/lib/models/feedback";

// ─── Types ────────────────────────────────────────────────────────

export type FeedbackEntry = {
  id: string;
  userId: string;
  category: string;
  message: string;
  isAnonymous: boolean;
  pageUrl?: string;
  userAgent?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

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

export const feedbackColumns = [
  "id",
  "userId",
  "category",
  "message",
  "isAnonymous",
  "pageUrl",
  "userAgent",
  "readAt",
  "createdAt",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────

function mapEntry(doc: any): FeedbackEntry {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    category: doc.category,
    message: doc.message,
    isAnonymous: doc.isAnonymous,
    pageUrl: doc.pageUrl,
    userAgent: doc.userAgent,
    readAt: doc.readAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── Functions ────────────────────────────────────────────────────

export async function createFeedback(input: CreateFeedbackInput): Promise<FeedbackEntry> {
  await connectToDatabase();
  const doc = await FeedbackEntryModel.create({
    userId: input.userId,
    category: input.category,
    message: input.message,
    isAnonymous: input.isAnonymous ?? false,
    pageUrl: input.pageUrl ?? null,
    userAgent: input.userAgent ?? null,
  });
  return mapEntry(doc.toObject());
}

export async function getFeedbackForUser(userId: string, filters: FeedbackFilters = {}): Promise<FeedbackEntry[]> {
  await connectToDatabase();

  const filter: Record<string, any> = { userId };
  if (filters.read !== undefined) {
    if (filters.read) {
      filter.readAt = { $ne: null };
    } else {
      filter.readAt = null;
    }
  }

  const docs = await FeedbackEntryModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(filters.offset ?? 0)
    .limit(filters.limit ?? 50)
    .lean();

  return docs.map(mapEntry);
}

export async function markAsRead(id: string): Promise<FeedbackEntry | null> {
  await connectToDatabase();
  const doc = await FeedbackEntryModel.findOneAndUpdate(
    { _id: id },
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapEntry(doc) : null;
}
