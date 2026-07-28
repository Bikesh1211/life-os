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

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
