import { config } from "dotenv";
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_URL not found"); process.exit(1); }

const { default: postgres } = await import("postgres");
const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });

try {
  const cols = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'routine_items' AND column_name = 'user_id'
  `;
  
  if (cols.length > 0) {
    console.log("Migration 0022 already applied — columns exist. Skipping.");
  } else {
    await sql.unsafe(`
      ALTER TABLE "routine_items" ALTER COLUMN "routine_id" DROP NOT NULL;
      ALTER TABLE "routine_items" ADD COLUMN "user_id" text;
      ALTER TABLE "routine_items" ADD COLUMN "category" text;
      ALTER TABLE "routine_items" ADD COLUMN "priority" text;
      ALTER TABLE "routine_items" ADD COLUMN "location" text;
      ALTER TABLE "routine_items" ADD COLUMN "date" text;
      ALTER TABLE "routine_items" ADD COLUMN "status" "routine_item_status";
    `);
    console.log("Migration 0022 applied successfully.");
  }
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
