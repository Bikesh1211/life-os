import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/core/errors";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export function requireUserId(userId: string | null): string {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
