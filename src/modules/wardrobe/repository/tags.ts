import { connectToDatabase } from "@/lib/mongodb";
import { WardrobeTagModel, WardrobeItemTagModel } from "@/lib/models/wardrobe";

export type Tag = any;
export type CreateTagInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createTag(input: CreateTagInput) {
  await connectToDatabase();
  const doc = await WardrobeTagModel.create(input);
  return toPlain(doc);
}

export async function getTagsForUser(userId: string) {
  await connectToDatabase();
  const docs = await WardrobeTagModel.find({ userId }).lean();
  return toPlainArray(docs);
}

export async function deleteTag(id: string, userId: string) {
  await connectToDatabase();
  await WardrobeItemTagModel.deleteMany({ tagId: id });
  const doc = await WardrobeTagModel.findOneAndDelete({ _id: id, userId }).lean();
  return toPlain(doc);
}

export async function setItemTags(itemId: string, tagIds: string[]) {
  await connectToDatabase();
  await WardrobeItemTagModel.deleteMany({ itemId });
  if (tagIds.length === 0) return [];
  const docs = await WardrobeItemTagModel.insertMany(
    tagIds.map((tagId) => ({ itemId, tagId })),
  );
  return toPlainArray(docs);
}

export async function getItemTagIds(itemId: string) {
  await connectToDatabase();
  const rows = await WardrobeItemTagModel.find({ itemId }).lean();
  return rows.map((r: any) => r.tagId);
}
