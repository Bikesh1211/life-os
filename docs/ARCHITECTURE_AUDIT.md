# Life OS — Architecture & Production Readiness Audit

**Date:** 2026-07-29 · **Branch:** `v0.0.4` · **Cycle:** 1

Scope inspected: 1,304 files / 118,849 LOC · 349 API routes · 179 pages · 28 feature modules · 290 tables · 48 migrations.

Every finding below was verified against the codebase. Measurements were taken by running `tsc`, `eslint`, and `next build` on this branch.

---

## 1. Executive Summary

**Overall architecture score: 6.5 / 10** — a well-layered foundation carrying a systemic authorization defect.

This is not a codebase that needs rewriting. The module boundary (`modules/<feature>/{schema,repository,service,index}.ts`) is genuinely well-designed and consistently applied across 28 modules — better layering than most projects at this scale. Server components fetch in parallel and hand data to client shells, which is the correct App Router pattern. TypeScript passes `strict` with zero errors.

What holds it back is one structural decision and its consequences:

> **All database access uses a direct PostgreSQL connection through Drizzle, so Supabase Row Level Security is bypassed entirely — and no RLS policies exist anyway. Tenant isolation rests 100% on every one of ~800 repository functions remembering to filter by `user_id`.**

That bet does not pay off. Auditing the repository layer found **18 endpoints across 5 modules where the filter was missing**, allowing any authenticated user to read, modify, or delete other users' data. These are fixed in this cycle. But the same class of bug will recur, because nothing structural prevents it.

Secondary themes: no tests at all, `pnpm lint` was completely broken (so ~1,480 code-quality issues were invisible), no error monitoring, and 11 MB of client JavaScript.

### Scores by area

| Area | Score | Note |
|---|---|---|
| Module structure & layering | 8.5 | Genuine strength; consistent and readable |
| TypeScript rigour | 7 | `strict` clean, but 409 `any` in 164 files |
| Next.js / RSC usage | 7.5 | Correct server-fetch pattern; 88% client components |
| API design | 6.5 | Uniform shape, but validation and errors are inconsistent |
| Database schema | 6 | Good normalisation; 14 of 28 modules have no indexes |
| **Authorization / RLS** | **2.5** | **No RLS; 18 confirmed IDORs** |
| Auth flow | 7 | Solid `@supabase/ssr` usage; open-redirect now fixed |
| Performance / bundle | 5 | 11 MB JS, 82 render-loop violations |
| Accessibility | 3 | 20 ARIA attributes across 705 components |
| Testing | 0 | Zero test files |
| Observability | 2 | `logger` defined but never imported; 63 `console.*` |
| DX / tooling | 4 | Lint broken until this cycle; no CI |

---

## 2. High-Priority Issues Affecting Production

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | 18 IDOR endpoints — cross-tenant read/write/delete | **Critical** | ✅ Fixed |
| 2 | No RLS policies on 290 tables; RLS bypassed by design | **Critical** | ⚠️ Roadmap — needs a decision |
| 3 | `pnpm lint` non-functional; 1,481 issues invisible | **High** | ✅ Fixed |
| 4 | Zero automated tests | **High** | ⚠️ Roadmap |
| 5 | Open redirect in OAuth callback | **High** | ✅ Fixed |
| 6 | Server pages rendered empty instead of redirecting when unauthenticated | **High** | ✅ Fixed |
| 7 | Debug endpoints shipped to production | **High** | ✅ Fixed |
| 8 | 82 `setState`-in-effect render loops | **High** | ⚠️ Roadmap |
| 9 | No error tracking or structured logging | **High** | ⚠️ Roadmap |
| 10 | 14 of 28 modules have zero indexes | **Medium** | ⚠️ Roadmap |
| 11 | 11 MB client JS; 324 KB chunks duplicated | **Medium** | ⚠️ Roadmap |
| 12 | Connection pool `max: 10` incompatible with serverless | **Medium** | ⚠️ Roadmap |

---

## 3. Security Vulnerabilities

### 3.1 Broken access control on nested resources — **Critical, fixed**

**Why it is a problem.** Routes authenticated the caller, then passed a user-supplied child-resource UUID straight to a query that filtered on that UUID alone. Authentication proves *who you are*; it does not prove the row is *yours*. Since RLS is bypassed, the missing `WHERE user_id = ...` was the only thing standing between tenants.

