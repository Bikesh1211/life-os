ALTER TABLE "routine_items" ALTER COLUMN "routine_id" DROP NOT NULL;

ALTER TABLE "routine_items" ADD COLUMN "user_id" text;
ALTER TABLE "routine_items" ADD COLUMN "category" text;
ALTER TABLE "routine_items" ADD COLUMN "priority" text;
ALTER TABLE "routine_items" ADD COLUMN "location" text;
ALTER TABLE "routine_items" ADD COLUMN "date" text;
ALTER TABLE "routine_items" ADD COLUMN "status" "routine_item_status";
