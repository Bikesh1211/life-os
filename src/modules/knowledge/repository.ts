import { connectToDatabase } from "@/lib/mongodb";
import { KnowledgeEntryModel, KnowledgeEntryLinkModel } from "@/lib/models/knowledge";

// ─── Types ────────────────────────────────────────────────────────

export type KnowledgeEntry = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  subcategory?: string;
  dateLearned: Date;
  summary?: string;
  detailedNotes?: string;
  keyTakeaways?: string;
  examples?: string;
  resources?: string;
  tags: string[];
  difficultyLevel: string;
  learningSource?: string;
  resourceUrl?: string;
  masteryLevel: number;
  confidenceScore: number;
  timeSpent?: number;
  reviewStatus: string;
  lastReviewedAt?: Date;
  nextActions?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type KnowledgeEntryLink = {
  id: string;
  entryId: string;
  linkedEntryId: string;
  relationshipType: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateKnowledgeEntryInput = {
  userId: string;
  title: string;
  subject: string;
  subcategory?: string;
  dateLearned: Date;
  summary?: string;
  detailedNotes?: string;
  keyTakeaways?: string;
  examples?: string;
  resources?: string;
  tags?: string[];
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  learningSource?: string;
  resourceUrl?: string;
  masteryLevel?: number;
  confidenceScore?: number;
  timeSpent?: number;
  nextActions?: string;
};

export type UpdateKnowledgeEntryInput = Partial<Omit<CreateKnowledgeEntryInput, "userId">>;

export type SearchKnowledgeParams = {
  query?: string;
  subject?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  masteryMin?: number;
  masteryMax?: number;
  learningSource?: string;
  sortBy?: "newest" | "oldest" | "most_reviewed";
  limit?: number;
  offset?: number;
};

// ─── Helpers ──────────────────────────────────────────────────────

function mapId(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(mapId);
  const { _id, ...rest } = doc;
  return { id: _id?.toString() ?? rest.id, ...rest };
}

// ─── Entries ──────────────────────────────────────────────────────

export async function createEntry(input: CreateKnowledgeEntryInput) {
  await connectToDatabase();
  const doc = await KnowledgeEntryModel.create({
    userId: input.userId,
    title: input.title,
    subject: input.subject,
    subcategory: input.subcategory,
    dateLearned: input.dateLearned,
    summary: input.summary,
    detailedNotes: input.detailedNotes,
    keyTakeaways: input.keyTakeaways,
    examples: input.examples,
    resources: input.resources,
    tags: input.tags ?? [],
    difficultyLevel: input.difficultyLevel ?? "beginner",
    learningSource: input.learningSource,
    resourceUrl: input.resourceUrl,
    masteryLevel: input.masteryLevel ?? 1,
    confidenceScore: input.confidenceScore ?? 1,
    timeSpent: input.timeSpent,
    nextActions: input.nextActions,
  });
  return mapId(doc.toObject());
}

export async function getEntriesForUser(userId: string) {
  await connectToDatabase();
  const docs = await KnowledgeEntryModel.find({ userId, deletedAt: null })
    .sort({ dateLearned: -1 })
    .lean();
  return mapId(docs);
}

export async function getEntryById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await KnowledgeEntryModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return doc ? mapId(doc) : null;
}

