import { pgTable, text, uuid, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("idx_tags_user").on(table.userId, table.deletedAt),
  }),
);

export const transactionTags = pgTable(
  "transaction_tags",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.transactionId, t.tagId] }),
  }),
);
