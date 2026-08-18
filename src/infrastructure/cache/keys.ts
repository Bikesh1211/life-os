/**
 * The one place query keys are built.
 *
 * TanStack Query deduplicates by the exact `queryKey`, so two components that
 * fetch the same thing must build the same key. Hand-rolling strings in 114
 * hook files means a refactor (or one component using `/api/tasks` while
 * another uses `/api/tasks?page=1`) silently forks the cache and doubles the
 * request. Every key is scoped by the current user in the components that
 * call these, so no key here can leak one user's data into another's cache.
 *
 * Keep the shapes flat and stable: a key that changes shape invalidates
 * everything below it.
 */
export const cacheKeys = {
  /** Current user's session identity (Clerk/Supabase). */
  session: ["session"] as const,

  /** The user's full auth user object. */
  user: ["user"] as const,

  gamification: {
    profile: ["gamification", "profile"] as const,
  },

  timeline: {
    today: ["timeline", "today"] as const,
    events: (params: Record<string, unknown>) => ["timeline", "events", params] as const,
  },

  tasks: {
    all: ["tasks"] as const,
    list: (filters: Record<string, unknown>) => ["tasks", "list", filters] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    projects: ["tasks", "projects"] as const,
    labels: ["tasks", "labels"] as const,
    stats: (filters: Record<string, unknown>) => ["tasks", "stats", filters] as const,
  },

  habits: {
    all: ["habits"] as const,
    detail: (id: string) => ["habits", "detail", id] as const,
    summary: ["habits", "summary"] as const,
    analytics: (params: Record<string, unknown>) => ["habits", "analytics", params] as const,
  },

  dashboard: {
    overview: ["dashboard", "overview"] as const,
  },
} as const;