The worst case needed no setup at all:

```ts
// src/app/api/goals/[id]/milestones/[milestoneId]/route.ts — BEFORE
const userId = await getCurrentUserId();
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const { milestoneId } = await params;          // [id] (the goal) is never used
const milestone = await deleteMilestone(milestoneId);
```

```ts
// src/modules/goals/repository.ts — BEFORE
export async function deleteMilestone(milestoneId: string) {
  return db.delete(goalMilestones).where(eq(goalMilestones.id, milestoneId)).returning();
}
```

`DELETE /api/goals/<any-goal-id>/milestones/<victim-milestone-id>` deleted any milestone in the database. The goal id in the path was captured and discarded.

The books and scripts routes were one step harder but equally exploitable: they verified the *parent* named in the URL belonged to the caller, then accepted an unrelated child id. Owning a single book granted write access to every user's chapters:

```
PUT /api/books/<my-book>/chapters/<victim-chapter-id>   → overwrites the victim's chapter
PUT /api/books/<my-book>/collaborators/<any-collab-id>  → privilege escalation on any book
```

**The fix.** Ownership is now asserted inside the same SQL statement as the read or write, via a subquery. Doing it as a separate `SELECT` first would leave a check-then-use window and cost an extra round trip:

```ts
// src/modules/goals/repository.ts — AFTER
function ownedByUser(userId: string) {
  return inArray(
    goalMilestones.goalId,
    db.select({ id: goals.id }).from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt))),
  );
}

export async function deleteMilestone(milestoneId: string, userId: string) {
  const result = await db
    .delete(goalMilestones)
    .where(and(eq(goalMilestones.id, milestoneId), ownedByUser(userId)))
    .returning();
  return result[0] ?? null;
}
```

The caller already treats `null` as 404, so behaviour for legitimate users is unchanged — a foreign id now returns 404 instead of succeeding.

**Full list of endpoints fixed:**

| Module | Endpoints | Impact |
|---|---|---|
| goals | milestones GET / PUT / DELETE | Read, modify, delete any milestone — **no preconditions** |
| books | chapter GET / PUT / DELETE, versions list + save + restore, comments list, collaborator PUT / DELETE | Overwrite any chapter; **privilege escalation** via collaborator role |
| scripts | section GET / PUT / DELETE, action items, questions, checklist, version restore | Read and modify any script's contents |
| music | collection item add / remove | Inject into or delete from any collection |
| tasks | label attach / detach / delete | Wipe a victim's labels; leak label names |

**Trade-off.** Each guarded statement now carries a subquery on an indexed `user_id`/`id` column — sub-millisecond, and Postgres folds it into a semi-join. Correctness is worth far more than that here.

### 3.2 Task label manipulation — **High, fixed**

Three distinct defects in one file:

**(a) Labels were written before ownership was known.** `updateTaskEntry` ran the label write regardless of whether the task update matched:

```ts
// BEFORE — setTaskLabels runs even when `task` is null (i.e. not yours)
const task = await updateTask(id, userId, updateData);
if (validated.labelIds !== undefined) await setTaskLabels(id, validated.labelIds ?? []);
if (!task) return null;
```

```ts
// AFTER — bail out before touching labels
const task = await updateTask(id, userId, updateData);
if (!task) return null;
if (validated.labelIds !== undefined) await setTaskLabels(id, userId, validated.labelIds ?? []);
```

**(b) `deleteLabel` purged junction rows before establishing ownership**, so `DELETE /api/tasks/labels/<victim-label-id>` stripped that label from all the victim's tasks and *then* returned 404. Reordered so the ownership-scoped delete runs first and short-circuits.

**(c) `setTaskLabels` accepted arbitrary label UUIDs**, letting a user attach a stranger's label to their own task and read its name and colour back. Now filtered to labels the caller owns.

Also fixed: `getProjectStats` aggregated tasks by `projectId` with no `user_id` filter, so foreign tasks pointing at your project polluted your counts.

### 3.3 Open redirect in OAuth callback — **High, fixed**

`redirect_url` flowed unvalidated into the post-login redirect. Browsers normalise `//evil.com` and `/\evil.com` into off-site navigations, which turns the login flow into a phishing laundromat on a trusted domain.

