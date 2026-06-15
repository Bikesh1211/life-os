export const CLOTHING_CATEGORIES = [
  "tops",
  "bottoms",
  "footwear",
  "accessories",
  "outerwear",
  "dresses",
  "formal",
  "activewear",
  "sleepwear",
  "swimwear",
] as const;

export const CLOTHING_SUBCATEGORIES: Record<string, string[]> = {
  tops: ["t-shirt", "shirt", "polo", "hoodie", "sweater", "blazer", "tank top", "crop top"],
  bottoms: ["jeans", "trousers", "shorts", "joggers", "skirt", "leggings"],
  footwear: ["sneakers", "formal shoes", "sandals", "boots", "loafers", "heels", "flip-flops"],
  accessories: ["watch", "belt", "sunglasses", "jewelry", "cap", "bag", "scarf", "hat", "wallet", "tie"],
  outerwear: ["jacket", "coat", "raincoat", "vest", "parka", "windbreaker"],
  dresses: ["casual dress", "evening dress", "summer dress", "maxi dress", "midi dress"],
  formal: ["suit", "blazer", "dress shirt", "tuxedo", "formal trousers"],
  activewear: ["gym top", "gym shorts", "yoga pants", "track pants", "sports bra", "swimsuit"],
  sleepwear: ["pajamas", "night gown", "robe", "slippers"],
  swimwear: ["swimsuit", "trunks", "bikini", "cover-up"],
};

export const COLORS = [
  "black", "white", "gray", "navy", "blue", "light blue", "red", "burgundy",
  "green", "olive", "teal", "yellow", "orange", "pink", "purple", "brown",
  "beige", "cream", "coral", "maroon", "gold", "silver", "multicolor",
] as const;

export const SIZES = [
  "xs", "s", "m", "l", "xl", "xxl", "xxxl",
  "28", "30", "32", "34", "36", "38", "40",
  "6", "7", "8", "9", "10", "11", "12", "13",
  "one size",
] as const;

export const CONDITIONS = ["new", "excellent", "good", "fair", "worn"] as const;

export const SEASONS = ["spring", "summer", "autumn", "winter", "all-season"] as const;

export const OCCASIONS = [
  "casual", "office", "formal", "wedding", "party", "travel",
  "gym", "home", "date night", "seasonal", "festive",
] as const;

export const MOODS = [
  "classic", "casual", "chic", "edgy", "elegant", "fun",
  "minimal", "professional", "relaxed", "romantic", "sporty", "vintage",
] as const;

export const LAUNDRY_STATUS = [
  "ready", "laundry", "washing", "drying", "ironing", "stored",
] as const;

export const ITEM_SORT_OPTIONS = [
  "name", "newest", "oldest", "price-high", "price-low",
  "most-worn", "least-worn", "last-worn",
] as const;

export const DEFAULT_CURRENCY = "NPR";
