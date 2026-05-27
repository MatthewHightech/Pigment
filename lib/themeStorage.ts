import { expoDb } from "../db";
import type { ColorScheme } from "../theme";

const STORAGE_KEY = "color_scheme";

export function getStoredColorScheme(): ColorScheme | null {
  try {
    const row = expoDb.getFirstSync<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = ?",
      STORAGE_KEY
    );
    if (row?.value === "light" || row?.value === "dark") {
      return row.value;
    }
  } catch {
    // Ignore read errors; default theme applies
  }
  return null;
}

export function setStoredColorScheme(scheme: ColorScheme): void {
  try {
    expoDb.runSync(
      "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      STORAGE_KEY,
      scheme
    );
  } catch {
    // Ignore persistence errors; in-memory theme still works
  }
}
