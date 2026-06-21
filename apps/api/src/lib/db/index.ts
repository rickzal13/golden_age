import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Env } from "../../env";

let db: ReturnType<typeof drizzle> | null = null;

export function createDb(env: Env) {
  if (db) return db;

  const client = postgres(env.DATABASE_URL, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
  });

  db = drizzle({ client });
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialized. Call createDb() first.");
  return db;
}
