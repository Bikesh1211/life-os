CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings', 'credit', 'cash', 'wallet', 'investment');
CREATE TYPE "public"."budget_period" AS ENUM('weekly', 'monthly', 'yearly', 'custom');
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'debit_card', 'credit_card', 'bank_transfer', 'digital_wallet', 'upi', 'paypal', 'crypto');
CREATE TYPE "public"."transaction_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom');
CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income', 'transfer');

CREATE TABLE "public"."accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "name" text NOT NULL,
    "type" "account_type" NOT NULL,
    "balance" numeric DEFAULT '0' NOT NULL,
    "currency" text DEFAULT 'NPR' NOT NULL,
    "icon" text,
    "color" text,
    "is_archived" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE "public"."expense_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text,
    "name" text NOT NULL,
    "icon" text,
    "color" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE "public"."transactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "account_id" uuid,
    "category_id" uuid,
    "type" "transaction_type" DEFAULT 'expense' NOT NULL,
    "amount" numeric NOT NULL,
    "currency" text DEFAULT 'NPR' NOT NULL,
    "merchant" text,
    "description" text,
    "payment_method" "payment_method",
    "transaction_date" timestamp with time zone NOT NULL,
    "location" text,
    "is_recurring" boolean DEFAULT false NOT NULL,
    "recurrence" "transaction_recurrence" DEFAULT 'none' NOT NULL,
    "recurrence_end_date" timestamp with time zone,
    "attachments" text[] DEFAULT '{}',
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE "public"."tags" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "name" text NOT NULL,
    "color" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

CREATE TABLE "public"."transaction_tags" (
    "transaction_id" uuid NOT NULL,
    "tag_id" uuid NOT NULL
);

CREATE TABLE "public"."budgets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "category_id" uuid NOT NULL,
    "amount" numeric NOT NULL,
    "period" "budget_period" DEFAULT 'monthly' NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id");
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");
ALTER TABLE "public"."transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id");
ALTER TABLE "public"."transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id");
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");

CREATE INDEX "transactions_user_id_idx" ON "public"."transactions" ("user_id");
CREATE INDEX "transactions_type_idx" ON "public"."transactions" ("type");
CREATE INDEX "transactions_category_id_idx" ON "public"."transactions" ("category_id");
CREATE INDEX "transactions_account_id_idx" ON "public"."transactions" ("account_id");
CREATE INDEX "transactions_date_idx" ON "public"."transactions" ("transaction_date");
CREATE INDEX "tags_user_id_idx" ON "public"."tags" ("user_id");
CREATE INDEX "budgets_user_id_idx" ON "public"."budgets" ("user_id");
CREATE INDEX "accounts_user_id_idx" ON "public"."accounts" ("user_id");
