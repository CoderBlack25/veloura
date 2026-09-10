/**
 * Postgres connection + Drizzle client, shared across the app.
 *
 * Uses a module-level singleton so hot-reload in dev doesn't open a new
 * connection pool on every file save.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

declare global {
  var __velouraSql: ReturnType<typeof postgres> | undefined;
}

const sqlClient =
  global.__velouraSql ??
  postgres(env.DATABASE_URL, {
    // Neon/Supabase serverless Postgres both work fine over a normal TCP
    // pool for a single Vercel region; switch to a proper pooler (pgbouncer
    // / Neon's pooled connection string) before scaling past one region.
    max: process.env.NODE_ENV === "production" ? 10 : 1,
  });

if (process.env.NODE_ENV !== "production") {
  global.__velouraSql = sqlClient;
}

export const db = drizzle(sqlClient, { schema });
