import { pgTable, text, uuid, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const feedbackEntries = pgTable(
  "feedback_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    category: text("category").notNull().default("general"),
    message: text("message").notNull(),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    pageUrl: text("page_url"),
    userAgent: text("user_agent"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_feedback_user").on(table.userId),
    readIdx: index("idx_feedback_read").on(table.readAt),
  }),
);
