import { connectToDatabase } from "@/lib/mongodb";
import {
  FieldBlueprintModel,
  FieldRoadmapModel,
  FieldRoadmapPhaseModel,
  FieldRoadmapMilestoneModel,
  FieldRoadmapSkillModel,
  FieldRoadmapSkillEvidenceModel,
} from "@/lib/models/field-roadmap";

export type EvidenceEntityType = "knowledge_entry" | "career_project" | "interview_prep" | "roadmap_milestone";

type FieldBlueprint = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  phases: any[];
  skills: any[];
  createdAt: Date;
  updatedAt: Date;
};

type BlueprintPhase = any;
type BlueprintSkill = any;

type FieldRoadmapMilestone = {
  id: string;
  roadmapId: string;
  phaseId: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

/* ── Blueprints (reference data) ── */

export async function getBlueprints(): Promise<FieldBlueprint[]> {
  await connectToDatabase();
  const docs = await FieldBlueprintModel.find().sort({ createdAt: 1 }).lean();
  return toPlainArray(docs) as FieldBlueprint[];
}

export async function getBlueprintBySlug(slug: string) {
  await connectToDatabase();
  const doc = await FieldBlueprintModel.findOne({ slug }).lean();
  return toPlain(doc);
}

export async function getBlueprintById(id: string) {
  await connectToDatabase();
  const doc = await FieldBlueprintModel.findOne({ _id: id }).lean();
  return toPlain(doc);
}

export async function countBlueprints() {
  await connectToDatabase();
  return FieldBlueprintModel.countDocuments();
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
  await connectToDatabase();
  const doc = await FieldBlueprintModel.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        phases: input.phases,
        skills: input.skills,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true },
  ).lean();
  return toPlain(doc);
}

/* ── Roadmaps ── */

export async function getActiveRoadmap(userId: string) {
  await connectToDatabase();
  const doc = await FieldRoadmapModel.findOne({
    userId,
    isActive: true,
    deletedAt: null,
  }).lean();
  return toPlain(doc);
}

export async function getAllRoadmaps(userId: string) {
  await connectToDatabase();
  const docs = await FieldRoadmapModel.find({ userId, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getRoadmapById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await FieldRoadmapModel.findOne({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function createRoadmap(input: {
  userId: string;
  blueprintId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}) {
  await connectToDatabase();
  const doc = await FieldRoadmapModel.create(input);
  return toPlain(doc);
}

export async function setActiveRoadmap(id: string, userId: string) {
  await connectToDatabase();
  await FieldRoadmapModel.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false } },
  );
  const doc = await FieldRoadmapModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isActive: true, updatedAt: new Date() } },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteRoadmap(id: string, userId: string) {
  await connectToDatabase();
  const doc = await FieldRoadmapModel.findOneAndUpdate(
    { _id: id, userId },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

/* ── Phases ── */

export async function createPhases(inputs: Array<{ roadmapId: string; name: string; description?: string; sortOrder: number }>) {
  if (inputs.length === 0) return [];
  await connectToDatabase();
  const docs = await FieldRoadmapPhaseModel.insertMany(inputs);
  return toPlainArray(docs);
}

export async function getPhases(roadmapId: string) {
  await connectToDatabase();
  const docs = await FieldRoadmapPhaseModel.find({ roadmapId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
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
  await connectToDatabase();
  const docs = await FieldRoadmapMilestoneModel.insertMany(inputs);
  return toPlainArray(docs);
}

export async function getMilestones(roadmapId: string): Promise<FieldRoadmapMilestone[]> {
  await connectToDatabase();
  const docs = await FieldRoadmapMilestoneModel.find({ roadmapId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs) as FieldRoadmapMilestone[];
}

export async function setMilestoneCompleted(id: string, userId: string, completed: boolean) {
  await connectToDatabase();
  const roadmap = await FieldRoadmapModel.findOne({
    _id: undefined,
    userId,
    deletedAt: null,
  }).lean();
  if (!roadmap) return null;

  const doc = await FieldRoadmapMilestoneModel.findOneAndUpdate(
    { _id: id, roadmapId: roadmap.id },
    {
      isCompleted: completed,
      completedAt: completed ? new Date() : null,
    },
    { new: true },
  ).lean();
  return toPlain(doc);
}

/* ── Skills ── */

export async function createSkills(
  inputs: Array<{ roadmapId: string; name: string; description?: string; aliases: string[]; sortOrder: number }>,
) {
  if (inputs.length === 0) return [];
  await connectToDatabase();
  const docs = await FieldRoadmapSkillModel.insertMany(inputs);
  return toPlainArray(docs);
}

export async function getSkills(roadmapId: string) {
  await connectToDatabase();
  const docs = await FieldRoadmapSkillModel.find({ roadmapId })
    .sort({ sortOrder: 1 })
    .lean();
  return toPlainArray(docs);
}

export async function getSkillById(skillId: string, roadmapId: string) {
  await connectToDatabase();
  const doc = await FieldRoadmapSkillModel.findOne({ _id: skillId, roadmapId }).lean();
  return toPlain(doc);
}

/* ── Evidence ── */

export async function getEvidenceForSkills(skillIds: string[]) {
  if (skillIds.length === 0) return [];
  await connectToDatabase();
  const docs = await FieldRoadmapSkillEvidenceModel.find({ skillId: { $in: skillIds } }).lean();
  return toPlainArray(docs);
}

export async function addEvidence(input: { skillId: string; entityType: EvidenceEntityType; entityId: string }) {
  await connectToDatabase();
  const existing = await FieldRoadmapSkillEvidenceModel.findOne({
    skillId: input.skillId,
    entityType: input.entityType,
    entityId: input.entityId,
  }).lean();
  if (existing) return toPlain(existing);

  const doc = await FieldRoadmapSkillEvidenceModel.create(input);
  return toPlain(doc);
}

export async function removeEvidence(evidenceId: string, userId: string) {
  await connectToDatabase();
  const evidence = await FieldRoadmapSkillEvidenceModel.findOne({ _id: evidenceId }).lean();
  if (!evidence) return null;

  const skill = await FieldRoadmapSkillModel.findOne({ _id: evidence.skillId }).lean();
  if (!skill) return null;

  const roadmap = await FieldRoadmapModel.findOne({ _id: skill.roadmapId, userId }).lean();
  if (!roadmap) return null;

  const doc = await FieldRoadmapSkillEvidenceModel.findOneAndDelete({ _id: evidenceId }).lean();
  return toPlain(doc);
}
