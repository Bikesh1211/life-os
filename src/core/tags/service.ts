import { z } from "zod";
import { getCurrentUserId } from "@/core/auth";
import * as tagsRepo from "./repository";

export async function createTag(input: unknown) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  const data = z.object({ name: z.string().min(1).max(50), color: z.string().optional() }).parse(input);
  return tagsRepo.createTag({ ...data, userId });
}

export async function getTagsForUser() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return tagsRepo.getTagsForUser(userId);
}

export async function deleteTag(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return tagsRepo.deleteTag(id, userId);
}

export async function setEntityTags(tagIds: string[], entityId: string, entityType: string) {
  return tagsRepo.setEntityTags(tagIds, entityId, entityType);
}

export async function getEntityTagIds(entityId: string, entityType: string) {
  return tagsRepo.getEntityTagIds(entityId, entityType);
}
