import { createServerSupabaseClient } from "@/core/supabase/server";
import { UnauthorizedError } from "@/core/errors";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
