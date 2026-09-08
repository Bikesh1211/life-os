import { connectToDatabase } from "@/lib/mongodb";
import { TechSetupModel, TechSetupItemModel } from "@/lib/models/tech-gear";

export type Setup = any;
export type CreateSetupInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createSetup(input: CreateSetupInput) {
  await connectToDatabase();
  const doc = await TechSetupModel.create(input);
  return toPlain(doc);
}

export async function getSetupsForUser(userId: string) {
  await connectToDatabase();
  const docs = await TechSetupModel.find({ userId, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();
  return toPlainArray(docs);
}

export async function getSetupById(id: string, userId: string) {
  await connectToDatabase();
  const setup = await TechSetupModel.findOne({ _id: id, userId, deletedAt: null }).lean();
  if (!setup) return null;

  const items = await TechSetupItemModel.find({ setupId: id })
    .sort({ position: 1 })
    .lean();

  return { ...toPlain(setup), items: toPlainArray(items) };
}

export async function updateSetup(id: string, userId: string, input: Partial<CreateSetupInput>) {
  await connectToDatabase();
  const doc = await TechSetupModel.findOneAndUpdate(
    { _id: id, userId },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function deleteSetup(id: string, userId: string) {
  await connectToDatabase();
  const doc = await TechSetupModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return toPlain(doc);
}

export async function setSetupItems(setupId: string, itemIds: string[]) {
  await connectToDatabase();
  await TechSetupItemModel.deleteMany({ setupId });
  if (itemIds.length === 0) return [];
  const docs = await TechSetupItemModel.insertMany(
    itemIds.map((itemId, index) => ({ setupId, itemId, position: index })),
  );
  return toPlainArray(docs);
}
