import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/core/supabase/server";
import { UnauthorizedError } from "@/core/errors";

/**
 * Resolves the signed-in user for a server component, redirecting to sign-in
 * when there is none.
 *
 * Server components must not fall back to `getCurrentUserId()!`. A null id
 * asserted to string reaches Drizzle as `where user_id = NULL`, which matches
 * no rows — so an unauthenticated visitor renders a fully populated but empty
 * page instead of being sent to sign-in. The proxy lets requests through when
 * Supabase is unreachable, so this path is reachable in practice.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * `supabase.auth.getUser()` is a network call to the Supabase auth server —
 * ~300ms measured from here. It was being made once in the proxy, again in the
 * page's `requireAuth()`, and again in every API route the page then calls, so
 * a single screen paid for it several times over with the identical answer.
 *
 * `cache()` scopes one call to one server request: every caller within a
 * request shares the first result, and the next request starts clean. It is
 * per-request memoisation, not a cache with a lifetime, so a signed-out or
 * swapped-over user is never served a previous request's identity.
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
});

export function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
