import { connectToDatabase } from "@/lib/mongodb";
import { TechItemModel } from "@/lib/models/tech-gear";

export type TechItem = any;
export type CreateItemInput = any;

export type ItemFilters = {
  category?: string;
  condition?: string;
  ownershipStatus?: string;
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
  const doc = await TechItemModel.create(input);
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
  if (filters?.ownershipStatus) filter.ownershipStatus = filters.ownershipStatus;
  if (filters?.isFavorite !== undefined) filter.isFavorite = filters.isFavorite;
  if (filters?.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { brand: { $regex: filters.search, $options: "i" } },
      { model: { $regex: filters.search, $options: "i" } },
      { notes: { $regex: filters.search, $options: "i" } },
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
    }
  }

  const docs = await TechItemModel.find(filter).sort(sort).lean();
  return toPlainArray(docs);
}

export async function getItemById(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TechItemModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  return toPlain(doc);
}

export async function updateItem(id: string, userId: string, input: Partial<CreateItemInput>) {
  await connectToDatabase();
  const doc = await TechItemModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteItem(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TechItemModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function getDashboardStats(userId: string) {
  await connectToDatabase();
  const items = await TechItemModel.find({ userId, deletedAt: null }).lean();

  const totalItems = items.length;
  const totalValue = items.reduce((sum: number, i: any) => sum + (parseFloat(i.purchasePrice || "0")), 0);
  const favoriteItems = items.filter((i: any) => i.isFavorite).length;
  const loanedItems = items.filter((i: any) => i.ownershipStatus === "loaned-out").length;
  const brokenItems = items.filter((i: any) => i.condition === "broken" || i.condition === "repairing").length;
  const warrantyExpiring = items.filter((i: any) => {
    if (!i.warrantyExpiry) return false;
    const daysLeft = (new Date(i.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft < 90;
  }).length;

  const categoryBreakdown: Record<string, number> = {};
  const brandCount: Record<string, number> = {};
  for (const item of items) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    if (item.brand) brandCount[item.brand] = (brandCount[item.brand] || 0) + 1;
  }

  const topBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentlyAdded = items
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map(toPlain);

  return {
    totalItems,
    totalValue,
    favoriteItems,
    loanedItems,
    brokenItems,
    warrantyExpiring,
    categoryBreakdown,
    topBrands,
    recentlyAdded,
  };
}
