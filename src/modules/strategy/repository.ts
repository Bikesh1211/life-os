import { connectToDatabase } from "@/lib/mongodb";
import { StrategySectionModel, StrategyVersionModel } from "@/lib/models/strategy";

// ─── Types ────────────────────────────────────────────────────────

export type StrategySection = {
  id: string;
  userId: string;
  sectionType: string;
  title?: string;
  content: Record<string, any>;
  order: number;
  isPinned: boolean;
  metadata?: Record<string, any>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type StrategyVersion = {
  id: string;
  userId: string;
  sections: Record<string, any>;
  snapshot: Record<string, any>;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSectionInput = {
  userId: string;
  sectionType: string;
  content: unknown;
  sortOrder?: number;
  isPinned?: boolean;
};

export type UpdateSectionInput = {
  content?: unknown;
  sortOrder?: number;
  isPinned?: boolean;
};

export type CreateVersionInput = {
  userId: string;
  snapshot: unknown;
  summary?: string;
  wordCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────

function mapSection(doc: any): StrategySection {
  return { ...doc, id: doc._id.toString() };
}

function mapVersion(doc: any): StrategyVersion {
  return { ...doc, id: doc._id.toString() };
}

// ─── Sections ─────────────────────────────────────────────────────

export async function getAllSections(userId: string): Promise<StrategySection[]> {
  await connectToDatabase();
  const docs = await StrategySectionModel.find({ userId, deletedAt: null })
    .sort({ sectionType: 1, order: 1 })
    .lean();
  return docs.map(mapSection);
}

export async function getSectionsByType(userId: string, sectionType: string): Promise<StrategySection[]> {
  await connectToDatabase();
  const docs = await StrategySectionModel.find({ userId, sectionType, deletedAt: null })
    .sort({ order: 1 })
    .lean();
  return docs.map(mapSection);
}

export async function createSection(input: CreateSectionInput): Promise<StrategySection> {
  await connectToDatabase();
  const doc = await StrategySectionModel.create({
    userId: input.userId,
    sectionType: input.sectionType,
    content: input.content,
    order: input.sortOrder ?? 0,
    isPinned: input.isPinned ?? false,
  });
  return mapSection(doc.toObject());
}

export async function updateSection(id: string, userId: string, input: UpdateSectionInput): Promise<StrategySection | null> {
  await connectToDatabase();
  const updateData: Record<string, any> = {};
  if (input.content !== undefined) updateData.content = input.content;
  if (input.sortOrder !== undefined) updateData.order = input.sortOrder;
  if (input.isPinned !== undefined) updateData.isPinned = input.isPinned;
  updateData.updatedAt = new Date();

  const doc = await StrategySectionModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { $set: updateData },
    { new: true },
  ).lean();
  return doc ? mapSection(doc) : null;
}

export async function softDeleteSection(id: string, userId: string): Promise<StrategySection | null> {
  await connectToDatabase();
  const doc = await StrategySectionModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean();
  return doc ? mapSection(doc) : null;
}

export async function getNextSortOrder(userId: string, sectionType: string): Promise<number> {
  await connectToDatabase();
  const result = await StrategySectionModel.aggregate([
    { $match: { userId, sectionType, deletedAt: null } },
    { $group: { _id: null, maxOrder: { $max: "$order" } } },
  ]);
  return (result[0]?.maxOrder ?? -1) + 1;
}

export async function getSectionWordCount(userId: string): Promise<number> {
  const sections = await getAllSections(userId);
  let total = 0;
  for (const section of sections) {
    total += countWordsInContent(section.content);
  }
  return total;
}

function countWordsInContent(content: unknown): number {
  if (!content) return 0;
  return JSON.stringify(content)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

// ─── Versions ─────────────────────────────────────────────────────

export async function getNextVersionNumber(userId: string): Promise<number> {
  await connectToDatabase();
  const result = await StrategyVersionModel.aggregate([
    { $match: { userId } },
    { $group: { _id: null, maxVersion: { $max: "$versionNumber" } } },
  ]);
  return (result[0]?.maxVersion ?? 0) + 1;
}

export async function createVersion(input: CreateVersionInput & { versionNumber: number }): Promise<StrategyVersion> {
  await connectToDatabase();
  const doc = await StrategyVersionModel.create({
    userId: input.userId,
    versionNumber: input.versionNumber,
    snapshot: input.snapshot,
    sections: input.snapshot,
    note: input.summary,
    wordCount: input.wordCount,
  });
  return mapVersion(doc.toObject());
}

export async function getVersions(userId: string): Promise<StrategyVersion[]> {
  await connectToDatabase();
  const docs = await StrategyVersionModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(mapVersion);
}

export async function getVersionById(id: string, userId: string): Promise<StrategyVersion | null> {
  await connectToDatabase();
  const doc = await StrategyVersionModel.findOne({ _id: id, userId }).lean();
  return doc ? mapVersion(doc) : null;
}
