import { cache } from "react";
import { z } from "zod";
import {
  getAllSections,
  getSectionsByType,
  createSection,
  updateSection,
  softDeleteSection,
  getNextSortOrder,
  getSectionWordCount,
  getNextVersionNumber,
  createVersion,
  getVersions,
  getVersionById,
} from "./repository";

export const sectionTypes = [
  "about_me",
  "core_values",
  "life_principles",
  "strengths",
  "weaknesses",
  "long_term_vision",
  "rules",
  "boundaries",
  "energy_patterns",
  "work_style",
  "reflection_notes",
  "review_schedule",
] as const;

export type SectionType = (typeof sectionTypes)[number];

export const aboutMeSchema = z.object({
  fullName: z.string().default(""),
  personalMission: z.string().default(""),
  lifeMotto: z.string().default(""),
  biography: z.string().default(""),
  currentFocus: z.string().default(""),
  personalIdentityStatement: z.string().default(""),
});

export const coreValueSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  whyMatters: z.string().default(""),
  examples: z.string().default(""),
});

export const lifePrincipleSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
  category: z.string().default(""),
  isPinned: z.boolean().default(false),
});

export const strengthSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  examples: z.string().default(""),
  strategy: z.string().default(""),
});

export const weaknessSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  triggers: z.string().default(""),
  improvementStrategy: z.string().default(""),
});

export const longTermVisionSchema = z.object({
  career: z.string().default(""),
  health: z.string().default(""),
  finance: z.string().default(""),
  relationships: z.string().default(""),
  learning: z.string().default(""),
  lifestyle: z.string().default(""),
  personalGrowth: z.string().default(""),
  legacy: z.string().default(""),
});

export const ruleSchema = z.object({
  title: z.string().min(1),
  category: z.enum(["decision", "behavior", "boundary", "ritual"]).default("behavior"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  examples: z.string().default(""),
  notes: z.string().default(""),
});

export const boundarySchema = z.object({
  workingHours: z.string().default(""),
  communicationRules: z.string().default(""),
  availability: z.string().default(""),
  privacy: z.string().default(""),
  familyTime: z.string().default(""),
  restTime: z.string().default(""),
  socialMediaLimits: z.string().default(""),
  phoneUsage: z.string().default(""),
  notificationRules: z.string().default(""),
});

export const energyPatternSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  impact: z.enum(["booster", "drain"]).default("booster"),
  rating: z.number().int().min(1).max(10).default(5),
  frequency: z.string().default(""),
  notes: z.string().default(""),
});

export const workStyleSchema = z.object({
  bestWorkingHours: z.string().default(""),
  deepWorkDuration: z.string().default(""),
  preferredMeetingLength: z.string().default(""),
  communicationStyle: z.string().default(""),
  learningStyle: z.string().default(""),
  planningStyle: z.string().default(""),
  focusEnvironment: z.string().default(""),
  collaborationPreference: z.string().default(""),
  remoteOfficePreference: z.string().default(""),
  notes: z.string().default(""),
});

export const reflectionNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
});

export const reviewScheduleSchema = z.object({
  frequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  lastReviewDate: z.string().optional(),
  nextReviewDate: z.string().optional(),
});

export const sectionSchemas: Record<SectionType, z.ZodTypeAny> = {
  about_me: aboutMeSchema,
  core_values: coreValueSchema,
  life_principles: lifePrincipleSchema,
  strengths: strengthSchema,
  weaknesses: weaknessSchema,
  long_term_vision: longTermVisionSchema,
  rules: ruleSchema,
  boundaries: boundarySchema,
  energy_patterns: energyPatternSchema,
  work_style: workStyleSchema,
  reflection_notes: reflectionNoteSchema,
  review_schedule: reviewScheduleSchema,
};

export const singleRowSectionTypes: Set<SectionType> = new Set([
  "about_me",
  "long_term_vision",
  "boundaries",
  "work_style",
  "review_schedule",
]);

export function isSingleRow(sectionType: string): boolean {
  return singleRowSectionTypes.has(sectionType as SectionType);
}

import type { StrategySection } from "./repository";

export const getStrategy = cache(async (userId: string) => {
  return getAllSections(userId);
});

export async function getSections(userId: string, sectionType: string): Promise<StrategySection[]> {
  return getSectionsByType(userId, sectionType);
}

export async function createStrategySection(
  userId: string,
  sectionType: string,
  content: unknown,
  options?: { sortOrder?: number; isPinned?: boolean },
) {
  const schema = sectionSchemas[sectionType as SectionType];
  if (!schema) throw new Error(`Unknown section type: ${sectionType}`);

  const validated = schema.parse(content);

  if (isSingleRow(sectionType)) {
    const existing = await getSectionsByType(userId, sectionType);
    if (existing.length > 0) {
      const [row] = existing;
      const [updated] = await Promise.all([
        updateSection(row.id, userId, { content: validated }),
      ]);
      return updated;
    }
  }

  const sortOrder = options?.sortOrder ?? (await getNextSortOrder(userId, sectionType));
  return createSection({
    userId,
    sectionType,
    content: validated,
    sortOrder,
    isPinned: options?.isPinned ?? false,
  });
}

export async function updateStrategySection(id: string, userId: string, content: unknown, sectionType: string) {
  const schema = sectionSchemas[sectionType as SectionType];
  if (!schema) throw new Error(`Unknown section type: ${sectionType}`);

  const validated = schema.parse(content);
  return updateSection(id, userId, { content: validated });
}

export async function deleteStrategySection(id: string, userId: string) {
  return softDeleteSection(id, userId);
}

export async function saveManualVersion(userId: string, summary?: string) {
  const sections = await getAllSections(userId);
  const versionNumber = await getNextVersionNumber(userId);
  const wordCount = await getSectionWordCount(userId);

  const snapshot = sections.map((s) => ({
    sectionType: s.sectionType,
    content: s.content,
    sortOrder: s.sortOrder,
    isPinned: s.isPinned,
  }));

  return createVersion({ userId, versionNumber, snapshot, summary, wordCount });
}

export async function restoreVersion(userId: string, versionId: string) {
  const version = await getVersionById(versionId, userId);
  if (!version) return null;

  const snapshot = version.snapshot as Array<{
    sectionType: string;
    content: unknown;
    sortOrder: number;
    isPinned: boolean;
  }>;

  const current = await getAllSections(userId);

  await Promise.all(
    current.map((s) => softDeleteSection(s.id, userId)),
  );

  const created = await Promise.all(
    snapshot.map((item, i) =>
      createSection({
        userId,
        sectionType: item.sectionType,
        content: item.content,
        sortOrder: item.sortOrder ?? i,
        isPinned: item.isPinned ?? false,
      }),
    ),
  );

  return created;
}

export async function getManualVersions(userId: string) {
  return getVersions(userId);
}
