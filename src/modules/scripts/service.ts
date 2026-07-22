import { z } from "zod";
import {
  createScript,
  getScriptsForUser,
  getScriptById,
  updateScript,
  deleteScript,
  getScriptDashboardStats,
  getUpcomingScripts,
  getRecentScripts,
  getFavoriteScripts,
  createSection,
  getSectionsForScript,
  getSectionById,
  updateSection,
  deleteSection,
  reorderSections,
  getScriptWordCount,
  createScriptCategory,
  getCategoriesForUser,
  getAllCategories,
  getCategoryById,
  updateScriptCategory,
  deleteScriptCategory,
  getTemplatesForCategory,
  getAllTemplates,
  createScriptVersion,
  getVersionsForScript,
  getVersionById,
  createPracticeSession,
  getPracticeSessionsForScript,
  getRecentPracticeSessions,
  getPracticeSessionStats,
  createQuestion,
  getQuestionsForScript,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createActionItem,
  getActionItemsForScript,
  updateActionItem,
  deleteActionItem,
  createChecklistItem,
  getChecklistItemsForScript,
  updateChecklistItem,
  deleteChecklistItem,
  type CreateScriptInput,
  type CreateScriptSectionInput,
  type CreateScriptCategoryInput,
  type CreateScriptVersionInput,
  type CreateScriptPracticeSessionInput,
  type CreateScriptQuestionInput,
  type CreateScriptActionItemInput,
  type CreateScriptChecklistItemInput,
} from "./repository";

const priorities = ["low", "medium", "high", "critical"] as const;
const difficulties = ["easy", "medium", "hard"] as const;
const visibilities = ["private", "public"] as const;
const statuses = ["draft", "practicing", "ready", "archived"] as const;
const questionDifficulties = ["easy", "medium", "hard"] as const;
const questionStatuses = ["needs_practice", "practiced", "mastered"] as const;

function countWordsFromDoc(doc: { type?: string; content?: unknown[]; text?: string }): number {
  if (!doc) return 0;
  let wordCount = 0;
  const stack = [doc];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.text) {
      wordCount += node.text.split(/\s+/).filter(Boolean).length;
    }
    if (node.content && Array.isArray(node.content)) {
      for (let i = node.content.length - 1; i >= 0; i--) {
        stack.push(node.content[i] as any);
      }
    }
  }
  return wordCount;
}

// ── Zod Schemas ──

export const createScriptSchema = z.object({
  title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  purpose: z.string().max(2000).optional(),
  audience: z.string().max(1000).optional(),
  venue: z.string().max(500).optional(),
  language: z.string().max(20).default("en"),
  eventDate: z.string().datetime().optional(),
  eventTime: z.string().max(10).optional(),
  expectedDuration: z.number().int().min(0).optional(),
  speaker: z.string().max(300).optional(),
  organization: z.string().max(300).optional(),
  tags: z.array(z.string().max(50)).max(30).default([]),
  attachments: z.array(z.string().max(2000)).max(20).default([]),
  priority: z.enum(priorities).default("medium"),
  difficulty: z.enum(difficulties).default("medium"),
  visibility: z.enum(visibilities).default("private"),
  status: z.enum(statuses).default("draft"),
  notes: z.string().max(10000).optional(),
});

export const updateScriptSchema = createScriptSchema.partial();

export const createSectionSchema = z.object({
  scriptId: z.string().uuid(),
  title: z.string().min(1).max(500),
  content: z.any().default({ type: "doc", content: [] }),
  sortOrder: z.number().int().min(0),
  estimatedDurationSeconds: z.number().int().min(0).default(0),
  speakerNotes: z.any().optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.any().optional(),
  sortOrder: z.number().int().min(0).optional(),
  estimatedDurationSeconds: z.number().int().min(0).optional(),
  speakerNotes: z.any().optional(),
  wordCount: z.number().int().min(0).optional(),
});

