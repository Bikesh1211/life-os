import { db } from "@/core/database";
import { accounts } from "../schema/accounts";
import { eq, and, isNull } from "drizzle-orm";

export type Account = typeof accounts.$inferSelect;
export type CreateAccountInput = typeof accounts.$inferInsert;
export type UpdateAccountInput = Partial<Omit<CreateAccountInput, "id" | "userId">>;

export async function createAccount(input: CreateAccountInput) {
  const [account] = await db.insert(accounts).values(input).returning();
  return account;
}

export async function getAccountsForUser(userId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)))
    .orderBy(accounts.createdAt);
}

export async function getAccountById(id: string, userId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)));
  return account ?? null;
}

export async function updateAccount(id: string, userId: string, input: UpdateAccountInput) {
  const [account] = await db
    .update(accounts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
    .returning();
  return account ?? null;
}

export async function deleteAccount(id: string, userId: string) {
  const [account] = await db
    .update(accounts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
    .returning();
  return account ?? null;
}

export async function updateAccountBalance(id: string, userId: string, newBalance: string) {
  const [account] = await db
    .update(accounts)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId), isNull(accounts.deletedAt)))
    .returning();
  return account ?? null;
}
