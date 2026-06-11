import { z } from "zod";
import { CLOTHING_CATEGORIES, CONDITIONS, SEASONS, SIZES, COLORS, OCCASIONS, MOODS, LAUNDRY_STATUS } from "../constants";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(CLOTHING_CATEGORIES),
  subcategory: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  color: z.string().optional(),
  size: z.enum(SIZES).optional(),
  material: z.string().max(200).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.string().optional().refine(v => v === undefined || /^\d+(\.\d+)?$/.test(v), "Must be a valid number"),
  currentValue: z.string().optional().refine(v => v === undefined || /^\d+(\.\d+)?$/.test(v), "Must be a valid number"),
  condition: z.enum(CONDITIONS).optional().default("good"),
  season: z.enum(SEASONS).optional().default("all-season"),
  isFavorite: z.boolean().optional().default(false),
  laundryStatus: z.enum(LAUNDRY_STATUS).optional().default("ready"),
  isArchived: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(CLOTHING_CATEGORIES).optional(),
  subcategory: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  color: z.string().optional(),
  size: z.enum(SIZES).optional(),
  material: z.string().max(200).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.string().optional().refine(v => v === undefined || /^\d+(\.\d+)?$/.test(v), "Must be a valid number"),
  currentValue: z.string().optional().refine(v => v === undefined || /^\d+(\.\d+)?$/.test(v), "Must be a valid number"),
  condition: z.enum(CONDITIONS).optional(),
  season: z.enum(SEASONS).optional(),
  isFavorite: z.boolean().optional(),
  laundryStatus: z.enum(LAUNDRY_STATUS).optional(),
  isArchived: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const createOutfitSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  occasion: z.enum(OCCASIONS).optional(),
  season: z.string().optional(),
  mood: z.enum(MOODS).optional(),
  isFavorite: z.boolean().optional().default(false),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  itemIds: z.array(z.string().uuid()).optional(),
});

export const updateOutfitSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  occasion: z.enum(OCCASIONS).optional(),
  season: z.string().optional(),
  mood: z.enum(MOODS).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  itemIds: z.array(z.string().uuid()).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().optional(),
});

export const logWearSchema = z.object({
  itemId: z.string().uuid(),
  wornDate: z.string(),
  note: z.string().max(500).optional(),
});

export const createWishlistSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  category: z.string().optional(),
  estimatedPrice: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional().default(3),
  url: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const createPackingListSchema = z.object({
  name: z.string().min(1).max(200),
  destination: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    name: z.string().min(1),
    itemId: z.string().uuid().optional(),
    quantity: z.number().int().min(1).optional().default(1),
    category: z.string().optional(),
  })).optional(),
});

export type CreateItemParams = z.infer<typeof createItemSchema>;
export type UpdateItemParams = z.infer<typeof updateItemSchema>;
export type CreateOutfitParams = z.infer<typeof createOutfitSchema>;
export type UpdateOutfitParams = z.infer<typeof updateOutfitSchema>;
export type CreateTagParams = z.infer<typeof createTagSchema>;
export type LogWearParams = z.infer<typeof logWearSchema>;
export type CreateWishlistParams = z.infer<typeof createWishlistSchema>;
export type CreatePackingListParams = z.infer<typeof createPackingListSchema>;
