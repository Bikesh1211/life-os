import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseCategory as ExpenseCategoryModel } from "@/lib/models/expenses";

export type ExpenseCategory = {
  id: string;
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCategoryInput = {
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
};

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "id">>;

function mapCategory(doc: any): ExpenseCategory {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    icon: doc.icon,
    color: doc.color,
    sortOrder: doc.sortOrder,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createCategory(input: CreateCategoryInput): Promise<ExpenseCategory> {
  await connectToDatabase();
  const doc = await ExpenseCategoryModel.create({
    userId: input.userId,
    name: input.name,
    icon: input.icon,
    color: input.color,
    sortOrder: input.sortOrder ?? 0,
  });
  return mapCategory(doc);
}

export async function getCategoriesForUser(userId: string): Promise<ExpenseCategory[]> {
  await connectToDatabase();
  const docs = await ExpenseCategoryModel.find({
    $or: [{ userId }, { userId: { $exists: false } }, { userId: null }],
    deletedAt: null,
  })
    .sort({ sortOrder: 1 })
    .lean();
  return docs.map(mapCategory);
}

export async function getCategoryById(id: string): Promise<ExpenseCategory | null> {
  await connectToDatabase();
  const doc = await ExpenseCategoryModel.findOne({
    _id: id,
    deletedAt: null,
  }).lean();
  return doc ? mapCategory(doc) : null;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ExpenseCategory | null> {
  await connectToDatabase();
  const doc = await ExpenseCategoryModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapCategory(doc) : null;
}

export async function deleteCategory(id: string): Promise<ExpenseCategory | null> {
  await connectToDatabase();
  const doc = await ExpenseCategoryModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapCategory(doc) : null;
}

export async function seedDefaultCategories(): Promise<void> {
  await connectToDatabase();
  const { DEFAULT_CATEGORIES } = await import("../constants");

  for (const c of DEFAULT_CATEGORIES) {
    await ExpenseCategoryModel.findOneAndUpdate(
      { name: c.name, userId: null },
      {
        $setOnInsert: {
          name: c.name,
          icon: c.icon,
          color: c.color,
          sortOrder: c.sortOrder,
          userId: null,
        },
      },
      { upsert: true },
    );
  }
}
