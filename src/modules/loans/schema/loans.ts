import { pgTable, text, uuid, timestamp, pgEnum, numeric, boolean, index } from "drizzle-orm/pg-core";
import { LOAN_DIRECTIONS, LOAN_STATUSES, INTEREST_TYPES, INSTALLMENT_FREQUENCIES } from "../constants";

export const loanDirectionEnum = pgEnum("loan_direction", LOAN_DIRECTIONS);
export const loanStatusEnum = pgEnum("loan_status", LOAN_STATUSES);
export const interestTypeEnum = pgEnum("interest_type", INTEREST_TYPES);
export const installmentFrequencyEnum = pgEnum("installment_frequency", INSTALLMENT_FREQUENCIES);

export const loans = pgTable(
  "loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    connectionId: uuid("connection_id"),
    direction: loanDirectionEnum("direction").notNull(),
    principalAmount: numeric("principal_amount").notNull(),
    currency: text("currency").default("NPR").notNull(),
    interestRate: numeric("interest_rate"),
    interestType: interestTypeEnum("interest_type").default("none").notNull(),
    totalPayable: numeric("total_payable"),
    loanDate: timestamp("loan_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    purpose: text("purpose"),
    notes: text("notes"),
    attachments: text("attachments").array().default([]).notNull(),
    status: loanStatusEnum("status").default("active").notNull(),
    installmentCount: numeric("installment_count"),
    installmentAmount: numeric("installment_amount"),
    installmentFrequency: installmentFrequencyEnum("installment_frequency"),
    accountId: uuid("account_id"),
    linkedEntityType: text("linked_entity_type"),
    linkedEntityId: text("linked_entity_id"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userStatusIdx: index("idx_loans_user_status").on(table.userId, table.status),
    userDirectionIdx: index("idx_loans_user_dir").on(table.userId, table.direction),
    dueDateIdx: index("idx_loans_due_date").on(table.dueDate),
    connectionIdx: index("idx_loans_connection").on(table.connectionId),
    pinnedIdx: index("idx_loans_pinned").on(table.userId, table.isPinned),
  }),
);
