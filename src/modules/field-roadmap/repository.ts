import { db } from "@/core/database";
import { and, asc, desc, eq, isNull, inArray, sql } from "drizzle-orm";
import {
  fieldBlueprints,
  fieldRoadmaps,
  fieldRoadmapPhases,
  fieldRoadmapMilestones,
  fieldRoadmapSkills,
  fieldRoadmapSkillEvidence,
  roadmapEvidenceTypeEnum,
} from "./schema";
import type {
  FieldBlueprint,
  FieldRoadmapMilestone,
  BlueprintPhase,
  BlueprintSkill,
} from "./schema";

export type EvidenceEntityType = typeof roadmapEvidenceTypeEnum.enumValues[number];

/* ── Blueprints (reference data) ── */

export async function getBlueprints(): Promise<FieldBlueprint[]> {
  return db.select().from(fieldBlueprints).orderBy(asc(fieldBlueprints.createdAt));
}

export async function getBlueprintBySlug(slug: string) {
  const [bp] = await db
    .select()
    .from(fieldBlueprints)
    .where(eq(fieldBlueprints.slug, slug))
    .limit(1);
  return bp ?? null;
}

export async function getBlueprintById(id: string) {
  const [bp] = await db
    .select()
    .from(fieldBlueprints)
    .where(eq(fieldBlueprints.id, id))
    .limit(1);
  return bp ?? null;
}

export async function countBlueprints() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(fieldBlueprints);
  return row?.count ?? 0;
}

export async function upsertBlueprint(input: {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  phases: BlueprintPhase[];
  skills: BlueprintSkill[];
}) {
  const [bp] = await db
    .insert(fieldBlueprints)
    .values(input)
    .onConflictDoUpdate({
      target: fieldBlueprints.slug,
      set: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        phases: input.phases,
        skills: input.skills,
      },
    })
    .returning();
  return bp;
}

/* ── Roadmaps ── */

export async function getActiveRoadmap(userId: string) {
  const [rm] = await db
    .select()
    .from(fieldRoadmaps)
    .where(
      and(
        eq(fieldRoadmaps.userId, userId),
        eq(fieldRoadmaps.isActive, true),
        isNull(fieldRoadmaps.deletedAt),
      ),
    )
    .limit(1);
  return rm ?? null;
}

export async function getAllRoadmaps(userId: string) {
  return db
    .select()
    .from(fieldRoadmaps)
    .where(and(eq(fieldRoadmaps.userId, userId), isNull(fieldRoadmaps.deletedAt)))
    .orderBy(desc(fieldRoadmaps.createdAt));
}

export async function getRoadmapById(id: string, userId: string) {
  const [rm] = await db
    .select()
    .from(fieldRoadmaps)
    .where(and(eq(fieldRoadmaps.id, id), eq(fieldRoadmaps.userId, userId)))
    .limit(1);
  return rm ?? null;
}

export async function createRoadmap(input: {
  userId: string;
  blueprintId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}) {
  const [rm] = await db.insert(fieldRoadmaps).values(input).returning();
  return rm;
}

export async function setActiveRoadmap(id: string, userId: string) {
  await db
    .update(fieldRoadmaps)
    .set({ isActive: false })
    .where(and(eq(fieldRoadmaps.userId, userId), eq(fieldRoadmaps.isActive, true)));
  return db
    .update(fieldRoadmaps)
    .set({ isActive: true, updatedAt: new Date() })
    .where(and(eq(fieldRoadmaps.id, id), eq(fieldRoadmaps.userId, userId)))
    .returning()
    .then((r) => r[0] ?? null);
}

export async function deleteRoadmap(id: string, userId: string) {
  const [rm] = await db
    .update(fieldRoadmaps)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(fieldRoadmaps.id, id), eq(fieldRoadmaps.userId, userId)))
    .returning();
  return rm ?? null;
}

/* ── Phases ── */

