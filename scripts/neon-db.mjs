import { neon } from "@neondatabase/serverless";
import { existsSync, readFileSync } from "node:fs";
 import { resolve } from "node:path";
import pg from "pg";

function loadEnvFile(file) {
  if (!existsSync(file)) return;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const command = process.argv[2] || "test";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add your Neon connection string to .env.local or Vercel.");
  process.exit(1);
}

const sql = neon(databaseUrl, { fullResults: true });

if (command === "migrate") {
  const schemaPath = resolve(process.cwd(), "scripts/init-neon-schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  const { Client } = pg;
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(schema);
  } finally {
    await client.end();
  }

  console.log("Neon schema applied.");
} else if (command === "test") {
  const version = await sql`SELECT version()`;
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  console.log("Connected to Neon Postgres.");
  console.log(version.rows[0]?.version);
  console.log(`Tables: ${tables.rows.map((row) => row.table_name).join(", ") || "none"}`);
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
