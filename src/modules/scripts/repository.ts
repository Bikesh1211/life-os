import { connectToDatabase } from "@/lib/mongodb";
import {
  ScriptModel,
  ScriptSectionModel,
  ScriptCategoryModel,
  ScriptStructureTemplateModel,
  ScriptVersionModel,
  ScriptPracticeSessionModel,
  ScriptQuestionModel,
  ScriptActionItemModel,
  ScriptChecklistTemplateModel,
} from "@/lib/models/scripts";

export type Script = any;
export type ScriptSection = any;
export type ScriptCategory = any;
export type ScriptVersion = any;
export type ScriptPracticeSession = any;
export type ScriptQuestion = any;
export type ScriptActionItem = any;
export type ScriptChecklistItem = any;

export type CreateScriptInput = any;
export type CreateScriptSectionInput = any;
export type CreateScriptCategoryInput = any;
export type CreateScriptVersionInput = any;
export type CreateScriptPracticeSessionInput = any;
export type CreateScriptQuestionInput = any;
export type CreateScriptActionItemInput = any;
export type CreateScriptChecklistItemInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

// ── Scripts ──

export async function createScript(input: CreateScriptInput) {
  await connectToDatabase();
  const doc = await ScriptModel.create(input);
  return toPlain(doc);
}

export async function getScriptsForUser(
  userId: string,
  opts: {
    status?: string;
    search?: string;
    categoryId?: string;
    tags?: string[];
    priority?: string;
    difficulty?: string;
    isFavorite?: boolean;
    sortBy?: "createdAt" | "title" | "updatedAt" | "eventDate" | "wordCount";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
    includeTrashed?: boolean;
  } = {},
) {
  await connectToDatabase();
  const filter: any = { userId };
  filter.deletedAt = opts.includeTrashed ? { $ne: null } : null;

  if (opts.status) filter.status = opts.status;
  if (opts.categoryId) filter.categoryId = opts.categoryId;
  if (opts.priority) filter.priority = opts.priority;
  if (opts.difficulty) filter.difficulty = opts.difficulty;
  if (opts.isFavorite !== undefined) filter.isFavorite = opts.isFavorite;
  if (opts.search) {
    filter.$or = [
      { title: { $regex: opts.search, $options: "i" } },
      { subtitle: { $regex: opts.search, $options: "i" } },
      { speaker: { $regex: opts.search, $options: "i" } },
      { venue: { $regex: opts.search, $options: "i" } },
    ];
  }
  if (opts.tags && opts.tags.length > 0) {
    filter.tags = { $in: opts.tags };
  }

  const sortField = opts.sortBy ?? "createdAt";
  const sortDir = opts.sortOrder === "asc" ? 1 : -1;

  const docs = await ScriptModel.find(filter)
    .sort({ [sortField]: sortDir })
    .skip(opts.offset ?? 0)
    .limit(opts.limit ?? 100)
    .lean();
  return toPlainArray(docs);
}

export async function getScriptById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await ScriptModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateScript(id: string, userId: string, input: Partial<CreateScriptInput>) {
  await connectToDatabase();
  const doc = await ScriptModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteScript(id: string, userId: string) {
  await connectToDatabase();
  const doc = await ScriptModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getScriptDashboardStats(userId: string) {
  await connectToDatabase();
  const [stats] = await ScriptModel.aggregate([
    { $match: { userId, deletedAt: null } },
    {
      $group: {
        _id: null,
        totalScripts: { $sum: 1 },
        draftCount: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        practicingCount: { $sum: { $cond: [{ $eq: ["$status", "practicing"] }, 1, 0] } },
        readyCount: { $sum: { $cond: [{ $eq: ["$status", "ready"] }, 1, 0] } },
        archivedCount: { $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] } },
        favoriteCount: { $sum: { $cond: [{ $eq: ["$isFavorite", true] }, 1, 0] } },
        totalWordCount: { $sum: { $ifNull: ["$wordCount", 0] } },
        totalDuration: { $sum: { $ifNull: ["$totalDurationSeconds", 0] } },
      },
    },
  ]);

  return stats ?? {
    totalScripts: 0,
    draftCount: 0,
    practicingCount: 0,
    readyCount: 0,
    archivedCount: 0,
    favoriteCount: 0,
    totalWordCount: 0,
    totalDuration: 0,
  };
}

