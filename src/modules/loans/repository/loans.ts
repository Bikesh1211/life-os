import { db } from "@/core/database";
import { loans } from "../schema/loans";
import { eq, and, isNull, desc, asc, sql, gte, lte, inArray, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export type Loan = typeof loans.$inferSelect;
export type CreateLoanInput = typeof loans.$inferInsert;
export type UpdateLoanInput = Partial<Omit<CreateLoanInput, "id" | "userId">>;

export type LoanFilters = {
  userId: string;
  direction?: "lent" | "borrowed";
  status?: string;
  connectionId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
};

export async function createLoan(input: CreateLoanInput) {
  const [loan] = await db.insert(loans).values(input).returning();
  return loan;
}

export async function getLoans(filters: LoanFilters) {
  const conditions: SQL[] = [
    eq(loans.userId, filters.userId),
    isNull(loans.deletedAt),
  ];

  if (!filters.includeArchived) {
    conditions.push(isNull(loans.archivedAt));
  }
  if (filters.direction) conditions.push(eq(loans.direction, filters.direction));
  if (filters.status) conditions.push(eq(loans.status, filters.status as typeof loans.$inferSelect["status"]));
  if (filters.connectionId) conditions.push(eq(loans.connectionId, filters.connectionId));
  if (filters.startDate) conditions.push(gte(loans.loanDate, filters.startDate));
  if (filters.endDate) conditions.push(lte(loans.loanDate, filters.endDate));
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${loans.purpose}) LIKE ${term} OR LOWER(${loans.notes}) LIKE ${term})`,
    );
  }

  const orderBy = (() => {
    switch (filters.sortBy) {
      case "amount":
      case "amount_high":
        return desc(loans.principalAmount);
      case "amount_low":
        return asc(loans.principalAmount);
      case "due_date":
      case "due_soon":
        return asc(loans.dueDate);
      case "loan_date":
      case "newest":
        return desc(loans.loanDate);
      case "oldest":
        return asc(loans.loanDate);
      default:
        return desc(loans.createdAt);
    }
  })();

  return db
    .select()
    .from(loans)
    .where(and(...conditions))
    .orderBy(desc(loans.isPinned), orderBy)
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function getLoanById(id: string, userId: string) {
  const [loan] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, id), eq(loans.userId, userId), isNull(loans.deletedAt)));
  return loan ?? null;
}

export async function updateLoan(id: string, userId: string, input: UpdateLoanInput) {
  const [loan] = await db
    .update(loans)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(loans.id, id), eq(loans.userId, userId), isNull(loans.deletedAt)))
    .returning();
  return loan ?? null;
}

export async function deleteLoan(id: string, userId: string) {
  const [loan] = await db
    .update(loans)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(loans.id, id), eq(loans.userId, userId), isNull(loans.deletedAt)))
    .returning();
  return loan ?? null;
}

export async function getLoansByConnectionId(connectionId: string, userId: string) {
  return db
    .select()
    .from(loans)
    .where(
      and(
        eq(loans.userId, userId),
        eq(loans.connectionId, connectionId),
        isNull(loans.deletedAt),
      ),
    )
    .orderBy(desc(loans.createdAt));
}
