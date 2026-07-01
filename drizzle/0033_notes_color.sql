ALTER TABLE "notes" ADD COLUMN "color" text;--> statement-breakpoint
CREATE INDEX "idx_notes_color" ON "notes" USING btree ("user_id", "color");
