import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("pigment.db", { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

// Run schema creation on first load (no migrations for simplicity)
const initSql = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hex_value TEXT NOT NULL,
  r_percentage REAL NOT NULL,
  y_percentage REAL NOT NULL,
  b_percentage REAL NOT NULL,
  w_percentage REAL NOT NULL,
  blk_percentage REAL NOT NULL
);
`;
expoDb.execSync(initSql);
