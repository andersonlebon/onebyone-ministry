import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { isDatabaseConfigured } from "./config";
import * as schema from "./schema";

export { isDatabaseConfigured } from "./config";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { db?: Db; sql?: ReturnType<typeof postgres> };

export function getDb(): Db {
  if (!isDatabaseConfigured()) {
    throw new Error("Missing DATABASE_URL");
  }

  if (!globalForDb.db) {
    const url = process.env.DATABASE_URL!;
    // Keep enough headroom for admin mutations + layout refresh without stalling.
    globalForDb.sql = postgres(url, { prepare: false, max: 10, idle_timeout: 20 });
    globalForDb.db = drizzle(globalForDb.sql, { schema });
  }

  return globalForDb.db;
}

export { schema };
