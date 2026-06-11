export { clothingItems, clothingCategoryEnum, clothingConditionEnum, clothingSeasonEnum, clothingSizeEnum } from "./schema/items";
export { clothingImages } from "./schema/images";
export { outfits, outfitOccasionEnum, outfitMoodEnum } from "./schema/outfits";
export { outfitItems } from "./schema/outfit-items";
export { wearHistory } from "./schema/wear-history";
export { laundryItems, laundryStatusEnum } from "./schema/laundry";
export { wishlistItems } from "./schema/wishlist";
export { packingLists, packingListItems } from "./schema/packing";
export { wardrobeTags, wardrobeItemTags } from "./schema/tags";

export {
  createClothingItem,
  getClothingItems,
  getClothingItem,
  updateClothingItem,
  deleteClothingItem,
  getDashboardStats,
  createOutfit,
  getOutfits,
  getOutfit,
  updateOutfit,
  deleteOutfit,
  logWearHistory,
  getWearHistory,
  getItemWearHistory,
  createTag,
  getTags,
  deleteTag,
} from "./service/index";

export type {
  CreateItemParams,
  UpdateItemParams,
  CreateOutfitParams,
  UpdateOutfitParams,
  CreateTagParams,
  LogWearParams,
} from "./service/validators";

export type {
  ClothingItem,
  CreateItemInput,
  ItemFilters,
} from "./repository/items";

export type {
  Outfit,
  CreateOutfitInput,
} from "./repository/outfits";

export {
  createItemSchema,
  updateItemSchema,
  createOutfitSchema,
  updateOutfitSchema,
  createTagSchema,
} from "./service/validators";

export { CLOTHING_CATEGORIES, CLOTHING_SUBCATEGORIES, COLORS, SIZES, CONDITIONS, SEASONS, OCCASIONS, MOODS, LAUNDRY_STATUS, ITEM_SORT_OPTIONS, DEFAULT_CURRENCY } from "./constants";
