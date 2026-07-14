export const LOAN_DIRECTIONS = ["lent", "borrowed"] as const;

export const LOAN_STATUSES = ["active", "partially_paid", "fully_paid", "cancelled", "disputed"] as const;

export const INTEREST_TYPES = ["none", "simple", "compound"] as const;

export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "upi",
  "digital_wallet",
  "credit_card",
  "debit_card",
  "paypal",
  "crypto",
  "other",
] as const;

export const INSTALLMENT_FREQUENCIES = ["weekly", "monthly", "quarterly", "yearly"] as const;

export const LOAN_EVENT_TYPES = [
  "created",
  "updated",
  "repayment_added",
  "status_changed",
  "attachment_uploaded",
  "reminder_sent",
  "loan_closed",
] as const;

export const LOAN_SORT_OPTIONS = [
  "newest",
  "oldest",
  "amount_high",
  "amount_low",
  "due_soon",
  "overdue",
] as const;

export const DEFAULT_CURRENCY = "NPR";
