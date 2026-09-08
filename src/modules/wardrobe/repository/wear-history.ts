import { connectToDatabase } from "@/lib/mongodb";
import { WearHistoryModel, ClothingItemModel } from "@/lib/models/wardrobe";

export type WearEntry = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function logWear(input: { userId: string; itemId: string; wornDate: Date; outfitId?: string | null; notes?: string | null }) {
  await connectToDatabase();
  const doc = await WearHistoryModel.create(input);

  await ClothingItemModel.findOneAndUpdate(
    { _id: input.itemId },
    {
      $inc: { wearCount: 1 },
      $set: { lastWorn: new Date(input.wornDate), updatedAt: new Date() },
    },
  );

  return toPlain(doc);
}

export async function getWearHistory(userId: string, limit = 50) {
  await connectToDatabase();
  const docs = await WearHistoryModel.find({ userId })
    .sort({ wornDate: -1 })
    .limit(limit)
    .lean();
  return toPlainArray(docs);
}

export async function getWearHistoryForItem(itemId: string) {
  await connectToDatabase();
  const docs = await WearHistoryModel.find({ itemId })
    .sort({ wornDate: -1 })
    .lean();
  return toPlainArray(docs);
}