```ts
// AFTER — same-origin relative paths only
const requested = searchParams.get("redirect_url");
const redirectTo = requested && /^\/(?![/\\])/.test(requested) ? requested : "/";
```

The same pattern exists in `src/proxy.ts`, which writes `redirect_url` into the sign-in URL. It is only *read* by the callback, so closing it here closes the loop — but validate at both ends if more consumers are added.

### 3.4 Debug endpoints in production — **High, fixed**

`GET /api/test-simple` and `GET /api/test-music` (the latter echoing the caller's `userId`) were live, and `src/test-overview.ts` was dead code. All removed.

### 3.5 Unauthenticated pages rendered empty instead of redirecting — **High, fixed**

15 server pages did `getCurrentUserId()!`. A `null` asserted to `string` reaches Drizzle as `WHERE user_id = NULL`, which matches nothing — so an unauthenticated visitor got a fully-rendered empty dashboard rather than a redirect. This is reachable in practice: `src/proxy.ts` deliberately lets requests through when Supabase is unreachable.

Added `requireAuth()` to `src/core/auth`, which redirects, and applied it to all 15 pages.

### 3.6 Findings reviewed and cleared

Worth recording so the next audit does not re-tread them:

- **SQL injection** — none. All dynamic SQL uses Drizzle's tagged templates, which parameterise interpolations. The `to_tsvector`/`plainto_tsquery` search in `tasks/repository.ts` is correctly parameterised.
- **Auth coverage on API routes** — 347 of 349 routes check `getCurrentUserId()`. The two that do not are `/api/auth/callback` (correct — it establishes the session) and `/api/wellness/bmi` (pure arithmetic, no data access). Genuinely good discipline.
- **Secrets** — `.env` is correctly gitignored and untracked; only `.env.example` is committed. `SUPABASE_SERVICE_ROLE_KEY` is read solely in `createAdminClient()` and never reaches a client bundle.
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` are set in `next.config.ts`. Missing: CSP and HSTS (see §14).
- **`travel/service.ts`** — bypasses the repository layer but is consistently `user_id`-scoped throughout. Layering smell, not a vulnerability.
- **Music routes with inline `db`** — all four (`analytics`, `dashboard`, `timeline`, `seed`) are correctly scoped.

---

## 4. Row Level Security & Authorization

**This is the single most important item on the roadmap.**

Current state: `grep` across all 48 migrations finds **zero** `ENABLE ROW LEVEL SECURITY` and **zero** `CREATE POLICY` statements across 290 tables. Even if policies existed, they would not fire: `src/core/database/client.ts` connects with `DATABASE_URL`, which is the Supabase `postgres` superuser — and superusers bypass RLS unconditionally.

So the app has exactly one layer of tenant isolation, applied by hand, ~800 times. §3.1 shows the failure rate of that approach.

### Recommended path — defence in depth without a rewrite

The goal is a second, database-enforced layer *underneath* the existing application filters, so a future missing `WHERE` clause returns nothing rather than someone else's data.

**Step 1 — stop connecting as superuser.**

```sql
CREATE ROLE app_user LOGIN PASSWORD '...';
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
-- deliberately NOT granted BYPASSRLS
```

**Step 2 — propagate the user id per request.** Because the connection pool is shared, the id must be set transactionally, never as a session-wide `SET`:

```ts
export async function withUser<T>(userId: string, fn: (tx: DB) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    return fn(tx as unknown as DB);
  });
}
```

The `true` third argument scopes the setting to the transaction, so it cannot leak to the next request that borrows the connection.

**Step 3 — enable RLS, owner tables first.**

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_isolation ON tasks
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));
```

For child tables without their own `user_id` (`goal_milestones`, `book_chapters`, `script_sections`, `music_collection_items`), the policy walks the parent — which is exactly the invariant §3.1 had to enforce by hand:

```sql
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY goal_milestones_isolation ON goal_milestones
  USING (EXISTS (
    SELECT 1 FROM goals g
    WHERE g.id = goal_milestones.goal_id
      AND g.user_id = current_setting('app.user_id', true)
  ));
```

**Benefits.** The IDOR class in §3.1 becomes structurally impossible rather than a code-review responsibility. A missed filter degrades to an empty result — a visible bug, not a silent breach.

