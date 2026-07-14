import { pgTable, text, uuid, timestamp, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
import { loans } from "./loans";
import { LOAN_EVENT_TYPES } from "../constants";

export const loanEventTypeEnum = pgEnum("loan_event_type", LOAN_EVENT_TYPES);

export const loanEvents = pgTable(
  "loan_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loanId: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
    eventType: loanEventTypeEnum("event_type").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    loanIdx: index("idx_loan_events_loan").on(table.loanId, table.createdAt.desc()),
  }),
);
