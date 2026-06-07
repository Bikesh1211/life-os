import { readFileSync } from "fs";
import { db } from "@/core/database";

async function main() {
  const sql = readFileSync("drizzle/0003_gigantic_squadron_supreme.sql", "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      console.log("OK:", stmt.slice(0, 100));
    } catch (err: any) {
      console.error("FAIL:", err.message);
    }
  }
  console.log("Done.");
}

main().catch(console.error);
