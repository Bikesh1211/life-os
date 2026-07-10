export const EXCUSE_TAGS = [
  "overslept",
  "procrastinated",
  "social-media",
  "gaming",
  "netflix",
  "poor-planning",
  "low-energy",
  "unexpected-work",
  "illness",
  "family-commitment",
  "weather",
  "forgot",
  "other",
] as const;

export const DISCIPLINE_LEVELS = [
  { level: 1, title: "Beginner", minScore: 0 },
  { level: 2, title: "Consistent", minScore: 30 },
  { level: 3, title: "Focused", minScore: 50 },
  { level: 4, title: "Disciplined", minScore: 65 },
  { level: 5, title: "Iron Mind", minScore: 78 },
  { level: 6, title: "Elite Performer", minScore: 88 },
  { level: 7, title: "Life Master", minScore: 95 },
] as const;

export const SCORE_WEIGHTS = {
  commitments: 0.30,
  habits: 0.15,
  tasks: 0.15,
  sleep: 0.10,
  exercise: 0.10,
  journaling: 0.10,
  goals: 0.10,
} as const;