export async function updateEntry(id: string, userId: string, input: UpdateKnowledgeEntryInput) {
  await connectToDatabase();
  const doc = await KnowledgeEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function deleteEntry(id: string, userId: string) {
  await connectToDatabase();
  const doc = await KnowledgeEntryModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapId(doc) : null;
}

export async function searchEntries(userId: string, params: SearchKnowledgeParams) {
  await connectToDatabase();

  const filter: any = { userId, deletedAt: null };

  if (params.query) {
    filter.$or = [
      { title: { $regex: params.query, $options: "i" } },
      { summary: { $regex: params.query, $options: "i" } },
      { detailedNotes: { $regex: params.query, $options: "i" } },
      { keyTakeaways: { $regex: params.query, $options: "i" } },
      { tags: params.query },
    ];
  }

  if (params.subject) {
    filter.subject = params.subject;
  }

  if (params.tags && params.tags.length > 0) {
    filter.tags = { $in: params.tags };
  }

  if (params.dateFrom) {
    filter.dateLearned = { ...filter.dateLearned, $gte: params.dateFrom };
  }

  if (params.dateTo) {
    filter.dateLearned = { ...filter.dateLearned, $lte: params.dateTo };
  }

  if (params.masteryMin !== undefined) {
    filter.masteryLevel = { ...filter.masteryLevel, $gte: params.masteryMin };
  }

  if (params.masteryMax !== undefined) {
    filter.masteryLevel = { ...filter.masteryLevel, $lte: params.masteryMax };
  }

  if (params.learningSource) {
    filter.learningSource = params.learningSource;
  }

  let sort: any = { dateLearned: -1 };
  if (params.sortBy === "oldest") {
    sort = { dateLearned: 1 };
  } else if (params.sortBy === "most_reviewed") {
    sort = { lastReviewedAt: -1 };
  }

  const docs = await KnowledgeEntryModel.find(filter)
    .sort(sort)
    .skip(params.offset ?? 0)
    .limit(params.limit ?? 50)
    .lean();

  return mapId(docs);
}

// ─── Links ────────────────────────────────────────────────────────

export async function createLink(
  entryId: string,
  linkedEntryId: string,
  relationshipType: string,
  userId: string,
) {
  await connectToDatabase();
  const entry = await getEntryById(entryId, userId);
  const linked = await getEntryById(linkedEntryId, userId);
  if (!entry || !linked) return null;

  const doc = await KnowledgeEntryLinkModel.create({ entryId, linkedEntryId, relationshipType });
  return mapId(doc.toObject());
}

export async function getLinksForEntry(entryId: string, userId: string) {
  await connectToDatabase();
  const entry = await getEntryById(entryId, userId);
  if (!entry) return [];

  const links = await KnowledgeEntryLinkModel.find({ entryId }).lean();
  const linkIds = links.map((l: any) => l.linkedEntryId.toString());

  const linkedEntries =
    linkIds.length > 0
      ? await KnowledgeEntryModel.find({ _id: { $in: linkIds }, deletedAt: null }).lean()
      : [];
  const entryMap = new Map(linkedEntries.map((e: any) => [e._id.toString(), e]));

  return links.map((l: any) => ({
    link: mapId(l),
    linkedEntry: entryMap.get(l.linkedEntryId.toString())
      ? mapId(entryMap.get(l.linkedEntryId.toString()))
      : null,
  }));
}

export async function removeLink(linkId: string, userId: string) {
  await connectToDatabase();

  const link = await KnowledgeEntryLinkModel.findOne({ _id: linkId }).lean();
  if (!link) return null;

  const entry = await getEntryById(link.entryId.toString(), userId);
  if (!entry) return null;

  const doc = await KnowledgeEntryLinkModel.findOneAndDelete({ _id: linkId }).lean();
  return doc ? mapId(doc) : null;
}

// ─── Subjects ─────────────────────────────────────────────────────

export async function getSubjects(userId: string) {
  await connectToDatabase();
  const rows = await KnowledgeEntryModel.aggregate([
    { $match: { userId, deletedAt: null } },
    { $group: { _id: "$subject" } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r: any) => r._id);
}

// ─── Reviews ──────────────────────────────────────────────────────

export async function getDueReviews(userId: string) {
  await connectToDatabase();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const docs = await KnowledgeEntryModel.find({
    userId,
    deletedAt: null,
    reviewStatus: { $ne: "mastered" },
    $or: [
      { lastReviewedAt: null },
      { lastReviewedAt: { $lte: oneDayAgo } },
    ],
  })
    .sort({ lastReviewedAt: 1 })
    .lean();

  return mapId(docs);
}