**Trade-offs, stated plainly.** This is a multi-week migration touching every query path, and it is easy to half-finish. Roll out per module behind a flag, verify with a two-tenant integration test per table, and expect a small planner cost on child-table policies (mitigated by the indexes in §6). Background jobs that legitimately act across users (`processDueReminders`) need an explicit, audited service-role path.

**Interim mitigation (do this now, it is cheap):** add the `user_id` scope as a *test* rather than a convention. See §12.

---

## 5. Performance Bottlenecks

### 5.1 82 `setState`-inside-`useEffect` violations — **High**

Now surfaced by the repaired lint (`react-hooks/set-state-in-effect`). Each occurrence forces a second render pass after paint: React renders, commits, runs the effect, sets state, and renders again. At scale this is the dominant cause of sluggish interaction (INP) and layout shift (CLS).

Two patterns dominate, both with mechanical fixes:

**Derived state** — computing from props into state:

```tsx
// BEFORE — two render passes, and stale for one frame
const [filtered, setFiltered] = useState([]);
useEffect(() => { setFiltered(items.filter(i => i.active)); }, [items]);

// AFTER — one pass, never stale
const filtered = useMemo(() => items.filter(i => i.active), [items]);
```

**Hydration-time reads** — e.g. `AppShellProvider.tsx` reads `localStorage` in an effect and calls `setCollapsedState`, so the sidebar visibly snaps to its stored width after first paint. Fix by reading during lazy `useState` initialisation and guarding SSR, or by inlining the read in a blocking script as `layout.tsx` already does for the colour scheme.

**Expected gain:** removing the second render pass on the ~30 highest-traffic components should cut INP meaningfully and remove the sidebar/theme flash.

### 5.2 Client/server boundary — 446 of 705 components are client — **Medium**

The page layer is right: 158 of 179 pages are server components fetching in parallel via `Promise.all`. But almost every leaf is `"use client"`, so the RSC benefit stops at the page boundary.

