import { pgTable, text, uuid, timestamp, numeric, index } from "drizzle-orm/pg-core";
import { loans } from "./loans";

export const loanRepayments = pgTable(
  "loan_repayments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loanId: uuid("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
    amount: numeric("amount").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    paymentMethod: text("payment_method"),
    notes: text("notes"),
    receiptUrl: text("receipt_url"),
    installmentNumber: numeric("installment_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    loanIdx: index("idx_loan_repayments_loan").on(table.loanId, table.date.desc()),
  }),
);
