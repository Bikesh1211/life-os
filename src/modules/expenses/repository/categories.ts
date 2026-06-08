import { db } from "@/core/database";
import { expenseCategories } from "../schema/categories";
import { eq, and, isNull, or, asc } from "drizzle-orm";

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type CreateCategoryInput = typeof expenseCategories.$inferInsert;
export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "id">>;

export async function createCategory(input: CreateCategoryInput) {
  const [category] = await db.insert(expenseCategories).values(input).returning();
  return category;
}

export async function getCategoriesForUser(userId: string) {
  return db
    .select()
    .from(expenseCategories)
    .where(
      and(
        or(eq(expenseCategories.userId, userId), isNull(expenseCategories.userId)),
        isNull(expenseCategories.deletedAt),
      ),
    )
    .orderBy(asc(expenseCategories.sortOrder));
}

export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(expenseCategories)
    .where(and(eq(expenseCategories.id, id), isNull(expenseCategories.deletedAt)));
  return category ?? null;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const [category] = await db
    .update(expenseCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(expenseCategories.id, id), isNull(expenseCategories.deletedAt)))
    .returning();
  return category ?? null;
}

export async function deleteCategory(id: string) {
  const [category] = await db
    .update(expenseCategories)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(expenseCategories.id, id), isNull(expenseCategories.deletedAt)))
    .returning();
  return category ?? null;
}

export async function seedDefaultCategories() {
  const existing = await db
    .select()
    .from(expenseCategories)
    .where(isNull(expenseCategories.userId))
    .limit(1);

  if (existing.length > 0) return;

  const { DEFAULT_CATEGORIES } = await import("../constants");
  await db.insert(expenseCategories).values(
    DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      icon: c.icon,
      color: c.color,
      sortOrder: c.sortOrder,
      userId: null,
    })),
  );
}
