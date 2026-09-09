import { connectToDatabase } from "@/lib/mongodb";
import { TechMaintenanceLogModel } from "@/lib/models/tech-gear";

export type MaintenanceEntry = any;
export type CreateMaintenanceInput = any;

function toPlain(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id.toString() };
}

function toPlainArray(docs: any[]) {
  return docs.map(toPlain);
}

export async function createMaintenance(input: CreateMaintenanceInput) {
  await connectToDatabase();
  const doc = await TechMaintenanceLogModel.create(input);
  return toPlain(doc);
}

export async function getMaintenanceForItem(itemId: string) {
  await connectToDatabase();
  const docs = await TechMaintenanceLogModel.find({ itemId })
    .sort({ date: -1 })
    .lean();
  return toPlainArray(docs);
}
