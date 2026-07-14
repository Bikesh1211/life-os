export interface LoanWithSummary {
  id: string;
  userId: string;
  connectionId: string | null;
  direction: "lent" | "borrowed";
  principalAmount: string;
  currency: string;
  interestRate: string | null;
  interestType: "none" | "simple" | "compound";
  totalPayable: string | null;
  loanDate: string;
  dueDate: string | null;
  purpose: string | null;
  notes: string | null;
  attachments: string[];
  status: "active" | "partially_paid" | "fully_paid" | "cancelled" | "disputed";
  installmentCount: string | null;
  installmentAmount: string | null;
  installmentFrequency: string | null;
  accountId: string | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  isPinned: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // computed fields
  paidAmount: string;
  remainingAmount: string;
  completionPercentage: number;
  isOverdue: boolean;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: string;
  date: string;
  paymentMethod: string | null;
  notes: string | null;
  receiptUrl: string | null;
  installmentNumber: string | null;
  createdAt: string;
}

export interface LoanEvent {
  id: string;
  loanId: string;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
