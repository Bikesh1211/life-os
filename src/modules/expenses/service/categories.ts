import {
  createCategory,
  getCategoriesForUser,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from "../repository/categories";

export async function ensureDefaultCategories() {
  await seedDefaultCategories();
}

export async function getExpenseCategories(userId: string) {
  await ensureDefaultCategories();
  return getCategoriesForUser(userId);
}

export async function getExpenseCategory(id: string) {
  return getCategoryById(id);
}
