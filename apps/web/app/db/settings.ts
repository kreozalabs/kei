import { db } from "./index";
import type { SettingKey } from "../types/settings";

export async function getSetting<T>(key: SettingKey): Promise<T | null> {
  const result = await db.query("SELECT value FROM settings WHERE key = $1", [key]);
  if (result.rows.length === 0) return null;
  const value = (result.rows[0] as any).value;
  return typeof value === "string" ? JSON.parse(value) : value;
}

export async function setSetting(key: SettingKey, value: any) {
  await db.query(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, JSON.stringify(value)]
  );
}

export async function initDefaultSettings(defaults: Record<string, any>) {
  for (const [key, value] of Object.entries(defaults)) {
    await db.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
      [key, JSON.stringify(value)]
    );
  }
}
