import { z } from "zod";
import { PAYMENT_METHODS, TRANSACTION_TYPES, ACCOUNT_TYPES, BUDGET_PERIODS, RECURRENCE_OPTIONS } from "../constants";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.string().optional().default("0"),
  currency: z.string().optional().default("NPR"),
  icon: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(ACCOUNT_TYPES).optional(),
  balance: z.string().optional(),
  currency: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(TRANSACTION_TYPES).optional().default("expense"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().optional().default("NPR"),
  merchant: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  transactionDate: z.string().datetime({ message: "Invalid date" }),
  location: z.string().max(200).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(RECURRENCE_OPTIONS).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  merchant: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  transactionDate: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(RECURRENCE_OPTIONS).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Category is required"),
  amount: z.string().min(1, "Amount is required"),
  period: z.enum(BUDGET_PERIODS).optional().default("monthly"),
  startDate: z.string().datetime({ message: "Invalid start date" }),
  endDate: z.string().datetime().optional(),
});

export const updateBudgetSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.string().optional(),
  period: z.enum(BUDGET_PERIODS).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

export type CreateAccountParams = z.infer<typeof createAccountSchema>;
export type UpdateAccountParams = z.infer<typeof updateAccountSchema>;
export type CreateTransactionParams = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionParams = z.infer<typeof updateTransactionSchema>;
export type CreateBudgetParams = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetParams = z.infer<typeof updateBudgetSchema>;
export type CreateTagParams = z.infer<typeof createTagSchema>;
export type UpdateTagParams = z.infer<typeof updateTagSchema>;
