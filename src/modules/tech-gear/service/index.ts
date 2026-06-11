import * as itemsRepo from "../repository/items";
import * as setupsRepo from "../repository/setups";
import * as maintenanceRepo from "../repository/maintenance";
import { createItemSchema, updateItemSchema, createSetupSchema, updateSetupSchema, createMaintenanceSchema } from "./validators";

function stripNulls<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== null && v !== "")) as Partial<T>;
}

export async function createTechItem(userId: string, input: unknown) {
  const data = createItemSchema.parse(stripNulls(input as Record<string, unknown>));
  return itemsRepo.createItem({
    ...data,
    userId,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
    loanDate: data.loanDate ? new Date(data.loanDate) : undefined,
    expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : undefined,
  });
}

export async function getTechItems(userId: string, filters?: itemsRepo.ItemFilters) {
  return itemsRepo.getItemsForUser(userId, filters);
}

export async function getTechItem(userId: string, id: string) {
  const item = await itemsRepo.getItemById(id, userId);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function updateTechItem(userId: string, id: string, input: unknown) {
  const data = updateItemSchema.parse(stripNulls(input as Record<string, unknown>));
  const updateData = {
    ...data,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
    warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
    loanDate: data.loanDate ? new Date(data.loanDate) : undefined,
    expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : undefined,
  };
  const item = await itemsRepo.updateItem(id, userId, updateData);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function deleteTechItem(userId: string, id: string) {
  const item = await itemsRepo.deleteItem(id, userId);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function getDashboardStats(userId: string) {
  return itemsRepo.getDashboardStats(userId);
}

export async function createSetup(userId: string, input: unknown) {
  const data = createSetupSchema.parse(stripNulls(input as Record<string, unknown>));
  const setup = await setupsRepo.createSetup({ ...data, userId });
  if (data.itemIds?.length) {
    await setupsRepo.setSetupItems(setup.id, data.itemIds);
  }
  return setup;
}

export async function getSetups(userId: string) {
  return setupsRepo.getSetupsForUser(userId);
}

export async function getSetup(userId: string, id: string) {
  const setup = await setupsRepo.getSetupById(id, userId);
  if (!setup) throw new Error("Setup not found");
  return setup;
}

export async function updateSetup(userId: string, id: string, input: unknown) {
  const data = updateSetupSchema.parse(stripNulls(input as Record<string, unknown>));
  const setup = await setupsRepo.updateSetup(id, userId, data);
  if (!setup) throw new Error("Setup not found");
  if (data.itemIds !== undefined) {
    await setupsRepo.setSetupItems(id, data.itemIds);
  }
  return setup;
}

export async function deleteSetup(userId: string, id: string) {
  const setup = await setupsRepo.deleteSetup(id, userId);
  if (!setup) throw new Error("Setup not found");
  return setup;
}

export async function createMaintenance(userId: string, input: unknown) {
  const data = createMaintenanceSchema.parse(stripNulls(input as Record<string, unknown>));
  return maintenanceRepo.createMaintenance({ ...data, userId, date: data.date ? new Date(data.date) : new Date() });
}

export async function getMaintenance(itemId: string) {
  return maintenanceRepo.getMaintenanceForItem(itemId);
}
