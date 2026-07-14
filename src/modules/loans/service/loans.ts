import * as repo from "../repository";
import {
  createLoanSchema,
  updateLoanSchema,
  loanFiltersSchema,
  createRepaymentSchema,
  type CreateLoanParams,
  type UpdateLoanParams,
  type LoanFiltersParams,
  type CreateRepaymentParams,
} from "./validators";
import { createTimelineEvent } from "@/modules/timeline";
import { createLoanEvent } from "../repository/events";
import { getTotalPaidForLoan } from "../repository/repayments";
import { createConnection, getConnections } from "@/modules/network/service";

export async function createLoan(userId: string, params: CreateLoanParams) {
  const validated = createLoanSchema.parse(params);
  const totalPayable = validated.totalPayable ?? validated.principalAmount;

  let connectionId = validated.connectionId;
  if (!connectionId && validated.connectionName) {
    const existingConnections = await getConnections(userId);
    const match = existingConnections.find(
      (c) => c.name.toLowerCase() === validated.connectionName!.toLowerCase(),
    );
    if (match) {
      connectionId = match.id;
    } else {
      const newConnection = await createConnection(userId, {
        name: validated.connectionName,
        phone: validated.connectionPhone ?? undefined,
        email: validated.connectionEmail ?? undefined,
      });
      connectionId = newConnection.id;
    }
  }

  const { connectionName: _cn, connectionPhone: _cp, connectionEmail: _ce, ...dbFields } = validated;
  const loan = await repo.createLoan({
    ...dbFields,
    userId,
    connectionId: connectionId ?? null,
    totalPayable,
    loanDate: new Date(validated.loanDate),
    dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
  });

  await createLoanEvent({
    loanId: loan.id,
    eventType: "created",
    metadata: { title: "Loan created", amount: validated.principalAmount, direction: validated.direction },
  });

  await createTimelineEvent(userId, {
    title: `${validated.direction === "lent" ? "Lent" : "Borrowed"} ${validated.currency} ${validated.principalAmount}`,
    eventDate: validated.loanDate,
    category: "finance",
    linkedEntityType: "loan",
    linkedEntityId: loan.id,
  });

  return loan;
}

export async function getLoans(userId: string, filters: Partial<LoanFiltersParams> = {}) {
  const validated = loanFiltersSchema.parse(filters);
  return repo.getLoans({ ...validated, userId } as repo.LoanFilters);
}

export async function getLoan(id: string, userId: string) {
  return repo.getLoanById(id, userId);
}

export async function updateLoan(id: string, userId: string, params: UpdateLoanParams) {
  const validated = updateLoanSchema.parse(params);
  const existing = await repo.getLoanById(id, userId);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (validated.loanDate) updateData.loanDate = new Date(validated.loanDate);
  if (validated.dueDate) updateData.dueDate = new Date(validated.dueDate);

  const loan = await repo.updateLoan(id, userId, { ...validated, ...updateData } as repo.UpdateLoanInput);
  if (!loan) return null;

  await createLoanEvent({
    loanId: id,
    eventType: "updated",
    metadata: { before: { status: existing.status }, after: { status: validated.status } },
  });

  return loan;
}

export async function deleteLoan(id: string, userId: string) {
  const loan = await repo.getLoanById(id, userId);
  if (!loan) return null;

  const result = await repo.deleteLoan(id, userId);

  await createLoanEvent({
    loanId: id,
    eventType: "loan_closed",
    metadata: { reason: "deleted" },
  });

  return result;
}

export async function addRepayment(userId: string, loanId: string, params: CreateRepaymentParams) {
  const validated = createRepaymentSchema.parse(params);
  const loan = await repo.getLoanById(loanId, userId);
  if (!loan) throw new Error("Loan not found");

  const repayment = await repo.createRepayment({
    ...validated,
    loanId,
    date: new Date(validated.date),
    installmentNumber: validated.installmentNumber,
  });

  const totalPaid = await getTotalPaidForLoan(loanId);
  const totalPayable = Number(loan.totalPayable ?? loan.principalAmount);
  const newStatus = totalPaid >= totalPayable ? "fully_paid" : totalPaid > 0 ? "partially_paid" : "active";

  if (newStatus !== loan.status) {
    await repo.updateLoan(loanId, userId, { status: newStatus } as repo.UpdateLoanInput);
  }

  await createLoanEvent({
    loanId,
    eventType: "repayment_added",
    metadata: { amount: validated.amount, newStatus, totalPaid: String(totalPaid) },
  });

  await createTimelineEvent(userId, {
    title: `Repayment of ${loan.currency} ${validated.amount} on ${loan.direction === "lent" ? "lent" : "borrowed"} money`,
    eventDate: validated.date,
    category: "finance",
    linkedEntityType: "loan",
    linkedEntityId: loanId,
  });

  return repayment;
}

export async function getRepayments(loanId: string) {
  return repo.getRepaymentsByLoanId(loanId);
}

export async function getLoanEvents(loanId: string) {
  return repo.getEventsByLoanId(loanId);
}

export async function pinLoan(id: string, userId: string, pinned: boolean) {
  return repo.updateLoan(id, userId, { isPinned: pinned } as repo.UpdateLoanInput);
}

export async function archiveLoan(id: string, userId: string) {
  return repo.updateLoan(id, userId, { archivedAt: new Date() } as repo.UpdateLoanInput);
}

export async function unarchiveLoan(id: string, userId: string) {
  return repo.updateLoan(id, userId, { archivedAt: null } as unknown as repo.UpdateLoanInput);
}
