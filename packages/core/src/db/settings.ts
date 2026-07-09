import type { SettingKey } from "@kreozalabs/kei-core";
import { persistEvent } from "./events";
import { EVENT_TYPES, GLOBAL_SETTINGS_ID } from "@kreozalabs/kei-core";
import type { DatabaseAdapter } from "./adapter";

export async function getSetting<T>(key: SettingKey, adapter: DatabaseAdapter): Promise<T | null> {
  return await adapter.getSetting<T>(key);
}

export async function setSetting(
  key: SettingKey,
  value: unknown,
  deviceId: string,
  adapter: DatabaseAdapter
) {
  adapter.incrementActiveWrites();
  try {
    return await adapter.transaction(async (txAdapter) => {
      // 1. Persist the event globally
      await persistEvent(
        GLOBAL_SETTINGS_ID,
        EVENT_TYPES.SETTING_UPDATED,
        { key, value },
        deviceId,
        txAdapter
      );

      // 2. Update the materialized view
      await txAdapter.upsertSetting(key, value);

      txAdapter.notifyUpdate("settings");
    });
  } finally {
    adapter.decrementActiveWrites();
  }
}

export async function initDefaultSettings(
  defaults: Record<string, unknown>,
  adapter: DatabaseAdapter
) {
  const entries = Object.entries(defaults);
  if (entries.length === 0) return;
  await adapter.saveSettingsBatch(entries);
}

export async function rebuildSettings(adapter: DatabaseAdapter) {
  const events = await adapter.getEvents();
  const settingEvents = events.filter((e) => e.type === EVENT_TYPES.SETTING_UPDATED);

  const finalSettings = new Map<string, unknown>();
  for (const event of settingEvents) {
    const payload = event.payload as Record<string, unknown> | null | undefined;
    if (payload && typeof payload.key === "string" && payload.value !== undefined) {
      finalSettings.set(payload.key, payload.value);
    }
  }

  await adapter.transaction(async (txAdapter) => {
    await txAdapter.clearSettings();

    if (finalSettings.size > 0) {
      // upsert instead of saveSettingsBatch to ensure we overwrite during rebuild
      // or saveSettingsBatch can handle ON CONFLICT DO UPDATE
      await txAdapter.saveSettingsBatch(Array.from(finalSettings.entries()));
    }
  });
}
