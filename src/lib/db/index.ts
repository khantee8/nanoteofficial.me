import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// `@auth/drizzle-adapter` detects the SQL dialect from a real drizzle instance
// at module load, so the instance must be constructed eagerly. The only thing
// that must not happen eagerly is `neon()` *throwing* on a missing connection
// string — that crashed page-data collection for any DB-importing route (e.g.
// /plan/signin) whenever DATABASE_URL was unset, failing the entire site build.
//
// Fall back to a format-valid placeholder URL so construction always succeeds.
// Real requests in any environment with DATABASE_URL set use the real DB; a
// genuinely-missing env only fails the individual DB-backed request at runtime
// (which can't work anyway), never the build or unrelated routes.
const PLACEHOLDER_URL =
  "postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require";

const sql = neon(process.env.DATABASE_URL || PLACEHOLDER_URL);
export const db = drizzle(sql, { schema });
