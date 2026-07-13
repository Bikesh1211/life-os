import * as repo from "../repository";
import { db } from "@/core/database";
import { loans } from "../schema/loans";
import { loanRepayments } from "../schema/loan-repayments";
import { eq, and, isNull, gte, lte, sql, sum } from "drizzle-orm";
import dayjs from "dayjs";

export interface LoansDashboardData {
  totalLent: number;
  totalBorrowed: number;
  outstandingToReceive: number;
  outstandingToPay: number;
  activeLoans: number;
  closedLoans: number;
  overdueLoans: number;
  amountRecoveredThisMonth: number;
  amountRepaidThisMonth: number;
  netBalance: number;
  monthlyTrend: { month: string; lent: number; borrowed: number }[];
  repaymentProgress: { paid: number; remaining: number; percentage: number };
}

export async function getLoansDashboard(userId: string): Promise<LoansDashboardData> {
  const allLoans = await repo.getLoans({ userId, limit: 1000, includeArchived: true });
  const now = dayjs();
  const monthStart = now.startOf("month").toDate();
  const monthEnd = now.endOf("month").toDate();

  let totalLent = 0;
  let totalBorrowed = 0;
  let outstandingToReceive = 0;
  let outstandingToPay = 0;
  let activeLoans = 0;
  let closedLoans = 0;
  let overdueLoans = 0;
  let amountRecoveredThisMonth = 0;
  let amountRepaidThisMonth = 0;

  for (const loan of allLoans) {
    const totalPayable = Number(loan.totalPayable ?? loan.principalAmount);
    const totalPaid = await repo.getTotalPaidForLoan(loan.id);
    const remaining = Math.max(0, totalPayable - totalPaid);

    if (loan.direction === "lent") {
      totalLent += totalPayable;
      outstandingToReceive += remaining;
      if (remaining > 0 && loan.status !== "fully_paid") {
        if (loan.dueDate && dayjs(loan.dueDate).isBefore(now)) {
          overdueLoans++;
        }
      }
    } else {
      totalBorrowed += totalPayable;
      outstandingToPay += remaining;
      if (remaining > 0 && loan.status !== "fully_paid") {
        if (loan.dueDate && dayjs(loan.dueDate).isBefore(now)) {
          overdueLoans++;
        }
      }
    }

    if (loan.status === "active" || loan.status === "partially_paid") activeLoans++;
    if (loan.status === "fully_paid" || loan.status === "cancelled") closedLoans++;
  }

  const monthlyRepayments = await db
    .select({
      direction: loans.direction,
      total: sum(loanRepayments.amount),
    })
    .from(loanRepayments)
    .innerJoin(loans, eq(loanRepayments.loanId, loans.id))
    .where(
      and(
        eq(loans.userId, userId),
        gte(loanRepayments.date, monthStart),
        lte(loanRepayments.date, monthEnd),
      ),
    )
    .groupBy(loans.direction);

  for (const row of monthlyRepayments) {
    const total = Number(row.total ?? 0);
    if (row.direction === "lent") amountRecoveredThisMonth += total;
    else amountRepaidThisMonth += total;
  }

  const monthlyTrend = await getMonthlyTrend(userId);

  const paidTotal = await getTotalPaidAll(userId);
  const totalAllPayable = allLoans.reduce((sum, l) => sum + Number(l.totalPayable ?? l.principalAmount), 0);
  const repaymentProgress = {
    paid: paidTotal,
    remaining: Math.max(0, totalAllPayable - paidTotal),
    percentage: totalAllPayable > 0 ? Math.round((paidTotal / totalAllPayable) * 100) : 0,
  };

  return {
    totalLent,
    totalBorrowed,
    outstandingToReceive,
    outstandingToPay,
    activeLoans,
    closedLoans,
    overdueLoans,
    amountRecoveredThisMonth,
    amountRepaidThisMonth,
    netBalance: totalLent - totalBorrowed,
    monthlyTrend,
    repaymentProgress,
  };
}

async function getMonthlyTrend(userId: string, months = 12) {
  const now = dayjs();
  const results: { month: string; lent: number; borrowed: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const month = now.subtract(i, "month");
    const start = month.startOf("month").toDate();
    const end = month.endOf("month").toDate();
    const monthLabel = month.format("MMM YY");

    const monthLoans = await db
      .select({
        direction: loans.direction,
        total: sum(loans.principalAmount),
      })
      .from(loans)
      .where(
        and(
          eq(loans.userId, userId),
          isNull(loans.deletedAt),
          gte(loans.loanDate, start),
          lte(loans.loanDate, end),
        ),
      )
      .groupBy(loans.direction);

    let lent = 0;
    let borrowed = 0;
    for (const row of monthLoans) {
      const total = Number(row.total ?? 0);
      if (row.direction === "lent") lent += total;
      else borrowed += total;
    }

    results.push({ month: monthLabel, lent, borrowed });
  }

  return results;
}

async function getTotalPaidAll(userId: string): Promise<number> {
  const [result] = await db
    .select({ total: sum(loanRepayments.amount) })
    .from(loanRepayments)
    .innerJoin(loans, eq(loanRepayments.loanId, loans.id))
    .where(and(eq(loans.userId, userId), isNull(loans.deletedAt)));
  return Number(result?.total ?? 0);
}

export async function getPersonLoanSummary(connectionId: string, userId: string) {
  const personLoans = await repo.getLoansByConnectionId(connectionId, userId);
  let totalLent = 0;
  let totalBorrowed = 0;
  let activeLoansCount = 0;
  let closedLoansCount = 0;
  let outstandingBalance = 0;
  let totalRepaid = 0;

  for (const loan of personLoans) {
    const totalPayable = Number(loan.totalPayable ?? loan.principalAmount);
    const paid = await repo.getTotalPaidForLoan(loan.id);
    const remaining = Math.max(0, totalPayable - paid);

    if (loan.direction === "lent") {
      totalLent += totalPayable;
      outstandingBalance += remaining;
      totalRepaid += paid;
    } else {
      totalBorrowed += totalPayable;
      outstandingBalance -= remaining;
    }

    if (loan.status === "fully_paid" || loan.status === "cancelled") closedLoansCount++;
    else activeLoansCount++;
  }

  return {
    totalLent,
    totalBorrowed,
    outstandingBalance,
    activeLoans: activeLoansCount,
    closedLoans: closedLoansCount,
    totalRepaid,
    loanCount: personLoans.length,
  };
}
