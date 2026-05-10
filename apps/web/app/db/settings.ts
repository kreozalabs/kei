import { db } from "./index";
import type { SettingKey } from "../types/settings";
import { persistEvent } from "./events";
import { EVENT_TYPES, GLOBAL_SETTINGS_ID } from "../config/constants";

const channel = typeof window !== "undefined" ? new BroadcastChannel("kei_db_sync") : null;

export async function getSetting<T>(key: SettingKey): Promise<T | null> {
  const result = await db.query("SELECT value FROM settings WHERE key = $1", [key]);
  if (result.rows.length === 0) return null;
  const value = (result.rows[0] as { value: unknown }).value;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value);
  } catch {
    return value as unknown as T;
  }
}

export async function setSetting(key: SettingKey, value: unknown) {
  // 1. Persist the event globally
  await persistEvent(GLOBAL_SETTINGS_ID, EVENT_TYPES.SETTING_UPDATED, { key, value });

  // 2. Update the materialized view
  await db.query(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, JSON.stringify(value)]
  );

  if (channel) {
    channel.postMessage({ type: "DB_UPDATED", entity: "settings" });
  }
}

export async function initDefaultSettings(defaults: Record<string, unknown>) {
  const entries = Object.entries(defaults);
  if (entries.length === 0) return;

  const valueStrings: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of entries) {
    valueStrings.push(`($${paramIdx++}, $${paramIdx++})`);
    values.push(key, JSON.stringify(value));
  }

  const insertQuery = `
    INSERT INTO settings (key, value) 
    VALUES ${valueStrings.join(", ")} 
    ON CONFLICT (key) DO NOTHING
  `;

  await db.query(insertQuery, values);
}

export async function rebuildSettings() {
  await db.query("DELETE FROM settings");
  const result = await db.query(
    "SELECT payload FROM events WHERE type = $1 ORDER BY timestamp ASC",
    [EVENT_TYPES.SETTING_UPDATED]
  );
  const rows = result.rows as { payload: string | Record<string, unknown> }[];
  if (rows.length === 0) return;

  const finalSettings = new Map<string, unknown>();
  for (const row of rows) {
    const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    if (payload.key && payload.value !== undefined) {
      finalSettings.set(payload.key, payload.value);
    }
  }

  if (finalSettings.size === 0) return;

  const valueStrings: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of finalSettings.entries()) {
    valueStrings.push(`($${paramIdx++}, $${paramIdx++})`);
    values.push(key, JSON.stringify(value));
  }

  const insertQuery = `
    INSERT INTO settings (key, value) 
    VALUES ${valueStrings.join(", ")}
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;

  await db.query(insertQuery, values);
}
