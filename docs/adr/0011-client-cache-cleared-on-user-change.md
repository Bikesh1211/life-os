# ADR-0011: Client Query Cache Is Cleared on Any Effective User Change

**Status:** Accepted
**Date:** 2026-08-19
**Tags:** security, caching, auth

## Context

The client-side server-state cache (ADR-0010) is **in-memory and not namespaced by user**: query keys are module-scoped (`"tasks"`, `"habits"`, `"gamification/profile"`, …), not `userId`-scoped. TanStack Query deduplicates and serves these by exact key. The single `QueryClient` lives for the whole browser session.

Meanwhile auth transitions are **client-side soft navigations**, not full page reloads: sign-out is `supabase.auth.signOut()` followed by `router.push("/sign-in")` (Header.tsx / Sidebar.tsx), and the `SupabaseProvider` updates `user` purely via `onAuthStateChange` (supabase-provider.tsx). No code cleared the query cache on these transitions.

Together this was the exact leak class ADR-0010 removed from the Service Worker, reintroduced in miniature:

- User A signs out (cache still holds A's tasks/habits — nothing cleared it).
- User B signs in on the same client session.
- Components mount `useTasks()`; the key `"tasks"` still has A's entry, still-fresh within its staleness window, so **A's data renders to B** until a background refetch happens to overwrite it.

The cache keys not being user-scoped makes this impossible to avoid by "namespacing later": a fresh sign-in is a cold render anyway, so holding stale user data serves no purpose.

## Decision

**Clear the entire in-memory query cache whenever the session's effective `user.id` changes.** Wire `queryClient.clear()` into the auth subscription: on `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`, and any token-refresh that results in a different `user.id` than the previously observed one. Concretely, the `SupabaseProvider` keeps the last-known `user.id` and calls `queryClient.clear()` when the new id differs.

No cache pruning or per-key surgical namespacing is done — clearing everything is cheap and correct.

## Consequences

### Positive
- User B can never see User A's data: the cache is empty whenever the effective identity changes, so the first thing after a sign-in is a fresh fetch keyed to B.
- Privacy by construction, mirroring ADR-0010's rationale. Works whether or not navigation later triggers a hard reload.
- Tiny cost: a fresh sign-in is a cold render regardless, so clearing loses nothing.

### Negative
- Clearing in-memory state on `SIGNED_OUT`/user-change discards any ephemeral optimistically-updated cache relevant to the *previous* user — correct and expected.
- Requires the auth provider and `QueryClient` to be coupled (the provider must reach the query client); acceptable given they live in the same provider tree.

### Neutral
- Does not resolve the "cache keyed only by module, not user" fact — settled in favor of clearing instead of namespacing. If persistence (ADR-0010 §Alternatives) is ever added, it must additionally obey the rule here and be cleared/partitioned per user.

## Alternatives Considered

1. **Namespace every query key by `userId`.** Rejected as the load-bearing isolation: it's a cross-cutting change across ~100 hook files and still leaves the sign-out gap (when `user` is null, whose cache holds A's data?). Good hardening later, not the primary mechanism.
2. **Do nothing; rely on soft navigation + server middleware to reload.** Rejected: the code path is a client-side `router.push`, which does not guarantee a reload, so the leak is latent and timing-dependent.