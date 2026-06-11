import { z } from "zod";
import { TECH_CATEGORIES, OWNERSHIP_STATUSES, CONDITIONS } from "../constants";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  brand: z.string().max(100).optional(),
  model: z.string().max(200).optional(),
  category: z.enum(TECH_CATEGORIES),
  serialNumber: z.string().max(200).optional(),
  color: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  warrantyProvider: z.string().max(200).optional(),
  ownershipStatus: z.enum(OWNERSHIP_STATUSES).optional().default("owned"),
  condition: z.enum(CONDITIONS).optional().default("good"),
  specifications: z.record(z.string()).optional().default({}),
  loanedTo: z.string().max(200).optional(),
  loanDate: z.string().datetime().optional(),
  expectedReturnDate: z.string().datetime().optional(),
  isFavorite: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional(),
  isArchived: z.boolean().optional().default(false),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(200).optional(),
  category: z.enum(TECH_CATEGORIES).optional(),
  serialNumber: z.string().max(200).optional(),
  color: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyExpiry: z.string().datetime().optional(),
  warrantyProvider: z.string().max(200).optional(),
  ownershipStatus: z.enum(OWNERSHIP_STATUSES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  specifications: z.record(z.string()).optional(),
  loanedTo: z.string().max(200).optional(),
  loanDate: z.string().datetime().optional(),
  expectedReturnDate: z.string().datetime().optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  isArchived: z.boolean().optional(),
});

export const createSetupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  isFavorite: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional(),
  itemIds: z.array(z.string().uuid()).optional(),
});

export const updateSetupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  itemIds: z.array(z.string().uuid()).optional(),
});

export const createMaintenanceSchema = z.object({
  itemId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  date: z.string().datetime().optional(),
  cost: z.string().optional(),
  provider: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateItemParams = z.infer<typeof createItemSchema>;
export type UpdateItemParams = z.infer<typeof updateItemSchema>;
export type CreateSetupParams = z.infer<typeof createSetupSchema>;
export type UpdateSetupParams = z.infer<typeof updateSetupSchema>;
export type CreateMaintenanceParams = z.infer<typeof createMaintenanceSchema>;
