import * as itemsRepo from "../repository/items";
import * as outfitsRepo from "../repository/outfits";
import * as wearRepo from "../repository/wear-history";
import * as tagsRepo from "../repository/tags";
import { createItemSchema, updateItemSchema, createOutfitSchema, updateOutfitSchema, createTagSchema, logWearSchema } from "./validators";

function stripNulls<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== null && v !== "")) as Partial<T>;
}

export async function createClothingItem(userId: string, input: unknown) {
  const data = createItemSchema.parse(stripNulls(input as Record<string, unknown>));
  const item = await itemsRepo.createItem({ ...data, userId, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined });
  if (data.tagIds?.length) {
    await tagsRepo.setItemTags(item.id, data.tagIds);
  }
  return item;
}

export async function getClothingItems(userId: string, filters?: itemsRepo.ItemFilters) {
  return itemsRepo.getItemsForUser(userId, filters);
}

export async function getClothingItem(userId: string, id: string) {
  const item = await itemsRepo.getItemById(id, userId);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function updateClothingItem(userId: string, id: string, input: unknown) {
  const data = updateItemSchema.parse(stripNulls(input as Record<string, unknown>));
  const updateData = {
    ...data,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
  };
  const item = await itemsRepo.updateItem(id, userId, updateData);
  if (data.tagIds !== undefined) {
    await tagsRepo.setItemTags(id, data.tagIds);
  }
  if (!item) throw new Error("Item not found");
  return item;
}

export async function deleteClothingItem(userId: string, id: string) {
  const item = await itemsRepo.deleteItem(id, userId);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function getDashboardStats(userId: string) {
  return itemsRepo.getDashboardStats(userId);
}

export async function createOutfit(userId: string, input: unknown) {
  const data = createOutfitSchema.parse(stripNulls(input as Record<string, unknown>));
  const outfit = await outfitsRepo.createOutfit({ ...data, userId });
  if (data.itemIds?.length) {
    await outfitsRepo.setOutfitItems(outfit.id, data.itemIds);
  }
  return outfit;
}

export async function getOutfits(userId: string) {
  return outfitsRepo.getOutfitsForUser(userId);
}

export async function getOutfit(userId: string, id: string) {
  const outfit = await outfitsRepo.getOutfitById(id, userId);
  if (!outfit) throw new Error("Outfit not found");
  return outfit;
}

export async function updateOutfit(userId: string, id: string, input: unknown) {
  const data = updateOutfitSchema.parse(stripNulls(input as Record<string, unknown>));
  const outfit = await outfitsRepo.updateOutfit(id, userId, data);
  if (!outfit) throw new Error("Outfit not found");
  if (data.itemIds !== undefined) {
    await outfitsRepo.setOutfitItems(id, data.itemIds);
  }
  return outfit;
}

export async function deleteOutfit(userId: string, id: string) {
  const outfit = await outfitsRepo.deleteOutfit(id, userId);
  if (!outfit) throw new Error("Outfit not found");
  return outfit;
}

export async function logWearHistory(userId: string, input: unknown) {
  const data = logWearSchema.parse(stripNulls(input as Record<string, unknown>));
  return wearRepo.logWear({ ...data, userId, wornDate: data.wornDate });
}

export async function getWearHistory(userId: string, limit?: number) {
  return wearRepo.getWearHistory(userId, limit);
}

export async function getItemWearHistory(itemId: string) {
  return wearRepo.getWearHistoryForItem(itemId);
}

export async function createTag(userId: string, input: unknown) {
  const data = createTagSchema.parse(stripNulls(input as Record<string, unknown>));
  return tagsRepo.createTag({ ...data, userId });
}

export async function getTags(userId: string) {
  return tagsRepo.getTagsForUser(userId);
}

export async function deleteTag(userId: string, id: string) {
  return tagsRepo.deleteTag(id, userId);
}