export async function createPhases(inputs: Array<{ roadmapId: string; name: string; description?: string; sortOrder: number }>) {
  if (inputs.length === 0) return [];
  const created = await db.insert(fieldRoadmapPhases).values(inputs).returning();
  return created;
}

export async function getPhases(roadmapId: string) {
  return db
    .select()
    .from(fieldRoadmapPhases)
    .where(eq(fieldRoadmapPhases.roadmapId, roadmapId))
    .orderBy(asc(fieldRoadmapPhases.sortOrder));
}

/* ── Milestones ── */

export async function createMilestones(
  inputs: Array<{
    roadmapId: string;
    phaseId: string;
    title: string;
    description?: string;
    sortOrder: number;
  }>,
) {
  if (inputs.length === 0) return [];
  return db.insert(fieldRoadmapMilestones).values(inputs).returning();
}

export async function getMilestones(roadmapId: string): Promise<FieldRoadmapMilestone[]> {
  const rows = await db
    .select()
    .from(fieldRoadmapMilestones)
    .where(eq(fieldRoadmapMilestones.roadmapId, roadmapId))
    .orderBy(asc(fieldRoadmapMilestones.sortOrder));
  return rows.map((r) => ({ ...r, completedAt: r.completedAt }));
}

export async function setMilestoneCompleted(id: string, userId: string, completed: boolean) {
  const [row] = await db
    .update(fieldRoadmapMilestones)
    .set({ isCompleted: completed, completedAt: completed ? new Date() : null })
    .where(
      and(
        eq(fieldRoadmapMilestones.id, id),
        inArray(
          fieldRoadmapMilestones.roadmapId,
          db
            .select({ id: fieldRoadmaps.id })
            .from(fieldRoadmaps)
            .where(and(eq(fieldRoadmaps.userId, userId), isNull(fieldRoadmaps.deletedAt))),
        ),
      ),
    )
    .returning();
  return row ?? null;
}

/* ── Skills ── */

export async function createSkills(
  inputs: Array<{ roadmapId: string; name: string; description?: string; aliases: string[]; sortOrder: number }>,
) {
  if (inputs.length === 0) return [];
  return db.insert(fieldRoadmapSkills).values(inputs).returning();
}

export async function getSkills(roadmapId: string) {
  return db
    .select()
    .from(fieldRoadmapSkills)
    .where(eq(fieldRoadmapSkills.roadmapId, roadmapId))
    .orderBy(asc(fieldRoadmapSkills.sortOrder));
}

export async function getSkillById(skillId: string, roadmapId: string) {
  const [skill] = await db
    .select()
    .from(fieldRoadmapSkills)
    .where(and(eq(fieldRoadmapSkills.id, skillId), eq(fieldRoadmapSkills.roadmapId, roadmapId)))
    .limit(1);
  return skill ?? null;
}

/* ── Evidence ── */

export async function getEvidenceForSkills(skillIds: string[]) {
  if (skillIds.length === 0) return [];
  return db
    .select()
    .from(fieldRoadmapSkillEvidence)
    .where(inArray(fieldRoadmapSkillEvidence.skillId, skillIds));
}

export async function addEvidence(input: { skillId: string; entityType: EvidenceEntityType; entityId: string }) {
  const [row] = await db.insert(fieldRoadmapSkillEvidence).values(input).onConflictDoNothing().returning();
  return row ?? null;
}

export async function removeEvidence(evidenceId: string, userId: string) {
  const [row] = await db
    .delete(fieldRoadmapSkillEvidence)
    .where(
      and(
        eq(fieldRoadmapSkillEvidence.id, evidenceId),
        inArray(
          fieldRoadmapSkillEvidence.skillId,
          db
            .select({ id: fieldRoadmapSkills.id })
            .from(fieldRoadmapSkills)
            .innerJoin(fieldRoadmaps, eq(fieldRoadmapSkills.roadmapId, fieldRoadmaps.id))
            .where(eq(fieldRoadmaps.userId, userId)),
        ),
      ),
    )
    .returning();
  return row ?? null;
}