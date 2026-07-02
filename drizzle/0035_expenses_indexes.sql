CREATE INDEX "idx_transactions_spending" ON "public"."transactions" ("user_id", "type", "transaction_date" DESC) WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_transactions_search" ON "public"."transactions" ("user_id", "merchant" DESC) WHERE "deleted_at" IS NULL AND "merchant" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_user_name" ON "public"."tags" ("user_id", "name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_name_user" ON "public"."expense_categories" ("user_id", "name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_budgets_category_period" ON "public"."budgets" ("user_id", "category_id", "period") WHERE "deleted_at" IS NULL;
