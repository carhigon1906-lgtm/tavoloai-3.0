// lib/db.ts
import { Pool } from "pg"

const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error("SUPABASE_DB_URL env var is required to connect to Supabase Postgres")
}

export const supabasePool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function query<T = unknown>(text: string, params?: any[]) {
  const result = await supabasePool.query<T>(text, params)
  return result
}
