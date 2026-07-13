import { db } from "@/core/database";
import { loanRepayments } from "../schema/loan-repayments";
import { eq, and, desc, sql, sum } from "drizzle-orm";

export type Repayment = typeof loanRepayments.$inferSelect;
export type CreateRepaymentInput = typeof loanRepayments.$inferInsert;

export async function createRepayment(input: CreateRepaymentInput) {
  const [repayment] = await db.insert(loanRepayments).values(input).returning();
  return repayment;
}

export async function getRepaymentsByLoanId(loanId: string) {
  return db
    .select()
    .from(loanRepayments)
    .where(eq(loanRepayments.loanId, loanId))
    .orderBy(desc(loanRepayments.date));
}

export async function getTotalPaidForLoan(loanId: string): Promise<number> {
  const [result] = await db
    .select({ total: sum(loanRepayments.amount) })
    .from(loanRepayments)
    .where(eq(loanRepayments.loanId, loanId));
  return Number(result?.total ?? 0);
}

export async function getRepaymentById(id: string) {
  const [repayment] = await db
    .select()
    .from(loanRepayments)
    .where(eq(loanRepayments.id, id));
  return repayment ?? null;
}

export async function deleteRepayment(id: string) {
  const [repayment] = await db
    .delete(loanRepayments)
    .where(eq(loanRepayments.id, id))
    .returning();
  return repayment ?? null;
}
