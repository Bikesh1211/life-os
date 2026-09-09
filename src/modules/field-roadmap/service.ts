import { z } from "zod";
import * as repo from "./repository";

type BlueprintPhase = {
  name: string;
  description: string;
  milestones: { title: string; description: string }[];
};

type BlueprintSkill = {
  name: string;
  description?: string;
  aliases?: string[];
};

/* ── Zod schemas ── */

export const pickFieldSchema = z.object({
  slug: z.string().min(1),
});

export const toggleMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  completed: z.boolean(),
});

export const addEvidenceSchema = z.object({
  skillId: z.string().uuid(),
  entityType: z.enum(["knowledge_entry", "interview_prep", "portfolio_project", "milestone"]),
  entityId: z.string().min(1),
});

export const removeEvidenceSchema = z.object({
  evidenceId: z.string().uuid(),
});

/* ── Blueprint seeds (reference data) ── */

type BlueprintSeed = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  phases: BlueprintPhase[];
  skills: BlueprintSkill[];
};

export const BLUEPRINT_SEEDS: BlueprintSeed[] = [
  {
    slug: "software-engineer",
    name: "Software Engineer",
    description: "From first job to staff/principal engineer. Covers core engineering skill, interviews, systems, and leadership.",
    icon: "code",
    color: "#3b82f6",
    phases: [
      {
        name: "Foundation",
        description: "Core CS + tooling every engineer needs before they can be productive.",
        milestones: [
          { title: "Master a programming language", description: "Be comfortable writing production-quality code in one language." },
          { title: "Learn Git & GitHub workflows", description: "Branches, PRs, code review, rebasing, CI basics." },
          { title: "Understand data structures & algorithms", description: "Arrays, hash maps, trees, graphs, big-O analysis." },
          { title: "Ship your first side project", description: "A small end-to-end app deployed publicly." },
        ],
      },
      {
        name: "Employable",
        description: "Pass interviews and get the first role.",
        milestones: [
          { title: "Build a portfolio of 2-3 projects", description: "Quality over quantity; each solves a real problem." },
          { title: "Complete DSA practice (100+ problems)", description: "Pattern-based practice across all major categories." },
          { title: "Crack the coding interview", description: "Consistent performance under time pressure." },
          { title: "Ace a system design interview", description: "Basic load-balancer → DB → cache design patterns." },
          { title: "Land the first job offer", description: "Complete applications, resume, and a final-round loop." },
        ],
      },
      {
        name: "Proficient",
        description: "Reliable, shipping, and trusted in the codebase.",
        milestones: [
          { title: "Own a production feature end-to-end", description: "Design, implement, test, deploy, monitor." },
          { title: "Write effective automated tests", description: "Unit, integration, and E2E coverage that prevents regressions." },
          { title: "Mentor a junior engineer", description: "Review their code and guide a task to completion." },
          { title: "Contribute to architecture decisions", description: "Participate in design docs and tech reviews." },
        ],
      },
      {
        name: "Senior",
        description: "Impact beyond your team. Interviews for senior roles demand depth + breadth.",
        milestones: [
          { title: "Lead a cross-team project", description: "Coordinate dependencies across teams to deliver." },
          { title: "Pass senior-level interviews", description: "System design with scale, behavioral leadership stories." },
          { title: "Improve team velocity measurably", description: "Tooling, process, or platform work with data." },
          { title: "Be a go-to expert on a domain", description: "Others seek you out for a specific area of the stack." },
        ],
      },
      {
        name: "Leader / Staff",
        description: "Shape technical direction beyond a single team.",
        milestones: [
          { title: "Write an impactful technical design doc", description: "Adopted by multiple teams." },
          { title: "Drive a platform-level initiative", description: "Improves the entire engineering org." },
          { title: "Staff-level system design mastery", description: "Global architecture, tradeoffs, ambiguity handling." },
          { title: "Develop future technical leaders", description: "Direct mentorship pipeline that produces seniors." },
        ],
      },
    ],
    skills: [
      { name: "Data Structures & Algorithms", aliases: ["dsa", "algorithms", "leetcode", "coding problems"] },
      { name: "System Design", aliases: ["architecture", "scalability", "distributed systems"] },
      { name: "Programming Fundamentals", aliases: ["language", "code", "coding"] },
      { name: "Databases & SQL", aliases: ["sql", "postgres", "database", "queries"] },
      { name: "Testing & Quality", aliases: ["testing", "unit test", "integration", "qa"] },
      { name: "Version Control & CI/CD", aliases: ["git", "github", "ci", "cd", "deployment"] },
      { name: "Software Architecture", aliases: ["architecture", "design patterns", "microservices"] },
      { name: "Communication & Collaboration", aliases: ["communication", "mentoring", "code review", "leadership"] },
    ],
  },
  {
    slug: "doctor",
    name: "Doctor",
    description: "From medical school to consultant and beyond.",
    icon: "stethoscope",
    color: "#10b981",
    phases: [
      {
        name: "Foundation",
        description: "Pre-clinical knowledge and clinical skills groundwork.",
        milestones: [
          { title: "Master anatomy & physiology", description: "Systems-level understanding of the body." },
          { title: "Build strong pharmacology fundamentals", description: "Mechanisms, interactions, and prescribing basics." },
          { title: "Develop clinical reasoning", description: "Synthesize history + exam + data into differentials." },
          { title: "Pass foundational exams", description: "Board-style readiness in core subjects." },
        ],
      },
      {
        name: "Clinical Training",
        description: "Rotations, clerkships, and hands-on patient care.",
        milestones: [
          { title: "Complete core clinical rotations", description: "Medicine, surgery, pediatrics, OB/GYN, psych, family." },
          { title: "Master the patient interview", description: "Structured history-taking under time pressure." },
          { title: "Perform basic procedures competently", description: "IVs, suturing, lumbar puncture, and more by specialty." },
          { title: "Present cases clearly on rounds", description: "Concise, structured, evidence-backed presentations." },
        ],
      },
      {
        name: "Residency",
        description: "Specialty training with progressive responsibility.",
        milestones: [
          { title: "Complete residency core competencies", description: "Milestones set by the specialty board." },
          { title: "Manage acute emergencies independently", description: "Stable-to-unstable patient management." },
          { title: "Pass board/registry exams", description: "Specialty board certification readiness." },
          { title: "Publish or present research", description: "Contribute to the specialty's knowledge base." },
        ],
      },
      {
        name: "Specialist",
        description: "Independent practice in a specialty.",
        milestones: [
          { title: "Achieve board certification", description: "Pass the specialty board exam." },
          { title: "Build a referral network", description: "Colleagues and other specialties send patients your way." },
          { title: "Develop a niche expertise", description: "A subspecialty that differentiates you." },
          { title: "Lead a clinical team", description: "Residents, fellows, and allied staff." },
        ],
      },
      {
        name: "Consultant / Lead",
        description: "Shape care delivery and train the next generation.",
        milestones: [
          { title: "Direct a department or program", description: "Clinical + administrative leadership." },
          { title: "Publish consistently in your field", description: "Peer-reviewed contributions." },
          { title: "Mentor residents and fellows", description: "Produce independent practitioners." },
          { title: "Influence clinical guidelines", description: "Committee work or protocol authorship." },
        ],
      },
    ],
    skills: [
      { name: "Clinical Reasoning", aliases: ["diagnosis", "differential", "clinical"] },
      { name: "Anatomy & Physiology", aliases: ["anatomy", "physiology", "pathology"] },
      { name: "Pharmacology", aliases: ["drugs", "medication", "prescribing"] },
      { name: "Patient Communication", aliases: ["communication", "bedside", "history taking"] },
      { name: "Emergency Management", aliases: ["emergency", "resuscitation", "acute"] },
      { name: "Evidence-Based Medicine", aliases: ["research", "trials", "ebm", "literature"] },
      { name: "Procedural Skills", aliases: ["procedures", "surgery", "technique"] },
      { name: "Leadership & Teaching", aliases: ["mentoring", "teaching", "leadership", "rounds"] },
    ],
  },
  {
    slug: "teacher",
    name: "Teacher",
    description: "From new teacher to master educator and instructional leader.",
    icon: "chalkboard",
    color: "#f59e0b",
    phases: [
      {
        name: "Foundation",
        description: "Core pedagogy and classroom survival skills.",
        milestones: [
          { title: "Master lesson planning", description: "Objective, activity, assessment aligned per lesson." },
          { title: "Establish classroom management", description: "Consistent routines, expectations, and rapport." },
          { title: "Know your subject deeply", description: "Beyond the textbook; anticipate misconceptions." },
          { title: "Understand learning theory", description: "Cognitive load, active recall, and motivation." },
        ],
      },
      {
        name: "Certified & Effective",
        description: "Reliable daily instruction that moves student outcomes.",
        milestones: [
          { title: "Get certified / licensed", description: "Credential required to teach in your system." },
          { title: "Differentiate instruction", description: "Meet a range of student needs in one room." },
          { title: "Design effective assessments", description: "Formative and summative that inform teaching." },
          { title: "Improve student results measurably", description: "Data shows growth over a term." },
        ],
      },
      {
        name: "Proficient",
        description: "Consistently high-quality practice, respected by peers.",
        milestones: [
          { title: "Lead a professional learning community", description: "Facilitate colleagues' growth." },
          { title: "Integrate technology meaningfully", description: "EdTech that amplifies learning, not distraction." },
          { title: "Support struggling students at scale", description: "Interventions with documented outcomes." },
          { title: "Share practice publicly", description: "Open classroom, blog, or conference session." },
        ],
      },
      {
        name: "Master",
        description: "A model practitioner with influence beyond one classroom.",
        milestones: [
          { title: "Mentor new teachers", description: "Structured induction support." },
          { title: "Design curriculum", description: "Scope, sequence, and materials for a course." },
          { title: "Earn advanced certification", description: "National board or equivalent." },
          { title: "Lead school-wide initiatives", description: "Curriculum, assessment, or culture programs." },
        ],
      },
      {
        name: "Instructional Leader",
        description: "Shape teaching and learning at the system level.",
        milestones: [
          { title: "Coach teachers at scale", description: "Observation, feedback, and growth cycles." },
          { title: "Drive data-informed school improvement", description: "Outcomes across a grade, school, or district." },
          { title: "Publish on pedagogy", description: "Articles, books, or influential talks." },
          { title: "Develop future teacher-leaders", description: "A pipeline of effective practitioners." },
        ],
      },
    ],
    skills: [
      { name: "Pedagogy & Learning Theory", aliases: ["pedagogy", "learning", "teaching methods", "cognitive science"] },
      { name: "Classroom Management", aliases: ["classroom", "behavior", "routines"] },
      { name: "Lesson Planning", aliases: ["lesson", "planning", "curriculum"] },
      { name: "Assessment Design", aliases: ["assessment", "grading", "evaluation", "tests"] },
      { name: "Subject Mastery", aliases: ["subject", "content", "discipline"] },
      { name: "Differentiation & Inclusion", aliases: ["differentiation", "inclusion", "special education", "remediation"] },
      { name: "Educational Technology", aliases: ["edtech", "technology", "digital tools"] },
      { name: "Mentoring & Leadership", aliases: ["mentoring", "coaching", "leadership", "plc"] },
    ],
  },
];

