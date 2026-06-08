import {
  createAccount,
  getAccountsForUser,
  getAccountById,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
} from "../repository/accounts";
import { createAccountSchema, updateAccountSchema, type CreateAccountParams, type UpdateAccountParams } from "./validators";

export async function createFinancialAccount(userId: string, params: CreateAccountParams) {
  const validated = createAccountSchema.parse(params);
  return createAccount({ ...validated, userId });
}

export async function getFinancialAccounts(userId: string) {
  return getAccountsForUser(userId);
}

export async function getFinancialAccount(id: string, userId: string) {
  return getAccountById(id, userId);
}

export async function updateFinancialAccount(id: string, userId: string, params: UpdateAccountParams) {
  const validated = updateAccountSchema.parse(params);
  return updateAccount(id, userId, validated);
}

export async function deleteFinancialAccount(id: string, userId: string) {
  return deleteAccount(id, userId);
}

export async function adjustAccountBalance(id: string, userId: string, newBalance: string) {
  return updateAccountBalance(id, userId, newBalance);
}
