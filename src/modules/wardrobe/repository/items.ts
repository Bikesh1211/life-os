import { connectToDatabase } from "@/lib/mongodb";
import { ClothingItemModel } from "@/lib/models/wardrobe";

export type ClothingItem = any;
export type CreateItemInput = any;

export type ItemFilters = {
  category?: string;
  condition?: string;
  season?: string;
  laundryStatus?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  sort?: string;
};

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createItem(input: CreateItemInput) {
  await connectToDatabase();
  const doc = await ClothingItemModel.create(input);
  return toPlain(doc);
}

export async function getItemsForUser(userId: string, filters?: ItemFilters) {
  await connectToDatabase();
  const filter: any = { userId, deletedAt: null };

  if (!filters?.isArchived) {
    filter.isArchived = false;
  }
  if (filters?.category) filter.category = filters.category;
  if (filters?.condition) filter.condition = filters.condition;
  if (filters?.season) filter.season = filters.season;
  if (filters?.laundryStatus) filter.laundryStatus = filters.laundryStatus;
  if (filters?.isFavorite !== undefined) filter.isFavorite = filters.isFavorite;
  if (filters?.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { brand: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  let sort: any = { createdAt: -1 };
  if (filters?.sort) {
    switch (filters.sort) {
      case "name": sort = { name: 1 }; break;
      case "newest": sort = { createdAt: -1 }; break;
      case "oldest": sort = { createdAt: 1 }; break;
      case "price-high": sort = { purchasePrice: -1 }; break;
      case "price-low": sort = { purchasePrice: 1 }; break;
      case "most-worn": sort = { wearCount: -1 }; break;
      case "least-worn": sort = { wearCount: 1 }; break;
      case "last-worn": sort = { lastWorn: -1 }; break;
    }
  }

  const docs = await ClothingItemModel.find(filter).sort(sort).lean();
  return toPlainArray(docs);
}

export async function getItemById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await ClothingItemModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>) {
  await connectToDatabase();
  const doc = await ClothingItemModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteItem(id: string, userId: string) {
  await connectToDatabase();
  const doc = await ClothingItemModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getDashboardStats(userId: string) {
  await connectToDatabase();
  const items = await ClothingItemModel.find({ userId, deletedAt: null }).lean();

  const totalItems = items.length;
  const favoriteItems = items.filter((i: any) => i.isFavorite).length;
  const needsLaundry = items.filter((i: any) => i.laundryStatus !== "ready").length;
  const totalValue = items.reduce((sum: number, i: any) => sum + (parseFloat(i.currentValue || "0")), 0);
  const totalSpent = items.reduce((sum: number, i: any) => sum + (parseFloat(i.purchasePrice || "0")), 0);

  const categoryBreakdown: Record<string, number> = {};
  const brandCount: Record<string, number> = {};
  let totalWearCount = 0;

  for (const item of items) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    if (item.brand) brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
    totalWearCount += item.wearCount ?? 0;
  }

  const topBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentlyAdded = items
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map(toPlain);
  const mostWorn = items
    .sort((a: any, b: any) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 8)
    .map(toPlain);

  return {
    totalItems,
    favoriteItems,
    needsLaundry,
    totalValue,
    totalSpent,
    totalWearCount,
    categoryBreakdown,
    topBrands,
    recentlyAdded,
    mostWorn,
  };
}