/* ── Seed ── */

export async function ensureBlueprintSeeds() {
  if ((await repo.countBlueprints()) > 0) return;
  for (const seed of BLUEPRINT_SEEDS) {
    await repo.upsertBlueprint(seed);
  }
}

/* ── Pick field / clone blueprint ── */

export async function pickField(userId: string, slug: string) {
  await ensureBlueprintSeeds();
  const bp = await repo.getBlueprintBySlug(slug);
  if (!bp) throw new Error("Unknown field");

  const existing = await repo.getActiveRoadmap(userId);
  if (existing && existing.blueprintId === bp.id) return existing;

  const phases = (bp.phases as unknown as BlueprintPhase[]) ?? [];
  const skills = (bp.skills as unknown as BlueprintSkill[]) ?? [];

  const roadmap = await repo.createRoadmap({
    userId,
    blueprintId: bp.id,
    name: bp.name,
    description: bp.description,
    icon: bp.icon,
    color: bp.color,
  });

  if (phases.length > 0) {
    const createdPhases = await repo.createPhases(
      phases.map((p: any, i: number) => ({
        roadmapId: roadmap.id,
        name: p.name,
        description: p.description,
        sortOrder: i,
      })),
    );

    const milestoneInputs = phases.flatMap((p: any, pi: number) =>
      (p.milestones ?? []).map((m: any, mi: number) => ({
        roadmapId: roadmap.id,
        phaseId: createdPhases[pi].id,
        title: m.title,
        description: m.description,
        sortOrder: mi,
      })),
    );
    if (milestoneInputs.length > 0) await repo.createMilestones(milestoneInputs);
  }

  if (skills.length > 0) {
    await repo.createSkills(
      skills.map((s, i) => ({
        roadmapId: roadmap.id,
        name: s.name,
        description: s.description,
        aliases: s.aliases ?? [],
        sortOrder: i,
      })),
    );
  }

  return roadmap;
}

