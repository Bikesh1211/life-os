# ADR-0010: Online-First Client Caching — No Service Worker, In-Memory Query Cache Only

**Status:** Accepted
**Date:** 2026-08-19
**Tags:** caching, performance, security, architecture

## Context

LifeOS is an **online-first** productivity application. It needs an internet connection to do anything meaningful; it is fast when online and offers no offline CRUD by design. The performance goal (see `docs/ARCHITECTURE_AUDIT.md`) is "fast online experience + intelligent caching," explicitly **not** "full offline application."

Before this decision the app shipped a **Service Worker (`public/sw.js`)** that cached *every successful GET — private `/api/*` responses included* — in a cache bucket keyed only by URL, and replayed it on network failure. Two problems:

1. **Privacy hazard.** A cached private response could outlive the session that fetched it. A cached `/api/tasks` (User A) replayed later, or to a different signed-in user occupying the same URL, is a cross-user leak. The cache had no notion of the authenticated user.
2. **Wrong tool for the job.** Caching *server state that is private and user-scoped* belongs in an authenticated, user-aware cache, not a URL-keyed network replay layer.

Separately, the open question was where any *cross-session* data should live to make repeat visits instant.

## Decision

- **Retire the Service Worker.** `public/sw.js` is now a kill-switch that empties its old caches and unregisters itself; `ServiceWorkerRegister.tsx` keeps registering it only long enough for browsers holding the old worker to pick up the replacement and clean up. LifeOS ships **no live service worker** in front of its data. This is safe to delete outright once the installed base has turned over.
- **Client caching is in-memory, TanStack Query only, and not persisted.** The single `QueryClient` (built by `createQueryClient`, `src/infrastructure/cache/query-client.ts`) is the client-side source of truth for the session. It is **not** persisted to localStorage/IndexedDB and there is **no** `PersistClient`/`createWebStoragePersister`. A browser restart or a new browser session is a cold load — a fresh sign-in/return re-fetches over the fast server path.
- **Stale-while-revalidate within a session.** Cached values render instantly and a background refresh replaces them past their staleness window (`STALE_TIME`, `src/infrastructure/cache/policy.ts`). Nothing persists beyond the in-memory cache's `GC_TIME` (30 min, far longer than the staleness windows so there is always something left to revalidate).

## Consequences

### Positive
- Eliminates the cross-user leak class by construction: no URL-keyed private-data replay layer exists anymore.
- No persistence to manage, leak, or expire; no offline-conflict handling; aligns with online-first.
- One authenticated, user-aware cache with a single policy, backed by the transitive timeout/retry/abort semantics of `apiFetch`.
- Cross-session staleness is intentionally traded for security and simplicity — bounded by the server being fast.

### Negative
- A **returning session is cold**: content renders with skeletons, not from a prior session's cache.
- Killing the SW means no network-level fallback whatsooften — if the network fails, there is no cached copy to degrade to (acceptable: online-first).

### Neutral
- `STALE_TIME`/`GC_TIME` values are tunable constants; not frozen by this ADR.

## Alternatives Considered

1. **Keep a constrained SW** caching only static/lifecycle resources, never user data. Rejected: reintroduces a worker and its lifecycle for marginal benefit; we just removed one, so it would be most surprising to a future reader.
2. **Persist non-sensitive cached GETs to IndexedDB** via `PersistClient` with a sensitive-module blocklist. Rejected now: reintroduces a store of real personal content in browser storage, needs per-user isolation + expiry + blocklisting, and buys perceived speed for data the server returns quickly. Revisited if measured cold loads become the bottleneck. See ADR-0011 for the isolation rule that any future persistence must also obey.