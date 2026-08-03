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
import { ACCOUNT_TYPES } from "../constants";

export const accountTypeEnum = pgEnum("account_type", ACCOUNT_TYPES);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    balance: numeric("balance").default("0").notNull(),
    currency: text("currency").default("NPR").notNull(),
    icon: text("icon"),
    color: text("color"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("idx_accounts_user").on(table.userId, table.deletedAt, table.createdAt),
  }),
);