/* ── Dashboard / readiness ── */

type Evidence = {
  id: string;
  entityType: string;
  entityId: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Skill proficiency is computed on-read from confirmed evidence only.
 * Each evidence source carries a strength:
 *  - knowledge_entry → masteryLevel (1-10)
 *  - interview_prep → confidenceLevel (1-10), halved unless completed
 *  - portfolio_project → 8 (a real artifact is strong evidence)
 *  - milestone → 10 (a completed roadmap milestone is the strongest signal)
 */
export function computeSkillProficiency(evidence: Evidence[], sources: Record<string, number>): number {
  if (evidence.length === 0) return 0;
  let total = 0;
  for (const ev of evidence) {
    total += sources[ev.id] ?? 0;
  }
  return Math.round(clamp(total / evidence.length, 0, 10));
}

export async function getDashboard(userId: string) {
  await ensureBlueprintSeeds();
  const roadmap = await repo.getActiveRoadmap(userId);
  if (!roadmap) {
    return { roadmap: null, blueprints: await repo.getBlueprints() };
  }

  const [phases, milestones, skills] = await Promise.all([
    repo.getPhases(roadmap.id),
    repo.getMilestones(roadmap.id),
    repo.getSkills(roadmap.id),
  ]);

  const evidenceBySkill = await loadEvidenceBySkill(skills.map((s) => s.id));
  const sources = await buildEvidenceSources(userId, evidenceBySkill);

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const milestoneProgress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  const skillProficiencies = skills.map((skill) => {
    const evidence = evidenceBySkill[skill.id] ?? [];
    const proficiency = computeSkillProficiency(evidence, sources);
    return { skill, proficiency, evidenceCount: evidence.length };
  });

  const avgProficiency = skillProficiencies.length > 0
    ? skillProficiencies.reduce((sum, s) => sum + s.proficiency, 0) / skillProficiencies.length
    : 0;

  // Readiness = 70% average proficiency, 30% milestone progress.
  const readiness = Math.round(clamp(avgProficiency * 7 + milestoneProgress * 0.3, 0, 100));

  // Current phase = first phase with an incomplete milestone.
  const milestonesByPhase = new Map<string, typeof milestones>();
  for (const m of milestones) {
    const list = milestonesByPhase.get(m.phaseId) ?? [];
    list.push(m);
    milestonesByPhase.set(m.phaseId, list);
  }
  const currentPhase = phases.find((p) => {
    const list = milestonesByPhase.get(p.id) ?? [];
    return list.some((m) => !m.isCompleted);
  });

  // Next step: the most evidence-starved incomplete skill in the current phase's roadmap.
  const raiser = findRaiser(skills, skillProficiencies, milestones);

  return {
    roadmap: {
      ...roadmap,
      phases: phases.map((p) => ({
        ...p,
        milestones: milestonesByPhase.get(p.id) ?? [],
      })),
      skills: skillProficiencies,
      progress: {
        milestoneProgress,
        completedCount,
        totalCount: milestones.length,
        avgProficiency,
        readiness,
      },
      currentPhaseId: currentPhase?.id ?? null,
    },
    raiser,
    blueprints: [],
  };
}

function findRaiser(
  skills: Awaited<ReturnType<typeof repo.getSkills>>,
  proficiencies: Array<{ skill: { id: string }; proficiency: number; evidenceCount: number }>,
  milestones: Awaited<ReturnType<typeof repo.getMilestones>>,
) {
  const completed = new Set(milestones.filter((m) => m.isCompleted).map((m) => m.title));
  const remaining = skills.filter((s) => !completed.has(s.name));
  if (remaining.length === 0) return null;
  const target = remaining.sort(
    (a, b) => proficiencies.find((p) => p.skill.id === a.id)!.proficiency - proficiencies.find((p) => p.skill.id === b.id)!.proficiency,
  )[0];
  const prof = proficiencies.find((p) => p.skill.id === target.id)!;
  return { skillId: target.id, skillName: target.name, proficiency: prof.proficiency };
}

/* ── Evidence loading ── */

async function loadEvidenceBySkill(skillIds: string[]): Promise<Record<string, Evidence[]>> {
  const rows = await repo.getEvidenceForSkills(skillIds);
  const map: Record<string, Evidence[]> = {};
  for (const row of rows) {
    (map[row.skillId] ??= []).push({
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
    });
  }
  return map;
}

/**
 * Builds a per-evidence strength map by reading each source through the owning
 * plugin's service layer. Returns { [evidenceId]: strength (1-10) }.
 */
async function buildEvidenceSources(userId: string, evidenceBySkill: Record<string, Evidence[]>): Promise<Record<string, number>> {
  const all = Object.values(evidenceBySkill).flat();
  if (all.length === 0) return {};

  const knowledgeIds = all.filter((e: any) => e.entityType === "knowledge_entry").map((e: any) => e.entityId);
  const prepIds = all.filter((e: any) => e.entityType === "interview_prep").map((e: any) => e.entityId);
  const projectIds = all.filter((e: any) => e.entityType === "portfolio_project").map((e: any) => e.entityId);

  const sources: Record<string, number> = {};

  if (knowledgeIds.length > 0) {
    const { getKnowledgeEntries } = await import("@/modules/knowledge");
    const entries = await getKnowledgeEntries(userId);
    for (const ev of all.filter((e: any) => e.entityType === "knowledge_entry")) {
      const entry = entries.find((x: any) => x.id === ev.entityId);
      sources[ev.id] = entry?.masteryLevel ?? 0;
    }
  }

  if (prepIds.length > 0) {
    const { getInterviewPrepItems } = await import("@/modules/career");
    const items = await getInterviewPrepItems(userId);
    for (const ev of all.filter((e: any) => e.entityType === "interview_prep")) {
      const item = items.find((x: any) => x.id === ev.entityId);
      if (!item) continue;
      const isCompleted = item.completionStatus === "completed" || item.completionStatus === "mastered";
      sources[ev.id] = isCompleted ? (item.confidenceLevel ?? 5) : Math.round((item.confidenceLevel ?? 5) / 2);
    }
  }

  if (projectIds.length > 0) {
    const { getProjects } = await import("@/modules/career");
    const projects = await getProjects(userId);
    for (const ev of all.filter((e: any) => e.entityType === "portfolio_project")) {
      if (projects.some((x: any) => x.id === ev.entityId)) sources[ev.id] = 8;
    }
  }

  for (const ev of all.filter((e: any) => e.entityType === "milestone")) {
    // milestone evidence strength is resolved by the caller from completed state;
    // default to 10 when present (already confirmed by the user).
    sources[ev.id] = 10;
  }

  return sources;
}

/* ── Find evidence suggestions (rule-based, no LLM) ── */

type Suggestion = {
  entityType: string;
  entityId: string;
  label: string;
  match: string;
  strength: number;
};

export async function findEvidenceSuggestions(userId: string, skillId: string, roadmapId: string) {
  const skill = await repo.getSkillById(skillId, roadmapId);
  if (!skill) return [];

  const keywords = [skill.name, ...skill.aliases]
    .map((k) => k.toLowerCase())
    .filter((k) => k.length > 0);

  const suggestions: Suggestion[] = [];

  const { getKnowledgeEntries } = await import("@/modules/knowledge");
  const entries = await getKnowledgeEntries(userId);
  for (const entry of entries) {
    const haystack = [entry.title, entry.subject, ...(entry.tags ?? [])].join(" ").toLowerCase();
    const matched = keywords.find((k) => haystack.includes(k));
    if (matched) {
      suggestions.push({
        entityType: "knowledge_entry",
        entityId: entry.id,
        label: entry.title,
        match: `Matches "${matched}" in ${entry.subject}`,
        strength: entry.masteryLevel ?? 5,
      });
    }
  }

  const { getInterviewPrepItems } = await import("@/modules/career");
  const prepItems = await getInterviewPrepItems(userId);
  for (const item of prepItems) {
    const haystack = [item.question, ...(item.tags ?? [])].join(" ").toLowerCase();
    const matched = keywords.find((k) => haystack.includes(k));
    if (matched) {
      suggestions.push({
        entityType: "interview_prep",
        entityId: item.id,
        label: item.question,
        match: `Matches "${matched}" in interview prep`,
        strength: (item.completionStatus === "completed" || item.completionStatus === "mastered") ? (item.confidenceLevel ?? 5) : Math.round((item.confidenceLevel ?? 5) / 2),
      });
    }
  }

  const { getProjects } = await import("@/modules/career");
  const projects = await getProjects(userId);
  for (const project of projects) {
    const haystack = [project.name, project.description ?? "", ...(project.technologies ?? [])].join(" ").toLowerCase();
    const matched = keywords.find((k) => haystack.includes(k));
    if (matched) {
      suggestions.push({
        entityType: "portfolio_project",
        entityId: project.id,
        label: project.name,
        match: `Matches "${matched}" in a portfolio project`,
        strength: 8,
      });
    }
  }

  return suggestions.slice(0, 20);
}

/* ── Evidence CRUD (all user-confirmed) ── */

export async function addSkillEvidence(userId: string, input: z.infer<typeof addEvidenceSchema>) {
  const roadmap = await repo.getActiveRoadmap(userId);
  if (!roadmap) throw new Error("No active roadmap");
  const skill = await repo.getSkillById(input.skillId, roadmap.id);
  if (!skill) throw new Error("Unknown skill");
  return repo.addEvidence({
    skillId: input.skillId,
    entityType: input.entityType as any,
    entityId: input.entityId,
  });
}

export async function removeSkillEvidence(userId: string, evidenceId: string) {
  return repo.removeEvidence(evidenceId, userId);
}

export async function toggleMilestone(userId: string, milestoneId: string, completed: boolean) {
  return repo.setMilestoneCompleted(milestoneId, userId, completed);
}
