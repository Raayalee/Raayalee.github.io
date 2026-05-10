import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const schemaPath = path.join(rootDir, "sql", "schema.sql");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const shouldUseSsl =
  process.env.PGSSL === "true" || process.env.PGSSL === "1" || process.env.NODE_ENV === "production";

const schemaSql = await readFile(schemaPath, "utf-8");

const client = new Client({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
});

await client.connect();

try {
  await client.query(schemaSql);
  console.log("Schema applied successfully.");
} finally {
  await client.end();
}
