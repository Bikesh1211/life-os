import { connectToDatabase } from "@/lib/mongodb";
import { Account as AccountModel } from "@/lib/models/expenses";

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAccountInput = {
  userId: string;
  name: string;
  type: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  isArchived?: boolean;
};

export type UpdateAccountInput = Partial<Omit<CreateAccountInput, "userId">>;

function mapAccount(doc: any): Account {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    type: doc.type,
    balance: doc.balance,
    currency: doc.currency,
    icon: doc.icon,
    color: doc.color,
    isArchived: doc.isArchived,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  await connectToDatabase();
  const doc = await AccountModel.create({
    userId: input.userId,
    name: input.name,
    type: input.type,
    balance: input.balance ?? 0,
    currency: input.currency ?? "NPR",
    icon: input.icon,
    color: input.color,
    isArchived: input.isArchived ?? false,
  });
  return mapAccount(doc);
}

export async function getAccountsForUser(userId: string): Promise<Account[]> {
  await connectToDatabase();
  const docs = await AccountModel.find({ userId, deletedAt: null })
    .sort({ createdAt: 1 })
    .lean();
  return docs.map(mapAccount);
}

export async function getAccountById(id: string, userId: string): Promise<Account | null> {
  await connectToDatabase();
  const doc = await AccountModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapAccount(doc) : null;
}

export async function updateAccount(
  id: string,
  userId: string,
  input: UpdateAccountInput,
): Promise<Account | null> {
  await connectToDatabase();
  const doc = await AccountModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapAccount(doc) : null;
}

export async function deleteAccount(id: string, userId: string): Promise<Account | null> {
  await connectToDatabase();
  const doc = await AccountModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapAccount(doc) : null;
}

export async function updateAccountBalance(
  id: string,
  userId: string,
  newBalance: number,
): Promise<Account | null> {
  await connectToDatabase();
  const doc = await AccountModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { balance: newBalance, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapAccount(doc) : null;
}