`framer-motion` is imported in **100 files** and is the main driver — it forces `"use client"` on anything that touches it. Most usages are simple fade/slide-in. Replacing those with CSS animations (or Tailwind's `animate-*`) would let a large share of the tree render on the server and remove a heavy dependency.

### 5.3 Bundle — 11 MB across 242 chunks — **Medium**

Measured on this branch: two 460 KB chunks and seven 324 KB chunks, which is the signature of a heavy library being duplicated across route groups rather than shared.

- `recharts` — statically imported in 12 files. Charts are always below the fold; every one should be `next/dynamic` with `ssr: false`.
- `@tiptap/*` — 15 packages. Correctly wrapped in `DynamicEditor.tsx`; verify no route imports `Editor` directly and defeats it.
- `leaflet` / `react-leaflet` — already dynamic. Good.
- `framer-motion` — see §5.2.

Only 6 files use `next/dynamic` today. Add `@next/bundle-analyzer` and gate a size budget in CI.

### 5.4 Connection pool sizing — **Medium**

```ts
const queryClient = postgres(databaseUrl, { max: 10, idle_timeout: 600, ... });
```

`max: 10` per instance is correct for a long-lived Node server. On Vercel or any serverless target, each concurrent lambda opens its own pool — 20 instances is 200 connections against a Supabase limit that starts around 60. Either pin to a long-lived runtime, or set `max: 1` and route through Supabase's connection pooler (port 6543, transaction mode). Note that transaction-mode pooling is incompatible with session-level `SET`, which is exactly why §4 uses transaction-scoped `set_config`.

### 5.5 N+1 in `getProjectStats` — **Low**

Fetches projects, then aggregates tasks in a second query. Fine at current scale; collapse into one grouped join if project counts grow.

---

## 6. Database Optimisation

**Schema quality is good** — consistent UUID PKs, `timestamptz` throughout, soft deletes via `deleted_at`, 180 foreign keys, sensible enums. Normalisation is appropriate.

**The gap is index coverage.** 299 indexes exist across 290 tables, but they are concentrated in 14 modules. These 14 have **none**:

`career · countdown · curb · expenses · gamification · goals · habits · integrity · knowledge · movies · music · routines · time-audit · timeline`

Given that every query filters on `user_id` and most sort by a timestamp, the missing composite indexes are highly predictable. Postgres will be sequentially scanning these tables.

```sql
-- Covers the dominant "my rows, newest first, not deleted" access path.
CREATE INDEX CONCURRENTLY idx_goals_user_status      ON goals (user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_timeline_user_date     ON timeline_events (user_id, event_date DESC);
CREATE INDEX CONCURRENTLY idx_habits_user_active     ON habits (user_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_txn_user_date          ON transactions (user_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_music_history_user_at  ON music_listening_history (user_id, played_at DESC);

-- Child-table FK indexes: required by the §4 RLS policies and by cascade deletes.
CREATE INDEX CONCURRENTLY idx_goal_milestones_goal   ON goal_milestones (goal_id);
CREATE INDEX CONCURRENTLY idx_collection_items_coll  ON music_collection_items (collection_id);
```

Use `CONCURRENTLY` so index creation does not take a write lock in production. Drizzle does not emit it, so hand-edit the generated migration.

**Full-text search.** `tasks/repository.ts` computes `to_tsvector('english', title)` per row at query time, which cannot use an index. Add a generated column plus a GIN index:

```sql
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED;
CREATE INDEX CONCURRENTLY idx_tasks_search ON tasks USING GIN (search_vector);
```

**Pagination.** Every list endpoint uses `LIMIT/OFFSET`. Fine for early pages; `OFFSET 10000` makes Postgres walk and discard 10,000 rows. Move the high-volume lists (timeline, music history, transactions) to keyset pagination (`WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC`).

**Analytics endpoints** (`/api/habits/analytics/*`, `/api/music/analytics`, `/api/wellness/sleep/analytics`) recompute aggregates on every request. Once traffic justifies it, back them with materialised views refreshed on a schedule.

---

## 7. Supabase Auth

The implementation is solid. `@supabase/ssr` is used correctly with the `getAll`/`setAll` cookie interface (not the deprecated per-cookie API), a browser singleton avoids duplicate `GoTrue` instances, `onAuthStateChange` is unsubscribed on unmount, and PKCE code exchange is handled server-side in the callback.

Three improvements:

**1. `src/proxy.ts` exempts all of `/api` from the session check.** Every route re-checks independently, so this is defensible — but it means a route that forgets the check is fully exposed rather than caught by a second net. Now that a lint rule guards `db` imports, consider also asserting auth at the proxy for `/api` (excluding `/api/auth/*`), so a forgotten check fails closed.

**2. The Supabase-unreachable fallthrough is a real risk.** It was masked by the `userId!` pattern (§3.5) — now that pages redirect, the failure mode is correct. Keep the fallthrough, but log it, so an outage is visible rather than silent.

**3. Clerk remnants.** `.env.example` still advertises `CLERK_SECRET_KEY` / `CLERK_WEBHOOK_SECRET`, and a `.clerk/` directory persists. Nothing imports Clerk. Remove both to avoid provisioning confusion.

---

## 8. API Review

349 routes follow a consistent shape — auth check, `try/catch`, `NextResponse.json`. Consistency at this scale is a real asset. Four issues:

**Validation is uneven.** Some routes parse with Zod at the boundary; `/api/tasks` hand-rolls `searchParams` extraction into `Record<string, unknown>` and casts `filters as any` before passing to a service that then parses it. The cast defeats the type system precisely where untrusted input enters.

**Error handling duplicates a broken Zod check 80+ times.** This exact block is copy-pasted throughout:

```ts
if (error instanceof Error && error.name === "ZodError") {
  return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
}
```

Two bugs: Zod v3 exposes `.issues`, not `.errors`, so `details` is always the fallback string; and `AppError` subclasses in `src/core/errors` carry a `statusCode` that nothing reads — a `NotFoundError` returns 500. Replace with one wrapper:

```ts
// src/core/api/handler.ts
export function route<T>(fn: (ctx: { userId: string; req: Request }) => Promise<T>) {
  return async (req: Request) => {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      return NextResponse.json(await fn({ userId, req }));
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
      }
      if (err instanceof AppError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
      }
      logger.error({ err, path: req.url }, "unhandled route error");
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  };
}
```

This removes ~15 lines from every route, fixes the Zod bug once, and makes `AppError` status codes work.

**Internal details leak.** Several countdown routes return `details: String(error)` to the client, exposing driver messages. Log server-side; return an opaque message.

**No server actions.** Zero `"use server"` in the codebase; all mutations go through `fetch` to REST routes. This is a legitimate choice and consistent — but for form-heavy flows, server actions would remove the hand-written fetch/serialise/invalidate layer. Not a defect; worth considering for new features.

---

## 9. Data Fetching & State

The split is sensible: TanStack Query for client state with a well-chosen default (`staleTime: 5min`, `refetchOnWindowFocus: false`), Zustand for UI state, React Context for the app shell.

**Server data is not seeded into the query cache.** Pages fetch on the server and pass results as props; client components then re-fetch the same data through TanStack Query. Use `HydrationBoundary` with a `dehydrate`d server-side prefetch so the client adopts the server's data instead of duplicating the round trip.

**`PrefetchProvider` fires on every mount** for all users regardless of route, warming two endpoints that most pages never read. Move to route-level prefetching, or drop it in favour of hydration.

**Query keys are ad hoc strings** (`["notes"]`, `["note-tags"]`). At 28 modules this invites collisions and makes invalidation guesswork. Adopt per-module key factories:

```ts
export const notesKeys = {
  all: ["notes"] as const,
  lists: () => [...notesKeys.all, "list"] as const,
  list: (f: Filters) => [...notesKeys.lists(), f] as const,
  detail: (id: string) => [...notesKeys.all, "detail", id] as const,
};
```

**No optimistic updates** anywhere, despite this being a productivity app where perceived latency matters most. `onMutate`/`onError` rollback on toggle-completion, checkbox, and drag-reorder mutations would be the highest-leverage UX change in this document.

---

## 10. UI/UX

Strong foundation: Mantine 8 + Tailwind 4, a `src/core/design-system/theme.ts` token file, a shared `components/ui` primitive set, skeleton templates, and 8 route-level `error.tsx` boundaries.

- **Two styling systems overlap.** Mantine props and Tailwind classes are mixed within single components (`AppShellInner.tsx` passes `classNames` of Tailwind strings into Mantine). It works, but the source of truth for spacing and colour is ambiguous. Pick one for layout and keep the other for primitives.
- **No `not-found.tsx` anywhere** — 404s fall back to the unstyled Next default.
- **No `global-error.tsx`** — an error in the root layout renders a blank page.
- **Command palette exists** (`CommandPalette.tsx` + Mantine Spotlight) — good. Extend it to actions, not just navigation.
- **Keyboard shortcuts are registered in `AppShellProvider`** but undiscoverable. Add a `?` shortcut sheet.
- **`framer-motion` page transitions** add latency to every navigation for little benefit; consider dropping in favour of RSC streaming.

## 11. Accessibility — WCAG 2.2 AA

**The weakest area, and the cheapest to improve.** 20 `aria-*`/`role` attributes across 705 components.

Concrete gaps:
- 29 `react/no-unescaped-entities` errors indicate raw apostrophes in JSX text — a symptom of hand-built markup that has not been reviewed for semantics.
- No skip-to-content link, so keyboard users traverse the entire sidebar on every page.
- Icon-only buttons (sidebar collapse, mobile nav) lack accessible names.
- No `prefers-reduced-motion` handling despite `framer-motion` on 100 components — a vestibular-disorder trigger and a WCAG 2.3.3 failure.
- Focus is not managed on route change; screen readers do not announce navigation.

Mantine provides accessible primitives, so much of this is about *using* them rather than building custom markup. Add `eslint-plugin-jsx-a11y` (Next's config includes a subset) and `@axe-core/react` in development.

---

## 12. Testing Strategy

Zero test files. For an app with 349 endpoints and hand-enforced tenant isolation, this is the root cause behind §3 — nothing would have caught those 18 IDORs.

**Priority 1 — a cross-tenant authorization suite.** This directly guards the §3.1 class and should be written before anything else:

```ts
// For every resource: user A must never touch user B's row.
it.each(RESOURCES)("%s rejects cross-tenant access", async ({ path, factory }) => {
  const victim = await factory(userB);
  const res = await fetch(`${path}/${victim.id}`, { method: "DELETE", headers: authAs(userA) });
  expect(res.status).toBe(404);
  await expect(stillExists(victim.id)).resolves.toBe(true);   // and was not deleted
});
```

Table-driven, one row per resource — this scales to all 349 routes without 349 hand-written tests.

**Priority 2** — Vitest unit tests on service-layer business logic (streaks, scoring, recurrence, XP). Pure functions, high value, easy.
**Priority 3** — Playwright smoke tests on the critical journeys: sign-in, create task, complete habit, write journal.
**Priority 4** — `@axe-core/playwright` for accessibility regressions.

Recommended stack: Vitest + Testing Library + Playwright + MSW.

---

## 13. Developer Experience

**Fixed this cycle:** `pnpm lint` ran `next lint`, which Next 16 removed — the CLI parsed `lint` as a directory name and errored. There was also no ESLint config file at all. Linting had therefore been silently dead, hiding 1,481 issues. Added `eslint.config.mjs` (flat config, native `eslint-config-next` v16 entry points) and pointed the script at `eslint .`.

The config includes an architectural guard rail that directly targets §3:

```js
"no-restricted-imports": ["error", { paths: [{
  name: "@/core/database", importNames: ["db"],
  message: "Import db only inside a module repository. Route handlers and components must go through a module service so ownership scoping is applied.",
}]}]
```

Repositories are exempted. This makes the layering violation that hides missing `user_id` filters a build error rather than a review comment.

**Remaining:**
- **No CI.** Husky and lint-staged are configured locally, but nothing runs on push. Add a GitHub Actions workflow: `typecheck` → `lint` → `test` → `build`.
- **`CONTEXT.md` is 99 KB** and appears to be an append-only log. Split into `docs/` topics; the ADR set in `docs/adr/` is the right model and should be extended.
- **`drizzle/meta/` is gitignored** — this breaks `drizzle-kit generate` for any second contributor, because the snapshot journal is how Drizzle diffs schema state. It should be committed.
- Path aliases, Prettier, and commitlint are all correctly configured.

---

## 14. Production Deployment Checklist

- [x] `poweredByHeader: false`, `compress`, `generateEtags`
- [x] AVIF/WebP images with sized device breakpoints
- [x] `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- [x] `.env` gitignored; service-role key server-only
- [x] Production build succeeds
- [ ] **Content-Security-Policy** — absent; the highest-value remaining header
- [ ] **HSTS** (`Strict-Transport-Security`)
- [ ] **Error tracking** — no Sentry or equivalent; production failures are currently invisible
- [ ] **Structured logging** — `src/core/logger` (pino) is defined but imported by **zero** files; 63 `console.*` calls instead
- [ ] **Rate limiting** — none on any route, including OAuth callback and external-API proxies (`/api/travel-helper/geocode`, `/api/movies/search`)
- [ ] **Connection pooling for the target runtime** (§5.4)
- [ ] **`env.ts` does not validate `SUPABASE_SERVICE_ROLE_KEY`** and marks `DATABASE_URL` optional, though `client.ts` throws without it — make both required
- [ ] **Health check endpoint** for uptime monitoring
- [ ] **`robots.txt`** — an authenticated app should explicitly disallow crawling

---

## 15. Prioritised Roadmap

### Critical — done this cycle
1. ✅ 18 IDOR endpoints across goals, books, scripts, music, tasks
2. ✅ Open redirect in OAuth callback
3. ✅ Debug endpoints removed
4. ✅ Unauthenticated pages redirect instead of rendering empty
5. ✅ Lint restored + architectural guard rail

### Critical — next
6. **Cross-tenant authorization test suite** (§12) — locks in this cycle's fixes and catches the next one
7. **Sentry + wire up the existing pino logger** — production is currently unobservable
8. **Audit the remaining ~337 routes** for the §3.1 pattern; the lint rule and test suite make this tractable

### High
9. RLS migration, module by module (§4)
10. Composite indexes for the 14 uncovered modules (§6)
11. Unified route handler — fixes the Zod `.errors` bug and `AppError` status codes in one place (§8)
12. Fix the 82 `setState`-in-effect violations (§5.1)
13. CSP + HSTS headers; rate limiting on public-facing routes
14. Connection pooling decision for the deployment target (§5.4)

### Medium
15. Optimistic updates on toggle/reorder mutations (§9)
16. `HydrationBoundary` to stop double-fetching server data (§9)
17. Dynamic-import `recharts`; reduce `framer-motion`'s 100-file footprint (§5.3)
18. Accessibility pass: skip link, button names, `prefers-reduced-motion`, focus management (§11)
19. `global-error.tsx` and `not-found.tsx`
20. Query key factories (§9)
21. CI pipeline
22. Commit `drizzle/meta/`; remove Clerk remnants

### Low
23. Reduce 409 `any` occurrences; generate Supabase types
24. Keyset pagination on high-volume lists
25. Split `CONTEXT.md`
26. Materialised views for analytics
27. Consolidate the Mantine/Tailwind overlap

---

## 16. Estimated Gains

Ranges reflect that no production telemetry exists yet — establishing a baseline (item 7) should precede optimisation work.

| Change | Expected effect |
|---|---|
| IDOR fixes (done) | Cross-tenant read/write/delete on 18 endpoints eliminated |
| RLS migration | Whole vulnerability class becomes structurally impossible |
| Composite indexes | 10–100× on list/analytics queries in the 14 uncovered modules; largest single perf win |
| Fixing 82 render loops | Removes one full render pass per affected component; material INP and CLS improvement |
| Dynamic charts + less framer-motion | ~30–40% cut to initial JS on chart-heavy routes |
| Optimistic updates | Perceived latency on toggles drops from ~200–400 ms to immediate |
| Query hydration | Removes one duplicate round trip per page load |
| Accessibility pass | Lighthouse a11y from roughly 60–70 into the 90s |

A Lighthouse target of 95+ is realistic on the lighter routes after items 12, 17, and 18. Chart- and editor-heavy routes will land lower without further code splitting — worth measuring per route rather than chasing a single global number.

---

## 17. Files Modified — Cycle 1

**45 files changed, +444 / −267.** `tsc --noEmit` clean · `eslint` runs · `next build` succeeds.

**Security — ownership enforcement (18 endpoints)**
```
src/modules/goals/repository.ts          ownedByUser() guard; getMilestones/updateMilestone/deleteMilestone
src/modules/goals/service.ts             thread userId
src/modules/scripts/repository.ts        scriptOwnedByUser() guard; 10 functions scoped
src/modules/scripts/service.ts           thread userId
src/modules/books/repository.ts          bookOwnedByUser() + chapterOwnedByUser(); 8 functions scoped
src/modules/books/service.ts             thread userId
src/modules/music/repository.ts          collectionOwnedByUser(); added getCollectionItemsForEntity()
src/modules/music/service.ts             thread userId
src/modules/tasks/repository.ts          setTaskLabels/deleteLabel/getTaskLabels(+Batch)/getProjectStats
src/modules/tasks/service.ts             bail before label writes; thread userId

src/app/api/goals/[id]/milestones/route.ts                                  + 1 nested route
src/app/api/books/[id]/{chapters,collaborators,versions,comments}/...       5 routes
src/app/api/scripts/[id]/{sections,actions,questions,checklist,versions}/…  5 routes
src/app/api/music/collections/[id]/items/route.ts                           1 route
```

**Security — auth & surface**
```
src/core/auth/index.ts                   added requireAuth() (redirects instead of asserting)
src/app/(app)/**/page.tsx  (15 files)    getCurrentUserId()! → requireAuth()
src/app/api/auth/callback/route.ts       open-redirect fix
src/app/api/test-simple/route.ts         deleted
src/app/api/test-music/route.ts          deleted
src/test-overview.ts                     deleted (dead code)
```

**Bug fix**
```
src/app/api/music/tracks/[id]/route.ts   passed a track id where a collection id was expected —
                                         "collections containing this track" silently returned nothing
```

**Tooling**
```
eslint.config.mjs                        new — flat config + no-restricted-imports guard rail
package.json                             lint: "next lint" (broken) → "eslint ."; added lint:fix
```

### Next highest-impact steps

1. **Cross-tenant test suite** — without it, cycle 1's fixes can silently regress.
2. **Sentry + pino wiring** — establishes the baseline every later optimisation is measured against.
3. **Sweep the remaining ~337 routes** for the §3.1 pattern, using the lint rule and test harness as scaffolding.
