import { connectToDatabase } from "@/lib/mongodb";
import { CoreTagModel, CoreTaggingModel } from "@/lib/models/core";

export type Tag = { id: string; userId: string; name: string; color: string | null; createdAt: Date };
export type CreateTagInput = { userId: string; name: string; color?: string };

export async function createTag(input: CreateTagInput) {
  await connectToDatabase();
  const tag = await CoreTagModel.create(input);
  return { id: tag._id.toString(), userId: tag.userId, name: tag.name, color: tag.color, createdAt: tag.createdAt };
}

export async function getTagsForUser(userId: string) {
  await connectToDatabase();
  const tags = await CoreTagModel.find({ userId }).lean();
  return tags.map(t => ({ id: t._id.toString(), userId: t.userId, name: t.name, color: t.color, createdAt: t.createdAt }));
}

export async function deleteTag(id: string, userId: string) {
  await connectToDatabase();
  await CoreTaggingModel.deleteMany({ tagId: id });
  const tag = await CoreTagModel.findOneAndDelete({ _id: id, userId });
  if (!tag) return null;
  return { id: tag._id.toString(), userId: tag.userId, name: tag.name, color: tag.color, createdAt: tag.createdAt };
}

export async function setEntityTags(tagIds: string[], entityId: string, entityType: string) {
  await connectToDatabase();
  await CoreTaggingModel.deleteMany({ entityId, entityType });
  if (tagIds.length === 0) return [];
  const docs = await CoreTaggingModel.insertMany(
    tagIds.map(tagId => ({ tagId, entityId, entityType }))
  );
  return docs.map(d => ({ id: d._id.toString(), tagId: d.tagId.toString(), entityId: d.entityId, entityType: d.entityType, createdAt: d.createdAt }));
}

export async function getEntityTagIds(entityId: string, entityType: string) {
  await connectToDatabase();
  const rows = await CoreTaggingModel.find({ entityId, entityType }).select("tagId").lean();
  return rows.map(r => r.tagId.toString());
}
