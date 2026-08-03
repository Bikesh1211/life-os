import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { expenseCategories } from "./categories";
import { PAYMENT_METHODS, TRANSACTION_TYPES, RECURRENCE_OPTIONS } from "../constants";

export const transactionTypeEnum = pgEnum("transaction_type", TRANSACTION_TYPES);
export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);
export const recurrenceEnum = pgEnum("transaction_recurrence", RECURRENCE_OPTIONS);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    accountId: uuid("account_id").references(() => accounts.id),
    categoryId: uuid("category_id").references(() => expenseCategories.id),
    type: transactionTypeEnum("type").default("expense").notNull(),
    amount: numeric("amount").notNull(),
    currency: text("currency").default("NPR").notNull(),
    merchant: text("merchant"),
    description: text("description"),
    paymentMethod: paymentMethodEnum("payment_method"),
    transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
    location: text("location"),
    isRecurring: boolean("is_recurring").default(false).notNull(),
    recurrence: recurrenceEnum("recurrence").default("none").notNull(),
    recurrenceEndDate: timestamp("recurrence_end_date", { withTimezone: true }),
    attachments: text("attachments").array().default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userTypeDateIdx: index("idx_transactions_user_type_date").on(
      table.userId,
      table.type,
      table.transactionDate.desc(),
    ),
    userDateIdx: index("idx_transactions_user_date").on(table.userId, table.transactionDate.desc()),
    categoryIdx: index("idx_transactions_category").on(table.categoryId),
    accountIdx: index("idx_transactions_account").on(table.accountId),
  }),
);
