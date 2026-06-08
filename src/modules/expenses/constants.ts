export const DEFAULT_CURRENCY = "NPR";

export const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "IconToolsKitchen2", color: "#FF6B6B", sortOrder: 0 },
  { name: "Transportation", icon: "IconCar", color: "#4ECDC4", sortOrder: 1 },
  { name: "Shopping", icon: "IconShoppingBag", color: "#FFD93D", sortOrder: 2 },
  { name: "Entertainment", icon: "IconDeviceGamepad2", color: "#A78BFA", sortOrder: 3 },
  { name: "Health", icon: "IconHeart", color: "#F472B6", sortOrder: 4 },
  { name: "Education", icon: "IconBook", color: "#60A5FA", sortOrder: 5 },
  { name: "Bills", icon: "IconReceipt", color: "#F97316", sortOrder: 6 },
  { name: "Travel", icon: "IconPlane", color: "#34D399", sortOrder: 7 },
  { name: "Housing", icon: "IconHome", color: "#FB923C", sortOrder: 8 },
  { name: "Investments", icon: "IconTrendingUp", color: "#818CF8", sortOrder: 9 },
  { name: "Gifts", icon: "IconGift", color: "#E879F9", sortOrder: 10 },
  { name: "Other", icon: "IconDots", color: "#9CA3AF", sortOrder: 11 },
] as const;

export const PAYMENT_METHODS = [
  "cash",
  "debit_card",
  "credit_card",
  "bank_transfer",
  "digital_wallet",
  "upi",
  "paypal",
  "crypto",
] as const;

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit",
  "cash",
  "wallet",
  "investment",
] as const;

export const TRANSACTION_TYPES = ["expense", "income", "transfer"] as const;

export const BUDGET_PERIODS = ["weekly", "monthly", "yearly", "custom"] as const;

export const RECURRENCE_OPTIONS = ["none", "daily", "weekly", "monthly", "yearly", "custom"] as const;
