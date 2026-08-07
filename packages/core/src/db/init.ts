import { DEFAULT_SETTINGS } from "../constants";
import { initDefaultSettings, rebuildSettings } from "./settings";
import { rebuildActions } from "./actions";
import type { DatabaseAdapter } from "./adapter";

export async function initializeDomainData(
  adapter: DatabaseAdapter,
  onProgress?: (detail: string) => void
) {
  // 1. Ensure default settings are populated
  onProgress?.("Populating default domain settings...");
  await initDefaultSettings(DEFAULT_SETTINGS, adapter);

  // 2. Check if we need to rebuild derived data
  onProgress?.("Scanning event log for projections...");
  const events = await adapter.getEvents();
  if (events.length === 0) return;

  // Rebuild actions if the actions projection is empty
  const actions = await adapter.getActions();
  if (actions.length === 0) {
    onProgress?.("Rebuilding action projections from event log...");
    console.log("[Core Init] Actions table is empty. Rebuilding from event log...");
    await rebuildActions(adapter);
  }

  // Rebuild settings if we have settings-related events in the log
  // This ensures custom settings overlay correctly on top of defaults
  const hasSettingsEvents = events.some((e) => e.type === "SETTING_UPDATED");
  if (hasSettingsEvents) {
    onProgress?.("Rebuilding settings projections from event log...");
    console.log("[Core Init] Settings events found. Syncing configurations from event log...");
    await rebuildSettings(adapter);
  }
}
