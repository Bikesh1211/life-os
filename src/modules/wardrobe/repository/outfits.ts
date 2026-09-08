import { connectToDatabase } from "@/lib/mongodb";
import { OutfitModel, OutfitItemModel } from "@/lib/models/wardrobe";

export type Outfit = any;
export type CreateOutfitInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createOutfit(input: CreateOutfitInput) {
  await connectToDatabase();
  const doc = await OutfitModel.create(input);
  return toPlain(doc);
}

export async function getOutfitsForUser(userId: string) {
  await connectToDatabase();
  const docs = await OutfitModel.find({ userId, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getOutfitById(id: string, userId: string) {
  await connectToDatabase();
  const outfit = await OutfitModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  if (!outfit) return null;

  const items = await OutfitItemModel.find({ outfitId: id })
    .sort({ position: 1 })
    .lean();

  return { ...toPlain(outfit), items: toPlainArray(items) };
}

export async function updateOutfit(id: string, userId: string, input: Partial<CreateOutfitInput>) {
  await connectToDatabase();
  const doc = await OutfitModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteOutfit(id: string, userId: string) {
  await connectToDatabase();
  const doc = await OutfitModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function setOutfitItems(outfitId: string, itemIds: string[]) {
  await connectToDatabase();
  await OutfitItemModel.deleteMany({ outfitId });
  if (itemIds.length === 0) return [];
  const docs = await OutfitItemModel.insertMany(
    itemIds.map((itemId, index) => ({ outfitId, itemId, position: index })),
  );
  return toPlainArray(docs);
}
