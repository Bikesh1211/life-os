import { defineConfig } from "drizzle-kit";
import { parse } from "url";

const dbUrl = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./src/modules/**/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    ssl: "require",
  },
});
