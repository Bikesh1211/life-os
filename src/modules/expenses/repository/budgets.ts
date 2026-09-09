import { connectToDatabase } from "@/lib/mongodb";
import { Budget as BudgetModel } from "@/lib/models/expenses";

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: string;
  startDate: Date;
  endDate?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBudgetInput = {
  userId: string;
  categoryId: string;
  amount: number;
  period?: string;
  startDate: Date;
  endDate?: Date;
};

export type UpdateBudgetInput = Partial<Omit<CreateBudgetInput, "userId">>;

function mapBudget(doc: any): Budget {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    categoryId: doc.categoryId.toString(),
    amount: doc.amount,
    period: doc.period,
    startDate: doc.startDate,
    endDate: doc.endDate,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  await connectToDatabase();
  const doc = await BudgetModel.create({
    userId: input.userId,
    categoryId: input.categoryId,
    amount: input.amount,
    period: input.period ?? "monthly",
    startDate: input.startDate,
    endDate: input.endDate,
  });
  return mapBudget(doc);
}

export async function getBudgetsForUser(userId: string): Promise<Budget[]> {
  await connectToDatabase();
  const docs = await BudgetModel.find({ userId, deletedAt: null })
    .sort({ createdAt: 1 })
    .lean();
  return docs.map(mapBudget);
}

export async function getBudgetById(
  id: string,
  userId: string,
): Promise<Budget | null> {
  await connectToDatabase();
  const doc = await BudgetModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapBudget(doc) : null;
}

export async function updateBudget(
  id: string,
  userId: string,
  input: UpdateBudgetInput,
): Promise<Budget | null> {
  await connectToDatabase();
  const doc = await BudgetModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapBudget(doc) : null;
}

export async function deleteBudget(
  id: string,
  userId: string,
): Promise<Budget | null> {
  await connectToDatabase();
  const doc = await BudgetModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapBudget(doc) : null;
}
