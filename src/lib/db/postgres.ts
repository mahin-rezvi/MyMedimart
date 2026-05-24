import { neon } from "@neondatabase/serverless";

type QueryResult<T = Record<string, unknown>> = {
  rows: T[];
  rowCount: number;
  command?: string;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "production") {
  console.warn("[db] DATABASE_URL is not set. Neon queries will fail until it is configured.");
}

const sql = connectionString
  ? neon(connectionString, { fullResults: true })
  : null;

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  if (!sql) {
    throw new Error("DATABASE_URL is not configured. Add your Neon Postgres connection string.");
  }

  return sql.query(text, params) as Promise<QueryResult<T>>;
}

export async function queryOne<T = Record<string, unknown>>(text: string, params?: unknown[]) {
  const result = await query(text, params);
  return result.rows[0] as T | undefined;
}

export async function queryAll<T = Record<string, unknown>>(text: string, params?: unknown[]) {
  const result = await query(text, params);
  return result.rows as T[];
}

export async function disconnect() {
  // Neon HTTP connections are stateless, so there is no process pool to close.
}

export default sql;
