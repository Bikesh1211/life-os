import { db } from "@/core/database";
import { loanEvents } from "../schema/loan-events";
import { eq, desc } from "drizzle-orm";

export type LoanEvent = typeof loanEvents.$inferSelect;
export type CreateLoanEventInput = typeof loanEvents.$inferInsert;

export async function createLoanEvent(input: CreateLoanEventInput) {
  const [event] = await db.insert(loanEvents).values(input).returning();
  return event;
}

export async function getEventsByLoanId(loanId: string) {
  return db
    .select()
    .from(loanEvents)
    .where(eq(loanEvents.loanId, loanId))
    .orderBy(desc(loanEvents.createdAt));
}
