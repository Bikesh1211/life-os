import { z } from "zod";
import { LOAN_DIRECTIONS, LOAN_STATUSES, INTEREST_TYPES, PAYMENT_METHODS, INSTALLMENT_FREQUENCIES } from "../constants";

const emptyStr = (v: unknown) => (v === "" || v === null || v === undefined) ? undefined : v;

export const createLoanSchema = z.object({
  connectionId: z.string().uuid().optional().nullable(),
  connectionName: z.preprocess(emptyStr, z.string().max(200).optional().nullable()),
  connectionPhone: z.preprocess(emptyStr, z.string().max(50).optional().nullable()),
  connectionEmail: z.preprocess(emptyStr, z.string().email().max(200).optional().nullable()),
  direction: z.enum(LOAN_DIRECTIONS),
  principalAmount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  currency: z.string().optional().default("NPR"),
  interestRate: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  interestType: z.enum(INTEREST_TYPES).optional().default("none"),
  totalPayable: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  loanDate: z.string().datetime({ message: "Invalid loan date" }),
  dueDate: z.preprocess(emptyStr, z.string().datetime().optional().nullable()),
  purpose: z.preprocess(emptyStr, z.string().max(500).optional().nullable()),
  notes: z.preprocess(emptyStr, z.string().max(5000).optional().nullable()),
  attachments: z.array(z.string().max(2000)).max(20).optional().default([]),
  status: z.enum(LOAN_STATUSES).optional().default("active"),
  installmentCount: z.preprocess(emptyStr, z.string().regex(/^\d+$/).optional().nullable()),
  installmentAmount: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  installmentFrequency: z.preprocess(emptyStr, z.enum(INSTALLMENT_FREQUENCIES).optional().nullable()),
  accountId: z.preprocess(emptyStr, z.string().uuid().optional().nullable()),
  linkedEntityType: z.preprocess(emptyStr, z.string().max(50).optional().nullable()),
  linkedEntityId: z.preprocess(emptyStr, z.string().uuid().optional().nullable()),
  isPinned: z.boolean().optional().default(false),
});

export const updateLoanSchema = z.object({
  connectionId: z.string().uuid().optional().nullable(),
  direction: z.enum(LOAN_DIRECTIONS).optional(),
  principalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  currency: z.string().optional(),
  interestRate: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  interestType: z.enum(INTEREST_TYPES).optional(),
  totalPayable: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  loanDate: z.string().datetime().optional(),
  dueDate: z.preprocess(emptyStr, z.string().datetime().optional().nullable()),
  purpose: z.preprocess(emptyStr, z.string().max(500).optional().nullable()),
  notes: z.preprocess(emptyStr, z.string().max(5000).optional().nullable()),
  attachments: z.array(z.string().max(2000)).max(20).optional(),
  status: z.enum(LOAN_STATUSES).optional(),
  installmentCount: z.preprocess(emptyStr, z.string().regex(/^\d+$/).optional().nullable()),
  installmentAmount: z.preprocess(emptyStr, z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable()),
  installmentFrequency: z.preprocess(emptyStr, z.enum(INSTALLMENT_FREQUENCIES).optional().nullable()),
  accountId: z.preprocess(emptyStr, z.string().uuid().optional().nullable()),
  linkedEntityType: z.preprocess(emptyStr, z.string().max(50).optional().nullable()),
  linkedEntityId: z.preprocess(emptyStr, z.string().uuid().optional().nullable()),
  isPinned: z.boolean().optional(),
  archivedAt: z.preprocess(emptyStr, z.string().datetime().optional().nullable()),
});

export const createRepaymentSchema = z.object({
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  date: z.string().datetime({ message: "Invalid date" }),
  paymentMethod: z.preprocess(emptyStr, z.enum(PAYMENT_METHODS).optional().nullable()),
  notes: z.preprocess(emptyStr, z.string().max(2000).optional().nullable()),
  receiptUrl: z.preprocess(emptyStr, z.string().max(2000).optional().nullable()),
  installmentNumber: z.preprocess(emptyStr, z.string().regex(/^\d+$/).optional().nullable()),
});

export const loanFiltersSchema = z.object({
  direction: z.enum(LOAN_DIRECTIONS).optional(),
  status: z.enum(LOAN_STATUSES).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.string().optional().default("newest"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeArchived: z.coerce.boolean().optional().default(false),
});

export type CreateLoanParams = z.infer<typeof createLoanSchema>;
export type UpdateLoanParams = z.infer<typeof updateLoanSchema>;
export type CreateRepaymentParams = z.infer<typeof createRepaymentSchema>;
export type LoanFiltersParams = z.infer<typeof loanFiltersSchema>;