export async function getUpcomingScripts(userId: string, limit = 5) {
  await connectToDatabase();
  const now = new Date();
  const docs = await ScriptModel.find({
    userId,
    deletedAt: null,
    eventDate: { $ne: null, $gte: now },
  })
    .sort({ eventDate: 1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function getRecentScripts(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await ScriptModel.find({ userId, deletedAt: null })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function getFavoriteScripts(userId: string, limit = 5) {
  await connectToDatabase();
  const docs = await ScriptModel.find({ userId, isFavorite: true, deletedAt: null })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

// ── Sections ──

export async function createSection(input: CreateScriptSectionInput) {
  await connectToDatabase();
  const doc = await ScriptSectionModel.create(input);
  return toPlain(doc);
}

export async function getSectionsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptSectionModel.find({ scriptId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function getSectionById(id: string, userId: string) {
  await connectToDatabase();
  const section = await ScriptSectionModel.findOne({ _id: id }).lean();
  if (!section) return null;
  const script = await ScriptModel.findOne({ _id: section.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;
  return toPlain(section);
}

export async function updateSection(id: string, userId: string, input: Partial<CreateScriptSectionInput>) {
  await connectToDatabase();
  const section = await ScriptSectionModel.findOne({ _id: id }).lean();
  if (!section) return null;
  const script = await ScriptModel.findOne({ _id: section.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptSectionModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteSection(id: string, userId: string) {
  await connectToDatabase();
  const section = await ScriptSectionModel.findOne({ _id: id }).lean();
  if (!section) return null;
  const script = await ScriptModel.findOne({ _id: section.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptSectionModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

export async function reorderSections(items: { id: string; sortOrder: number }[]) {
  await connectToDatabase();
  for (const item of items) {
    await ScriptSectionModel.findOneAndUpdate({ _id: item.id }, { sortOrder: item.sortOrder });
  }
}

export async function getScriptWordCount(scriptId: string) {
  await connectToDatabase();
  const [result] = await ScriptSectionModel.aggregate([
    { $match: { scriptId } },
    {
      $group: {
        _id: null,
        totalWords: { $sum: { $ifNull: ["$wordCount", 0] } },
        sectionCount: { $sum: 1 },
        totalDuration: { $sum: { $ifNull: ["$estimatedDurationSeconds", 0] } },
      },
    },
  ]);
  return result ?? { totalWords: 0, sectionCount: 0, totalDuration: 0 };
}

// ── Categories ──

export async function createScriptCategory(input: CreateScriptCategoryInput) {
  await connectToDatabase();
  const doc = await ScriptCategoryModel.create(input);
  return toPlain(doc);
}

export async function getCategoriesForUser(userId: string) {
  await connectToDatabase();
  const docs = await ScriptCategoryModel.find({ userId, isArchived: false })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function getAllCategories() {
  await connectToDatabase();
  const docs = await ScriptCategoryModel.find()
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function getCategoryById(id: string) {
  await connectToDatabase();
  const doc = await ScriptCategoryModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function updateScriptCategory(id: string, input: Partial<CreateScriptCategoryInput>) {
  await connectToDatabase();
  const doc = await ScriptCategoryModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteScriptCategory(id: string) {
  await connectToDatabase();
  const doc = await ScriptCategoryModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

// ── Structure Templates ──

export async function getTemplatesForCategory(categoryId: string) {
  await connectToDatabase();
  const docs = await ScriptStructureTemplateModel.find({ categoryId }).lean();
  return toPlainArray(docs);
}

export async function getAllTemplates() {
  await connectToDatabase();
  const docs = await ScriptStructureTemplateModel.find().lean();
  return toPlainArray(docs);
}

// ── Versions ──

export async function createScriptVersion(input: CreateScriptVersionInput) {
  await connectToDatabase();
  const doc = await ScriptVersionModel.create(input);
  return toPlain(doc);
}

export async function getVersionsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptVersionModel.find({ scriptId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getVersionById(id: string, userId: string) {
  await connectToDatabase();
  const version = await ScriptVersionModel.findOne({ _id: id }).lean();
  if (!version) return null;
  const script = await ScriptModel.findOne({ _id: version.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;
  return toPlain(version);
}

// ── Practice Sessions ──

export async function createPracticeSession(input: CreateScriptPracticeSessionInput) {
  await connectToDatabase();
  const doc = await ScriptPracticeSessionModel.create(input);
  return toPlain(doc);
}

export async function getPracticeSessionsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptPracticeSessionModel.find({ scriptId })
    .sort({ practicedAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getRecentPracticeSessions(userId: string, limit = 10) {
  await connectToDatabase();
  const docs = await ScriptPracticeSessionModel.find({ userId })
    .sort({ practicedAt: -1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function getPracticeSessionById(id: string) {
  await connectToDatabase();
  const doc = await ScriptPracticeSessionModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function getPracticeSessionStats(userId: string) {
  await connectToDatabase();
  const [stats] = await ScriptPracticeSessionModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: { $ifNull: ["$durationSeconds", 0] } },
        avgConfidence: { $avg: { $ifNull: ["$confidence", 0] } },
        avgRating: { $avg: { $ifNull: ["$rating", 0] } },
        avgVoiceQuality: { $avg: { $ifNull: ["$voiceQuality", 0] } },
        avgEyeContact: { $avg: { $ifNull: ["$eyeContact", 0] } },
      },
    },
  ]);
  return stats ?? {
    totalSessions: 0,
    totalDuration: 0,
    avgConfidence: 0,
    avgRating: 0,
    avgVoiceQuality: 0,
    avgEyeContact: 0,
  };
}

// ── Questions ──

export async function createQuestion(input: CreateScriptQuestionInput) {
  await connectToDatabase();
  const doc = await ScriptQuestionModel.create(input);
  return toPlain(doc);
}

export async function getQuestionsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptQuestionModel.find({ scriptId })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getQuestionById(id: string) {
  await connectToDatabase();
  const doc = await ScriptQuestionModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function updateQuestion(id: string, userId: string, input: Partial<CreateScriptQuestionInput>) {
  await connectToDatabase();
  const question = await ScriptQuestionModel.findOne({ _id: id }).lean();
  if (!question) return null;
  const script = await ScriptModel.findOne({ _id: question.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptQuestionModel.findOneAndUpdate(
    { _id: id },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteQuestion(id: string, userId: string) {
  await connectToDatabase();
  const question = await ScriptQuestionModel.findOne({ _id: id }).lean();
  if (!question) return null;
  const script = await ScriptModel.findOne({ _id: question.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptQuestionModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

// ── Action Items ──

export async function createActionItem(input: CreateScriptActionItemInput) {
  await connectToDatabase();
  const doc = await ScriptActionItemModel.create(input);
  return toPlain(doc);
}

export async function getActionItemsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptActionItemModel.find({ scriptId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateActionItem(id: string, userId: string, input: Partial<CreateScriptActionItemInput>) {
  await connectToDatabase();
  const item = await ScriptActionItemModel.findOne({ _id: id }).lean();
  if (!item) return null;
  const script = await ScriptModel.findOne({ _id: item.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptActionItemModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteActionItem(id: string, userId: string) {
  await connectToDatabase();
  const item = await ScriptActionItemModel.findOne({ _id: id }).lean();
  if (!item) return null;
  const script = await ScriptModel.findOne({ _id: item.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptActionItemModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}

// ── Checklist Items ──

export async function createChecklistItem(input: CreateScriptChecklistItemInput) {
  await connectToDatabase();
  const doc = await ScriptChecklistTemplateModel.create(input);
  return toPlain(doc);
}

export async function getChecklistItemsForScript(scriptId: string) {
  await connectToDatabase();
  const docs = await ScriptChecklistTemplateModel.find({ scriptId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function updateChecklistItem(id: string, userId: string, input: Partial<CreateScriptChecklistItemInput>) {
  await connectToDatabase();
  const item = await ScriptChecklistTemplateModel.findOne({ _id: id }).lean();
  if (!item) return null;
  const script = await ScriptModel.findOne({ _id: item.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptChecklistTemplateModel.findOneAndUpdate(
    { _id: id },
    input,
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteChecklistItem(id: string, userId: string) {
  await connectToDatabase();
  const item = await ScriptChecklistTemplateModel.findOne({ _id: id }).lean();
  if (!item) return null;
  const script = await ScriptModel.findOne({ _id: item.scriptId, userId, deletedAt: null }).lean();
  if (!script) return null;

  const doc = await ScriptChecklistTemplateModel.findOneAndDelete({ _id: id }).lean();
  return toPlain(doc);
}
