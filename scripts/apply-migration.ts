import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("Usage: npx tsx scripts/apply-migration.ts <migration-name>");
  console.error("  e.g. npx tsx scripts/apply-migration.ts 0018_memories_track_id_text");
  process.exit(1);
}

const filePath = resolve(__dirname, `../drizzle/${migrationName}.sql`);
const sql = readFileSync(filePath, "utf-8");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log(`Running migration: ${migrationName}...`);
  await db.execute(sql);
  console.log("Migration applied successfully.");
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
