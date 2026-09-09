import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseTag as ExpenseTagModel, TransactionTag as TransactionTagModel } from "@/lib/models/expenses";

export type Tag = {
  id: string;
  userId: string;
  name: string;
  color?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTagInput = {
  userId: string;
  name: string;
  color?: string;
};

export type UpdateTagInput = Partial<Omit<CreateTagInput, "userId">>;

function mapTag(doc: any): Tag {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    color: doc.color,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  await connectToDatabase();
  const doc = await ExpenseTagModel.create({
    userId: input.userId,
    name: input.name,
    color: input.color,
  });
  return mapTag(doc);
}

export async function getTagsForUser(userId: string): Promise<Tag[]> {
  await connectToDatabase();
  const docs = await ExpenseTagModel.find({ userId, deletedAt: null })
    .sort({ name: 1 })
    .lean();
  return docs.map(mapTag);
}

export async function getTagById(id: string, userId: string): Promise<Tag | null> {
  await connectToDatabase();
  const doc = await ExpenseTagModel.findOne({
    _id: id,
    userId,
    deletedAt: null,
  }).lean();
  return doc ? mapTag(doc) : null;
}

export async function updateTag(
  id: string,
  userId: string,
  input: UpdateTagInput,
): Promise<Tag | null> {
  await connectToDatabase();
  const doc = await ExpenseTagModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...input, updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapTag(doc) : null;
}

export async function deleteTag(id: string, userId: string): Promise<Tag | null> {
  await connectToDatabase();
  const doc = await ExpenseTagModel.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date(), updatedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? mapTag(doc) : null;
}

export async function addTagToTransaction(
  transactionId: string,
  tagId: string,
): Promise<{ id: string; transactionId: string; tagId: string }> {
  await connectToDatabase();
  const doc = await TransactionTagModel.findOneAndUpdate(
    { transactionId, tagId },
    { $setOnInsert: { transactionId, tagId } },
    { upsert: true, new: true },
  ).lean();
  return {
    id: doc._id.toString(),
    transactionId: doc.transactionId.toString(),
    tagId: doc.tagId.toString(),
  };
}

export async function removeTagFromTransaction(
  transactionId: string,
  tagId: string,
): Promise<void> {
  await connectToDatabase();
  await TransactionTagModel.deleteOne({ transactionId, tagId });
}

export async function getTagsForTransaction(
  transactionId: string,
): Promise<Tag[]> {
  await connectToDatabase();

  const results = await TransactionTagModel.find({ transactionId }).lean();
  if (results.length === 0) return [];

  const tagIds = results.map((r: any) => r.tagId);
  const tagDocs = await ExpenseTagModel.find({ _id: { $in: tagIds } }).lean();
  return tagDocs.map(mapTag);
}