export const reorderSectionsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  }),
);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).default("Mic"),
  color: z.string().max(20).default("#6C5CE7"),
  sortOrder: z.number().int().min(0).default(0),
  defaultTemplateId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createVersionSchema = z.object({
  scriptId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export const createPracticeSessionSchema = z.object({
  scriptId: z.string().uuid(),
  durationSeconds: z.number().int().min(0).default(0),
  confidence: z.number().int().min(1).max(10).default(5),
  mistakes: z.array(z.string().max(200)).max(20).default([]),
  voiceQuality: z.number().int().min(1).max(10).default(5),
  eyeContact: z.number().int().min(1).max(10).default(5),
  bodyLanguageNotes: z.string().max(5000).optional(),
  rating: z.number().int().min(1).max(10).default(5),
  improvements: z.string().max(5000).optional(),
  sectionsPracticed: z.array(z.string().max(200)).max(50).default([]),
});

export const createQuestionSchema = z.object({
  scriptId: z.string().uuid(),
  question: z.string().min(1).max(2000),
  suggestedAnswer: z.string().max(10000).optional(),
  difficulty: z.enum(questionDifficulties).default("medium"),
  confidence: z.number().int().min(1).max(10).default(5),
  status: z.enum(questionStatuses).default("needs_practice"),
});

export const updateQuestionSchema = z.object({
  question: z.string().min(1).max(2000).optional(),
  suggestedAnswer: z.string().max(10000).optional(),
  difficulty: z.enum(questionDifficulties).optional(),
  confidence: z.number().int().min(1).max(10).optional(),
  status: z.enum(questionStatuses).optional(),
});

export const createActionItemSchema = z.object({
  scriptId: z.string().uuid(),
  text: z.string().min(1).max(500),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateActionItemSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createChecklistItemSchema = z.object({
  scriptId: z.string().uuid(),
  text: z.string().min(1).max(500),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ── Types ──

export type CreateScriptParams = z.infer<typeof createScriptSchema>;
export type UpdateScriptParams = z.infer<typeof updateScriptSchema>;
export type CreateSectionParams = z.infer<typeof createSectionSchema>;
export type CreateCategoryParams = z.infer<typeof createCategorySchema>;
export type UpdateCategoryParams = z.infer<typeof updateCategorySchema>;
export type CreatePracticeSessionParams = z.infer<typeof createPracticeSessionSchema>;
export type CreateQuestionParams = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionParams = z.infer<typeof updateQuestionSchema>;
export type CreateActionItemParams = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemParams = z.infer<typeof updateActionItemSchema>;
export type CreateChecklistItemParams = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemParams = z.infer<typeof updateChecklistItemSchema>;

// ── Script ──

async function recalculateScriptCounts(scriptId: string) {
  const { totalWords, sectionCount, totalDuration } = await getScriptWordCount(scriptId);
  await updateScript(scriptId, "", {
    wordCount: totalWords,
    sectionCount,
    totalDurationSeconds: totalDuration,
  } as Partial<CreateScriptInput>);
}

export async function createNewScript(userId: string, params: CreateScriptParams) {
  const validated = createScriptSchema.parse(params);
  const input: CreateScriptInput = {
    userId,
    title: validated.title,
    subtitle: validated.subtitle ?? null,
    categoryId: validated.categoryId ?? null,
    purpose: validated.purpose ?? null,
    audience: validated.audience ?? null,
    venue: validated.venue ?? null,
    language: validated.language,
    eventDate: validated.eventDate ? new Date(validated.eventDate) : null,
    eventTime: validated.eventTime ?? null,
    expectedDuration: validated.expectedDuration ?? null,
    speaker: validated.speaker ?? null,
    organization: validated.organization ?? null,
    tags: validated.tags,
    attachments: validated.attachments,
    priority: validated.priority,
    difficulty: validated.difficulty,
    visibility: validated.visibility,
    status: validated.status,
    notes: validated.notes ?? null,
    wordCount: 0,
    sectionCount: 0,
    totalDurationSeconds: 0,
    isFavorite: false,
  };
  return createScript(input);
}

export async function getScripts(userId: string, filters: {
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
} = {}) {
  return getScriptsForUser(userId, filters);
}

export async function getScript(id: string, userId: string) {
  return getScriptById(id, userId);
}

export async function updateExistingScript(id: string, userId: string, params: UpdateScriptParams) {
  const validated = updateScriptSchema.parse(params);
  const { eventDate, ...rest } = validated;
  const input: Partial<CreateScriptInput> = {
    ...rest,
    eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : undefined,
  };
  return updateScript(id, userId, input);
}

export async function removeScript(id: string, userId: string) {
  return deleteScript(id, userId);
}

export async function getDashboard(userId: string) {
  const stats = await getScriptDashboardStats(userId);
  const upcoming = await getUpcomingScripts(userId);
  const recent = await getRecentScripts(userId);
  const favorites = await getFavoriteScripts(userId);
  const practiceStats = await getPracticeSessionStats(userId);
  const categories = await getCategoriesForUser(userId);

  return {
    ...stats,
    upcoming,
    recent,
    favorites,
    practiceStats,
    categories,
  };
}

// ── Sections ──

export async function addSection(params: CreateSectionParams) {
  const validated = createSectionSchema.parse(params);
  const wordCount = validated.content ? countWordsFromDoc(validated.content) : 0;
  const input: CreateScriptSectionInput = {
    scriptId: validated.scriptId,
    title: validated.title,
    content: validated.content ?? { type: "doc", content: [] },
    sortOrder: validated.sortOrder,
    wordCount,
    estimatedDurationSeconds: validated.estimatedDurationSeconds,
    speakerNotes: validated.speakerNotes ?? null,
  };
  const section = await createSection(input);
  await recalculateScriptCounts(validated.scriptId);
  return section;
}

export async function getSections(scriptId: string) {
  return getSectionsForScript(scriptId);
}

export async function getSection(id: string) {
  return getSectionById(id);
}

export async function modifySection(id: string, params: z.infer<typeof updateSectionSchema>) {
  const validated = updateSectionSchema.parse(params);
  const input: Partial<CreateScriptSectionInput> = { ...validated };
  if (validated.content) {
    input.wordCount = countWordsFromDoc(validated.content);
  }
  const section = await updateSection(id, input);
  if (section) {
    await recalculateScriptCounts(section.scriptId);
  }
  return section;
}

export async function removeSection(id: string) {
  const section = await getSectionById(id);
  if (!section) return null;
  const result = await deleteSection(id);
  if (result) {
    await recalculateScriptCounts(section.scriptId);
  }
  return result;
}

export async function reorderScriptSections(items: { id: string; sortOrder: number }[]) {
  const validated = reorderSectionsSchema.parse(items);
  await reorderSections(validated);
}

// ── Categories ──

export async function addCategory(userId: string | null, params: CreateCategoryParams) {
  const validated = createCategorySchema.parse(params);
  const input: CreateScriptCategoryInput = {
    userId,
    name: validated.name,
    icon: validated.icon,
    color: validated.color,
    sortOrder: validated.sortOrder,
    defaultTemplateId: validated.defaultTemplateId ?? null,
    isArchived: false,
  };
  return createScriptCategory(input);
}

export async function getCategories(userId: string) {
  return getCategoriesForUser(userId);
}

export async function modifyCategory(id: string, params: UpdateCategoryParams) {
  const validated = updateCategorySchema.parse(params);
  return updateScriptCategory(id, validated as Partial<CreateScriptCategoryInput>);
}

export async function removeCategory(id: string) {
  return deleteScriptCategory(id);
}

// ── Structure Templates ──

export async function getStructureTemplates(categoryId?: string) {
  if (categoryId) return getTemplatesForCategory(categoryId);
  return getAllTemplates();
}

// ── Versions ──

export async function saveVersion(scriptId: string, note?: string) {
  const sections = await getSectionsForScript(scriptId);
  const script = await getScriptById(scriptId, "");
  if (!script) return null;

  const data = {
    title: script.title,
    subtitle: script.subtitle,
    notes: script.notes,
    sections: sections.map((s) => ({
      title: s.title,
      content: s.content,
      sortOrder: s.sortOrder,
      speakerNotes: s.speakerNotes,
    })),
  };

  const input: CreateScriptVersionInput = {
    scriptId,
    data,
    note: note ?? null,
    wordCount: script.wordCount,
  };
  return createScriptVersion(input);
}

export async function getScriptVersions(scriptId: string) {
  return getVersionsForScript(scriptId);
}

export async function restoreVersion(versionId: string) {
  const version = await getVersionById(versionId);
  if (!version) return null;

  const data = version.data as any;
  if (!data) return null;

  await updateScript(version.scriptId, "", {
    title: data.title ?? "",
    subtitle: data.subtitle ?? null,
    notes: data.notes ?? null,
  } as Partial<CreateScriptInput>);

  const existingSections = await getSectionsForScript(version.scriptId);
  for (const section of existingSections) {
    await deleteSection(section.id);
  }

  if (data.sections && Array.isArray(data.sections)) {
    for (const section of data.sections) {
      await createSection({
        scriptId: version.scriptId,
        title: section.title,
        content: section.content ?? { type: "doc", content: [] },
        sortOrder: section.sortOrder,
        wordCount: section.content ? countWordsFromDoc(section.content) : 0,
        estimatedDurationSeconds: 0,
        speakerNotes: section.speakerNotes ?? null,
      });
    }
  }

  await recalculateScriptCounts(version.scriptId);
  return version;
}

// ── Practice Sessions ──

export async function addPracticeSession(userId: string, params: CreatePracticeSessionParams) {
  const validated = createPracticeSessionSchema.parse(params);
  const input: CreateScriptPracticeSessionInput = {
    userId,
    ...validated,
  };
  return createPracticeSession(input);
}

export async function getPracticeSessions(scriptId: string) {
  return getPracticeSessionsForScript(scriptId);
}

export async function getRecentPractice(userId: string, limit = 10) {
  return getRecentPracticeSessions(userId, limit);
}

// ── Questions ──

export async function addQuestion(params: CreateQuestionParams) {
  const validated = createQuestionSchema.parse(params);
  return createQuestion(validated as CreateScriptQuestionInput);
}

export async function getQuestions(scriptId: string) {
  return getQuestionsForScript(scriptId);
}

export async function modifyQuestion(id: string, params: UpdateQuestionParams) {
  const validated = updateQuestionSchema.parse(params);
  return updateQuestion(id, validated as Partial<CreateScriptQuestionInput>);
}

export async function removeQuestion(id: string) {
  return deleteQuestion(id);
}

// ── Action Items ──

export async function addActionItem(params: CreateActionItemParams) {
  const validated = createActionItemSchema.parse(params);
  return createActionItem(validated as CreateScriptActionItemInput);
}

export async function getActionItems(scriptId: string) {
  return getActionItemsForScript(scriptId);
}

export async function modifyActionItem(id: string, params: UpdateActionItemParams) {
  const validated = updateActionItemSchema.parse(params);
  return updateActionItem(id, validated as Partial<CreateScriptActionItemInput>);
}

export async function removeActionItem(id: string) {
  return deleteActionItem(id);
}

// ── Checklist Items ──

export async function addChecklistItem(params: CreateChecklistItemParams) {
  const validated = createChecklistItemSchema.parse(params);
  return createChecklistItem(validated as CreateScriptChecklistItemInput);
}

export async function getChecklistItems(scriptId: string) {
  return getChecklistItemsForScript(scriptId);
}

export async function modifyChecklistItem(id: string, params: UpdateChecklistItemParams) {
  const validated = updateChecklistItemSchema.parse(params);
  return updateChecklistItem(id, validated as Partial<CreateScriptChecklistItemInput>);
}

export async function removeChecklistItem(id: string) {
  return deleteChecklistItem(id);
}
