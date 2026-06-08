import { createTag, getTagsForUser, updateTag, deleteTag, addTagToTransaction, removeTagFromTransaction } from "../repository/tags";
import { createTagSchema, updateTagSchema, type CreateTagParams, type UpdateTagParams } from "./validators";

export async function createExpenseTag(userId: string, params: CreateTagParams) {
  const validated = createTagSchema.parse(params);
  return createTag({ ...validated, userId });
}

export async function getExpenseTags(userId: string) {
  return getTagsForUser(userId);
}

export async function updateExpenseTag(id: string, userId: string, params: UpdateTagParams) {
  const validated = updateTagSchema.parse(params);
  return updateTag(id, userId, validated);
}

export async function deleteExpenseTag(id: string, userId: string) {
  return deleteTag(id, userId);
}

export async function attachTagToTransaction(transactionId: string, tagId: string) {
  return addTagToTransaction(transactionId, tagId);
}

export async function detachTagFromTransaction(transactionId: string, tagId: string) {
  return removeTagFromTransaction(transactionId, tagId);
}
